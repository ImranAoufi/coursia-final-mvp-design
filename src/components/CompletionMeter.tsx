import { motion } from "framer-motion";

interface CompletionMeterProps {
  currentStep: number;
  totalSteps: number;
}

const CompletionMeter = ({ currentStep, totalSteps }: CompletionMeterProps) => {
  const percentage = Math.round((currentStep / totalSteps) * 100);
  
  const sections = [
    { label: "Creator Inputs", percentage: 35, color: "from-primary to-accent" },
    { label: "Generation", percentage: 45, color: "from-accent to-secondary" },
    { label: "Commitments", percentage: 20, color: "from-secondary to-secondary-glow" },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-glass-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold gradient-text">
              {percentage}%
            </div>
            <div className="text-sm text-muted-foreground">
              Course Completion Progress
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Step {currentStep} of {totalSteps}
          </div>
        </div>

        {/* Progress bar with sections */}
        <div className="relative h-3 rounded-full bg-muted/20 overflow-hidden">
          {/* Animated gradient background */}
          <motion.div
            className="absolute inset-0 bg-gradient-brand opacity-20"
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          
          {/* Actual progress */}
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-brand rounded-full shadow-glow"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>

        {/* Section labels */}
        <div className="flex justify-between mt-2 text-xs">
          {sections.map((section, index) => {
            const previousTotal = sections.slice(0, index).reduce((sum, s) => sum + s.percentage, 0);
            const isActive = percentage >= previousTotal;
            
            return (
              <div
                key={section.label}
                className={`transition-all duration-300 ${
                  isActive ? "text-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                {section.label} ({section.percentage}%)
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CompletionMeter;
