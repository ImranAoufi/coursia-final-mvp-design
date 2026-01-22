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
  { id: "polishing", label: "Polishing your course...", icon: <Sparkles className="w-5 h-5" /> },
  { id: "finalizing", label: "Finalizing...", icon: <Palette className="w-5 h-5" /> },
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
  "polishing": "polishing",
  "finalizing": "finalizing",
  "done": "finalizing",
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-xl"
        >
          {/* Animated background orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px]"
              animate={{
                x: ["-20%", "20%", "-20%"],
                y: ["-10%", "30%", "-10%"],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              style={{ top: "10%", left: "20%" }}
            />
            <motion.div
              className="absolute w-[400px] h-[400px] rounded-full bg-secondary/20 blur-[100px]"
              animate={{
                x: ["20%", "-20%", "20%"],
                y: ["20%", "-20%", "20%"],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              style={{ bottom: "10%", right: "20%" }}
            />
          </div>

          <div className="relative z-10 w-full max-w-lg mx-4">
            {/* Main card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="glass rounded-3xl p-8 border border-glass-border shadow-elevated"
            >
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow"
                >
                  <Sparkles className="w-8 h-8 text-primary-foreground" />
                </motion.div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                  {title}
                </h2>
                <p className="text-muted-foreground text-sm mt-2">{subtitle}</p>
              </div>

              {/* Progress bar */}
              <div className="mb-8">
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>Progress</span>
                  <span className="font-mono text-primary">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary via-accent to-secondary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-3">
                {steps.map((step, index) => {
                  const isActive = index === activeStepIndex;
                  const isCompleted = index < activeStepIndex;
                  const isPending = index > activeStepIndex;

                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                        isActive
                          ? "bg-primary/10 border border-primary/30"
                          : isCompleted
                          ? "bg-muted/20"
                          : "opacity-40"
                      }`}
                    >
                      {/* Icon */}
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                          isActive
                            ? "bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-glow"
                            : isCompleted
                            ? "bg-primary/20 text-primary"
                            : "bg-muted/30 text-muted-foreground"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : isActive ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          >
                            <Loader2 className="w-5 h-5" />
                          </motion.div>
                        ) : (
                          step.icon
                        )}
                      </div>

                      {/* Label */}
                      <span
                        className={`text-sm font-medium ${
                          isActive
                            ? "text-foreground"
                            : isCompleted
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </span>

                      {/* Active indicator */}
                      {isActive && (
                        <motion.div
                          className="ml-auto flex gap-1"
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Footer message */}
              <motion.p
                className="text-center text-xs text-muted-foreground mt-6"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                This may take a minute. Please don't close this page.
              </motion.p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GenerationLoadingScreen;
