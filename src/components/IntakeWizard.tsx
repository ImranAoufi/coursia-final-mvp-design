import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import CompletionMeter from "./CompletionMeter";
import WizardStep from "./wizard/WizardStep";
import OutcomeStep from "./wizard/steps/OutcomeStep";
import AudienceStep from "./wizard/steps/AudienceStep";
import CourseSizeStep from "./wizard/steps/CourseSizeStep";
import MaterialsStep from "./wizard/steps/MaterialsStep";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { soundEngine } from "@/lib/sounds";
import { generatePreviewCourse } from "@/api";
import { sendOutcomeToBackend } from "@/api";
import { sendAudienceToBackend } from "@/api";
import { generateFullCourse } from "@/api";


interface WizardData {
  outcome?: string;
  audience?: string;
  audienceLevel?: string;
  courseSize?: string;
  materials?: string;
  links?: string;
}

const IntakeWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>({});
  const totalSteps = 4;

  const handleNext = (stepData: Partial<WizardData>) => {
    const updatedData = { ...wizardData, ...stepData };
    setWizardData(updatedData);

    if (currentStep === 1 && stepData.outcome) {
      sendOutcomeToBackend(stepData.outcome);
    }

    if (currentStep === 2 && stepData.audience && stepData.audienceLevel) {
      sendAudienceToBackend(stepData.audience, stepData.audienceLevel);
    }

    if (currentStep < totalSteps) {
      soundEngine.playStepForward();
      setCurrentStep(currentStep + 1);
    } else {
      // Wizard completed - navigate to pricing with recommendations
      handleComplete(updatedData);
    }
  };

  const handleComplete = async (data: WizardData) => {
    console.log("🧩 handleComplete triggered! wizardData:", data);
    try {
      //soundEngine.playStepForward();
      console.log("✅ soundEngine ok, continuing...");
      console.log("🚀 Generating AI-powered course preview...");



      const preview = await generatePreviewCourse({
        prompt: `
You are an expert AI course creator.
Use the following information to design the perfect online course:

- Goal/Outcome: ${data.outcome}
- Target Audience: ${data.audience} (${data.audienceLevel})
- Course Size: ${data.courseSize}
- Materials or resources: ${data.materials}
- Reference links or files: ${data.links}

Generate a realistic, engaging, English-only JSON course structure with:
- "lessons": an array of lessons (each with "lesson_title" and "video_titles")
- "quiz": true
- "workbook": true
  `,
        num_lessons:
          data.courseSize === "micro"
            ? 4 // Mittelwert von 3-5
            : data.courseSize === "standard"
              ? 8 // Mittelwert von 6-10
              : 13, // Mittelwert von 12-15
        videos_per_lesson: 2,
        include_quiz: true,
        include_workbook: true,
        format:
          data.courseSize === "micro"
            ? "Micro"
            : data.courseSize === "standard"
              ? "Standard"
              : "Masterclass",
      });

      console.log("✅ Preview generated:", preview);

      // 🔍 Preview sicher parsen
      let parsed;
      try {
        parsed =
          typeof preview.preview === "string"
            ? JSON.parse(preview.preview)
            : preview.preview ?? preview;
      } catch {
        parsed = preview;
      }

      // 💾 Speichern für Preview-Seite
      sessionStorage.setItem(
        "coursia_preview",
        JSON.stringify({
          topic: data.outcome || "Untitled Course",
          lessons: parsed.lessons ?? parsed,
        })
      );

      // 🚀 Automatische Weiterleitung zur Preview-Seite
      navigate("/preview", { state: { preview: parsed } });
      console.log("🚀 Generating full course package...");
      try {
        console.log("🚀 Triggering full course generation in background...");
        const fullCourseResponse = await generateFullCourse();
        console.log("✅ Full course generation started:", fullCourseResponse);
      } catch (err) {
        console.error("⚠️ Could not trigger full course generation:", err);
      }

      try {
        const payload = {
          preview: {
            topic: data.outcome || "Untitled Course",
            lessons: parsed.lessons ?? parsed,
          },
        };
        console.log("📤 Sending full course generation request to backend...");
        const response = await fetch("http://localhost:8080/api/generate-full-course", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        console.log("📥 Full course response status:", response.status);

        const job = await response.json();
        console.log("📦 Full course job started:", job);

        // Optional: du kannst hier warten, bis das ZIP fertig ist
        const interval = setInterval(async () => {
          const statusRes = await fetch(`http://localhost:8080/api/job/${job.jobId}`);
          const statusData = await statusRes.json();

          if (statusData.status === "done") {
            clearInterval(interval);
            console.log("✅ Full course ready!", statusData);
            alert("Your full course package is ready for download!");
            window.open(`http://localhost:8080/generated/${job.jobId}.zip`, "_blank");
          }
        }, 2000);
      } catch (err) {
        console.error("❌ Error generating full course:", err);
      }
    } catch (err) {
      console.error("❌ Error generating preview:", err);
      alert("There was an error generating your course preview.");
    }
  };


  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const steps = [
    {
      id: 1,
      title: "Define Your Transformation",
      description: "What amazing outcome will your students achieve?",
      component: <OutcomeStep onNext={handleNext} />,
    },
    {
      id: 2,
      title: "Know Your Audience",
      description: "Who are you creating this magic for?",
      component: <AudienceStep onNext={handleNext} onBack={handleBack} />,
    },
    {
      id: 3,
      title: "Choose Your Format",
      description: "What's the perfect size for maximum impact?",
      component: <CourseSizeStep onNext={handleNext} onBack={handleBack} />,
    },
    {
      id: 4,
      title: "Share Your Expertise",
      description: "Let's gather your knowledge and materials",
      component: <MaterialsStep onNext={handleNext} onBack={handleBack} />,
    },
  ];

  const currentStepData = steps[currentStep - 1];

  return (
    <div className="min-h-screen">
      <CompletionMeter currentStep={currentStep} totalSteps={totalSteps} />

      {/* Logo and Theme Toggle */}
      <div className="fixed top-6 left-6 z-40 flex items-center gap-4">
        <Logo className="h-8 object-contain animate-glow" />
      </div>

      <div className="fixed top-6 right-6 z-40">
        <ThemeToggle />
      </div>

      {/* Back to Home Button */}
      <div className="fixed bottom-6 left-6 z-40">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="rounded-full hover:bg-accent/50"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      {/* Main content */}
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <WizardStep
            key={currentStep}
            title={currentStepData.title}
            description={currentStepData.description}
          >
            {currentStepData.component}
          </WizardStep>
        </AnimatePresence>

        {/* Step indicators */}
        <div className="flex justify-center gap-2 mt-12">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`h-2 rounded-full transition-all duration-300 ${step.id === currentStep
                ? "w-8 bg-gradient-brand shadow-glow"
                : step.id < currentStep
                  ? "w-2 bg-primary"
                  : "w-2 bg-muted"
                }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default IntakeWizard;  
