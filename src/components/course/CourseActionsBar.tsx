import { motion } from "framer-motion";
import { Layers, Film, Brain, RefreshCw, Store, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CourseActionsBarProps {
  lessonsCount: number;
  videosCount: number;
  quizzesCount: number;
  onRegenerateBranding: () => void;
  onPublish: () => void;
  isBrandingGenerating?: boolean;
  isPublishing?: boolean;
}

export function CourseActionsBar({
  lessonsCount,
  videosCount,
  quizzesCount,
  onRegenerateBranding,
  onPublish,
  isBrandingGenerating = false,
  isPublishing = false,
}: CourseActionsBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="glass-strong rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6"
    >
      <div className="flex flex-col gap-4 sm:gap-6">
        {/* Stats row */}
        <div className="flex items-center justify-around sm:justify-start gap-4 sm:gap-6">
          <span className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            </div>
            <span className="font-medium">{lessonsCount}</span>
            <span className="text-muted-foreground hidden sm:inline">Lessons</span>
          </span>
          <span className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Film className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary" />
            </div>
            <span className="font-medium">{videosCount}</span>
            <span className="text-muted-foreground hidden sm:inline">Videos</span>
          </span>
          <span className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
            </div>
            <span className="font-medium">{quizzesCount}</span>
            <span className="text-muted-foreground hidden sm:inline">Quizzes</span>
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 sm:justify-end">
          {/* Regenerate Branding button */}
          <Button
            variant="outline"
            size="sm"
            disabled={isBrandingGenerating}
            onClick={onRegenerateBranding}
            className="flex items-center justify-center gap-2 text-xs sm:text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isBrandingGenerating ? 'animate-spin' : ''}`} />
            {isBrandingGenerating ? 'Regenerating...' : 'Regenerate Branding'}
          </Button>

          {/* Premium Launch to Marketplace button with animations */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onPublish}
            disabled={isPublishing}
            className="relative group px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-semibold text-white overflow-hidden disabled:opacity-50 shadow-lg hover:shadow-glow transition-shadow duration-500 text-sm"
          >
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-brand animate-gradient-x" />
            
            {/* Glow effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 bg-gradient-brand opacity-50 blur-xl" />
            </div>
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            </div>

            {/* Sparkle particles */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              <div className="absolute top-1 left-4 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDuration: '1.5s' }} />
              <div className="absolute top-3 right-6 w-1.5 h-1.5 bg-white rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '0.3s' }} />
              <div className="absolute bottom-2 left-8 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDuration: '1.8s', animationDelay: '0.5s' }} />
            </div>
            
            {/* Content */}
            <span className="relative flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm">
              {isPublishing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Store className="w-4 h-4" />
                  Launch to Marketplace
                  <Rocket className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                </>
              )}
            </span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
