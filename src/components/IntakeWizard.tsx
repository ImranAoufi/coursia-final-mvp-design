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
import logoFull from "@/assets/logo-full.png";
import { soundEngine } from "@/lib/sounds";

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
    
    if (currentStep < totalSteps) {
      soundEngine.playStepForward();
      setCurrentStep(currentStep + 1);
    } else {
      // Wizard completed - navigate to pricing with recommendations
      handleComplete(updatedData);
    }
  };

  const handleComplete = (data: WizardData) => {
    // Determine recommended plan based on wizard data
    let recommended = "Starter";
    
    // Logic for recommendations
    if (data.courseSize === "mini" || data.courseSize === "micro") {
      recommended = "Free";
    } else if (data.courseSize === "standard" && data.audienceLevel === "beginner") {
      recommended = "Starter";
    } else if (data.courseSize === "comprehensive" || data.audienceLevel === "advanced") {
      recommended = "Pro";
    }
    
    // Navigate to pricing with wizard data and recommendation
    navigate("/pricing", {
      state: {
        wizardData: data,
        recommended: recommended
      }
    });
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

      {/* Logo */}
      <div className="fixed top-6 left-6 z-40">
        <img src={logoFull} alt="Coursia" className="h-8 object-contain animate-glow" />
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
              className={`h-2 rounded-full transition-all duration-300 ${
                step.id === currentStep
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
