import { motion } from "framer-motion";
import { ReactNode } from "react";

interface WizardStepProps {
  title: string;
  description?: string;
  children: ReactNode;
}

const WizardStep = ({ title, description, children }: WizardStepProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="glass-strong rounded-3xl p-8 sm:p-12 shadow-elevated border border-glass-border">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 gradient-text">
            {title}
          </h2>
          {description && (
            <p className="text-muted-foreground text-lg mb-8">
              {description}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {children}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default WizardStep;
