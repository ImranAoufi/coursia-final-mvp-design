import { motion } from "framer-motion";

interface CompletionMeterProps {
  currentStep: number;
  totalSteps: number;
}

const CompletionMeter = ({ currentStep, totalSteps }: CompletionMeterProps) => {
  const percentage = Math.round((currentStep / totalSteps) * 100);
  
  const sections = [
    { label: "Creator Inputs", percentage: 35 },
    { label: "Generation", percentage: 45 },
    { label: "Commitments", percentage: 20 },
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
              Course Completion
            </div>
          </div>
          <div className="flex items-center gap-6">
            {sections.map((section, index) => {
              const previousTotal = sections.slice(0, index).reduce((sum, s) => sum + s.percentage, 0);
              const isActive = percentage >= previousTotal;
              
              return (
                <div
                  key={section.label}
                  className={`text-xs transition-all duration-300 ${
                    isActive ? "text-foreground font-medium" : "text-muted-foreground"
                  }`}
                >
                  {section.label}
                </div>
              );
            })}
            <div className="text-xs text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-secondary to-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/50 via-secondary/50 to-primary/50 rounded-full blur-sm"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
};

export default CompletionMeter;
