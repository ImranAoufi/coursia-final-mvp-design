// FILE: src/components/GenerationLoadingScreen.tsx
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, 
  FileText, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  Loader2,
  Layers,
  Palette,
  GraduationCap
} from "lucide-react";

export interface GenerationStep {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface GenerationLoadingScreenProps {
  isOpen: boolean;
  currentStep: string;
  progress: number;
  title?: string;
  subtitle?: string;
  steps?: GenerationStep[];
}

const defaultSteps: GenerationStep[] = [
  { id: "analyzing", label: "Analyzing your content...", icon: <Brain className="w-5 h-5" /> },
  { id: "structuring", label: "Structuring course outline...", icon: <Layers className="w-5 h-5" /> },
  { id: "generating_scripts", label: "Generating lesson scripts...", icon: <FileText className="w-5 h-5" /> },
  { id: "creating_quizzes", label: "Creating quizzes...", icon: <GraduationCap className="w-5 h-5" /> },
  { id: "building_workbooks", label: "Building workbooks...", icon: <BookOpen className="w-5 h-5" /> },
  { id: "creating_branding", label: "Creating logo & banner...", icon: <Palette className="w-5 h-5" /> },
  { id: "polishing", label: "Polishing your course...", icon: <Sparkles className="w-5 h-5" /> },
];

const stepMappings: Record<string, string> = {
  // Preview generation steps
  "starting": "analyzing",
  "queued": "analyzing",
  "processing": "analyzing",
  "generating": "structuring",
  "scripts": "generating_scripts",
  "quizzes": "creating_quizzes",
  "workbooks": "building_workbooks",
  "running": "generating_scripts",
  "branding": "creating_branding",
  "creating_branding": "creating_branding",
  "polishing": "polishing",
  "finalizing": "polishing",
  "done": "polishing",
};

function getActiveStepIndex(currentStep: string, steps: GenerationStep[]): number {
  const normalizedStep = currentStep.toLowerCase();
  
  // Direct match
  const directIndex = steps.findIndex(s => s.id === normalizedStep);
  if (directIndex >= 0) return directIndex;
  
  // Mapping match
  for (const [key, mappedId] of Object.entries(stepMappings)) {
    if (normalizedStep.includes(key)) {
      const mappedIndex = steps.findIndex(s => s.id === mappedId);
      if (mappedIndex >= 0) return mappedIndex;
    }
  }
  
  // Default to first step
  return 0;
}

const GenerationLoadingScreen = ({
  isOpen,
  currentStep,
  progress,
  title = "Creating Your Course",
  subtitle = "Our AI is crafting your personalized learning experience",
  steps = defaultSteps,
}: GenerationLoadingScreenProps) => {
  const activeStepIndex = getActiveStepIndex(currentStep, steps);
  const activeStep = steps[activeStepIndex] || steps[0];
  const completedCount = activeStepIndex;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/98 backdrop-blur-2xl"
        >
          {/* Animated background orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute w-[600px] h-[600px] rounded-full bg-primary/15 blur-[150px]"
              animate={{
                x: ["-30%", "30%", "-30%"],
                y: ["-20%", "40%", "-20%"],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
              style={{ top: "0%", left: "10%" }}
            />
            <motion.div
              className="absolute w-[500px] h-[500px] rounded-full bg-secondary/15 blur-[130px]"
              animate={{
                x: ["30%", "-30%", "30%"],
                y: ["30%", "-30%", "30%"],
                scale: [1.1, 1, 1.1],
              }}
              transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
              style={{ bottom: "0%", right: "10%" }}
            />
            <motion.div
              className="absolute w-[300px] h-[300px] rounded-full bg-accent/10 blur-[100px]"
              animate={{
                x: ["-20%", "20%", "-20%"],
                y: ["20%", "-20%", "20%"],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              style={{ top: "40%", left: "50%" }}
            />
          </div>

          <div className="relative z-10 w-full max-w-md mx-4">
            {/* Main card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-10 shadow-2xl backdrop-blur-xl"
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />

              <div className="relative z-10">
                {/* Central animated icon */}
                <div className="flex justify-center mb-8">
                  <motion.div
                    className="relative"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  >
                    {/* Outer ring */}
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-primary/30"
                      style={{ width: 100, height: 100, margin: -10 }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    />
                    {/* Inner glow */}
                    <motion.div
                      className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{ width: 80, height: 80 }}
                    />
                    {/* Main icon container */}
                    <motion.div
                      className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary via-primary to-secondary flex items-center justify-center shadow-lg"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeStep.id}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                          className="text-primary-foreground"
                        >
                          {activeStep.icon ? (
                            <div className="w-8 h-8 [&>svg]:w-8 [&>svg]:h-8">{activeStep.icon}</div>
                          ) : (
                            <Sparkles className="w-8 h-8" />
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </motion.div>
                  </motion.div>
                </div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center text-2xl font-bold text-foreground mb-2"
                >
                  {title}
                </motion.h2>

                {/* Current step - single display */}
                <div className="h-16 flex items-center justify-center mb-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeStep.id}
                      initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                      transition={{ duration: 0.4 }}
                      className="text-center"
                    >
                      <p className="text-lg font-medium text-primary">{activeStep.label}</p>
                      <motion.div
                        className="flex justify-center gap-1.5 mt-2"
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <motion.span 
                          className="w-2 h-2 rounded-full bg-primary"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        />
                        <motion.span 
                          className="w-2 h-2 rounded-full bg-primary"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.span 
                          className="w-2 h-2 rounded-full bg-primary"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        />
                      </motion.div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Progress section */}
                <div className="space-y-3">
                  {/* Progress bar */}
                  <div className="relative h-3 bg-muted/20 rounded-full overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-accent to-secondary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                    {/* Shimmer on progress bar */}
                    <motion.div
                      className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ["-100%", "500%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                  </div>

                  {/* Progress info */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      Step {completedCount + 1} of {steps.length}
                    </span>
                    <span className="font-mono font-semibold text-primary">
                      {Math.round(progress)}%
                    </span>
                  </div>
                </div>

                {/* Step indicators */}
                <div className="flex justify-center gap-2 mt-6">
                  {steps.map((step, index) => (
                    <motion.div
                      key={step.id}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        index < activeStepIndex
                          ? "w-6 bg-primary"
                          : index === activeStepIndex
                          ? "w-8 bg-gradient-to-r from-primary to-secondary"
                          : "w-2 bg-muted/40"
                      }`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    />
                  ))}
                </div>

                {/* Footer message */}
                <motion.p
                  className="text-center text-xs text-muted-foreground mt-8"
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  This may take a minute. Please don't close this page.
                </motion.p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GenerationLoadingScreen;
