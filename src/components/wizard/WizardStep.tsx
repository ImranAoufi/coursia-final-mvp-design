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
      initial={{ opacity: 0, x: 60, scale: 0.95, filter: "blur(10px)" }}
      animate={{ 
        opacity: 1, 
        x: 0, 
        scale: 1, 
        filter: "blur(0px)",
        transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
      }}
      exit={{ 
        opacity: 0, 
        x: -60, 
        scale: 0.95, 
        filter: "blur(10px)",
        transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
      }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="glass-strong rounded-3xl p-8 sm:p-12 shadow-elevated border border-glass-border overflow-hidden">
        <motion.h2 
          className="text-3xl sm:text-4xl font-bold mb-3 gradient-text"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          {title}
        </motion.h2>
        {description && (
          <motion.p 
            className="text-muted-foreground text-lg mb-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
          >
            {description}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          {children}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default WizardStep;
