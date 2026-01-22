// FILE: src/components/GenerationLoadingScreen.tsx
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, 
  FileText, 
  Sparkles, 
  BookOpen, 
  Layers,
  Palette,
  GraduationCap,
  Wand2
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
  { id: "analyzing", label: "Analyzing your content", icon: <Brain className="w-8 h-8" /> },
  { id: "structuring", label: "Structuring course outline", icon: <Layers className="w-8 h-8" /> },
  { id: "generating_scripts", label: "Writing lesson scripts", icon: <FileText className="w-8 h-8" /> },
  { id: "creating_quizzes", label: "Creating quizzes", icon: <GraduationCap className="w-8 h-8" /> },
  { id: "building_workbooks", label: "Building workbooks", icon: <BookOpen className="w-8 h-8" /> },
  { id: "polishing", label: "Polishing your course", icon: <Sparkles className="w-8 h-8" /> },
  { id: "finalizing", label: "Finalizing", icon: <Palette className="w-8 h-8" /> },
];

const stepMappings: Record<string, string> = {
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
  
  const directIndex = steps.findIndex(s => s.id === normalizedStep);
  if (directIndex >= 0) return directIndex;
  
  for (const [key, mappedId] of Object.entries(stepMappings)) {
    if (normalizedStep.includes(key)) {
      const mappedIndex = steps.findIndex(s => s.id === mappedId);
      if (mappedIndex >= 0) return mappedIndex;
    }
  }
  
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
  const activeStep = steps[activeStepIndex];
  const completedSteps = activeStepIndex;
  const totalSteps = steps.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background"
        >
          {/* Premium animated background */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Deep gradient base */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
            
            {/* Floating orbs */}
            <motion.div
              className="absolute w-[600px] h-[600px] rounded-full"
              style={{
                background: "radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)",
                top: "5%",
                left: "10%",
              }}
              animate={{
                x: [0, 100, 0],
                y: [0, 50, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute w-[500px] h-[500px] rounded-full"
              style={{
                background: "radial-gradient(circle, hsl(var(--secondary) / 0.12) 0%, transparent 70%)",
                bottom: "10%",
                right: "5%",
              }}
              animate={{
                x: [0, -80, 0],
                y: [0, -60, 0],
                scale: [1, 1.15, 1],
              }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute w-[400px] h-[400px] rounded-full"
              style={{
                background: "radial-gradient(circle, hsl(var(--accent) / 0.1) 0%, transparent 70%)",
                top: "40%",
                right: "30%",
              }}
              animate={{
                x: [0, 60, 0],
                y: [0, -40, 0],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Subtle grid pattern */}
            <div 
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                                  linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
                backgroundSize: "60px 60px",
              }}
            />
          </div>

          {/* Content */}
          <div className="relative z-10 w-full max-w-md mx-4 text-center">
            {/* Animated icon container */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative mx-auto mb-8"
            >
              {/* Outer glow ring */}
              <motion.div
                className="absolute inset-0 w-32 h-32 mx-auto rounded-full"
                style={{
                  background: "conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--accent)), hsl(var(--primary)))",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Inner container */}
              <div className="relative w-32 h-32 mx-auto rounded-full bg-background flex items-center justify-center" style={{ margin: "2px" }}>
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center border border-border/50">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeStep.id}
                      initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      exit={{ scale: 0.5, opacity: 0, rotate: 20 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="text-primary"
                    >
                      {activeStep.icon}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Floating particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-primary/40"
                  style={{
                    top: "50%",
                    left: "50%",
                  }}
                  animate={{
                    x: [0, Math.cos((i / 6) * Math.PI * 2) * 80],
                    y: [0, Math.sin((i / 6) * Math.PI * 2) * 80],
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "easeOut",
                  }}
                />
              ))}
            </motion.div>

            {/* Current step label */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="mb-6"
              >
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent mb-2">
                  {activeStep.label}
                </h2>
                <motion.div 
                  className="flex items-center justify-center gap-2 text-muted-foreground"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Wand2 className="w-4 h-4" />
                  <span className="text-sm">AI is working its magic...</span>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Progress section */}
            <div className="space-y-4">
              {/* Step counter */}
              <div className="flex items-center justify-center gap-3">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Step</span>
                <div className="flex items-center gap-1 font-mono">
                  <span className="text-2xl font-bold text-primary">{completedSteps + 1}</span>
                  <span className="text-muted-foreground">/</span>
                  <span className="text-lg text-muted-foreground">{totalSteps}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative">
                <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--secondary)))",
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                
                {/* Glowing dot at progress end */}
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary shadow-glow"
                  style={{ left: `${Math.min(progress, 98)}%` }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </div>

              {/* Percentage */}
              <motion.div 
                className="text-4xl font-bold font-mono text-foreground"
                key={Math.round(progress)}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
              >
                {Math.round(progress)}%
              </motion.div>
            </div>

            {/* Step dots indicator */}
            <div className="flex items-center justify-center gap-2 mt-8">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index < activeStepIndex
                      ? "w-6 bg-primary"
                      : index === activeStepIndex
                      ? "w-8 bg-gradient-to-r from-primary to-secondary"
                      : "w-1.5 bg-muted/40"
                  }`}
                  animate={index === activeStepIndex ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              ))}
            </div>

            {/* Footer message */}
            <motion.p
              className="text-xs text-muted-foreground mt-8"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Please don't close this page
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GenerationLoadingScreen;
