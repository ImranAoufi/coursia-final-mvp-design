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
import GenerationLoadingScreen from "./GenerationLoadingScreen";
import { useJobProgress } from "@/hooks/useJobProgress";


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
  
  const { 
    jobId, 
    isLoading, 
    createJob, 
    updateJobProgress, 
    completeJob, 
    failJob 
  } = useJobProgress();

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
      // Create a job for tracking progress
      const newJobId = await createJob('preview');
      if (!newJobId) {
        throw new Error("Failed to create progress job");
      }

      // Step 1: Analyzing requirements
      await updateJobProgress(newJobId, 10, 'Analyzing your requirements...');
      
      // Step 2: Crafting outline
      await updateJobProgress(newJobId, 25, 'Crafting course outline...');

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
            ? 4
            : data.courseSize === "standard"
              ? 8
              : 13,
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

      // Step 3: Generating lessons
      await updateJobProgress(newJobId, 60, 'Generating lesson content...');

      console.log("✅ Preview generated:", preview);

      // Parse preview
      let parsed;
      try {
        parsed =
          typeof preview.preview === "string"
            ? JSON.parse(preview.preview)
            : preview.preview ?? preview;
      } catch {
        parsed = preview;
      }

      // Step 4: Finalizing
      await updateJobProgress(newJobId, 90, 'Finalizing your course...');

      // Store for Preview page
      const resultData = {
        topic: data.outcome || "Untitled Course",
        lessons: parsed.lessons ?? parsed,
      };
      
      sessionStorage.setItem("coursia_preview", JSON.stringify(resultData));

      // Complete the job
      await completeJob(newJobId, resultData);

    } catch (err) {
      console.error("❌ Error generating preview:", err);
      if (jobId) {
        await failJob(jobId, err instanceof Error ? err.message : "Unknown error");
      }
    }
  };

  const handleLoadingComplete = (resultData: any) => {
    navigate("/preview", { state: { preview: resultData } });
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
    <>
      {/* Loading Screen */}
      {isLoading && jobId && (
        <GenerationLoadingScreen
          jobId={jobId}
          onComplete={handleLoadingComplete}
          onError={(error) => {
            console.error("Generation failed:", error);
          }}
          title="Creating Your Course Preview"
        />
      )}

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
    </>
  );
};

export default IntakeWizard;
