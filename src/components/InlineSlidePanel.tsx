import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Layers, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface SlideContent {
  SlideTitle: string;
  KeyPoints: string[];
  IconDescription: string;
  ColorAccent: string;
}

interface InlineSlidePanelProps {
  lessonId: string | null;
  scriptText: string | null;
  lessonTitle?: string;
  isVisible: boolean;
}

export default function InlineSlidePanel({
  lessonId,
  scriptText,
  lessonTitle,
  isVisible
}: InlineSlidePanelProps) {
  const [slides, setSlides] = useState<SlideContent[]>([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  useEffect(() => {
    if (!isVisible || !lessonId || !scriptText || hasGenerated) return;
    if (scriptText.trim().length < 50) {
      setError("Script too short to generate slides");
      return;
    }

    setLoading(true);
    setError(null);
    setHasGenerated(true);

    supabase.functions.invoke("generate-slides", {
      body: {
        lesson_id: lessonId,
        script_text: scriptText,
        title: lessonTitle || "Lesson",
        preferred_style: "apple"
      }
    })
      .then(({ data, error: fnError }) => {
        if (fnError) {
          console.error("Edge function error:", fnError);
          setError("Failed to generate slides");
          return;
        }
        
        if (data?.slides && Array.isArray(data.slides) && data.slides.length > 0) {
          setSlides(data.slides);
          setIdx(0);
        } else {
          setError("No slides generated");
        }
      })
      .catch((e) => {
        console.error("Slides generation error:", e);
        setError("Failed to generate slides");
      })
      .finally(() => setLoading(false));
  }, [isVisible, lessonId, scriptText, lessonTitle, hasGenerated]);

  // Reset when lesson changes
  useEffect(() => {
    setSlides([]);
    setIdx(0);
    setError(null);
    setHasGenerated(false);
  }, [lessonId]);

  if (!isVisible) return null;

  const currentSlide = slides[idx];

  // Icon mapping for slide context
  const getIconColor = (color: string) => {
    const colorMap: Record<string, string> = {
      "#4A90E2": "from-blue-500/20 to-blue-600/10",
      "#7C3AED": "from-purple-500/20 to-purple-600/10",
      "#10B981": "from-emerald-500/20 to-emerald-600/10",
      "#F59E0B": "from-amber-500/20 to-amber-600/10",
      "#EF4444": "from-red-500/20 to-red-600/10",
    };
    return colorMap[color] || "from-primary/20 to-primary/10";
  };

  return (
    <div className="w-[320px] flex flex-col gap-3 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          AI Slides
        </h3>
        {slides.length > 0 && (
          <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
            {idx + 1} / {slides.length}
          </span>
        )}
      </div>

      {/* Slide Container */}
      <div className="relative rounded-2xl overflow-hidden border border-border/50 bg-gradient-to-br from-background to-muted/20 shadow-xl">
        {/* Loading State */}
        {loading && (
          <div className="aspect-[4/3] flex flex-col items-center justify-center gap-3 p-6">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-primary/30"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Generating slides...</p>
              <p className="text-xs text-muted-foreground mt-1">AI is creating your presentation</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="aspect-[4/3] flex flex-col items-center justify-center gap-2 p-6 text-center">
            <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
              <Layers className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && slides.length === 0 && (
          <div className="aspect-[4/3] flex flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
              <Sparkles className="w-5 h-5 text-primary/50" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Slides will appear here</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Generated from your script</p>
            </div>
          </div>
        )}

        {/* Slide Display */}
        {!loading && !error && currentSlide && (
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="aspect-[4/3] p-5 flex flex-col"
              >
                {/* Color accent bar */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                  style={{ backgroundColor: currentSlide.ColorAccent }}
                />
                
                {/* Gradient background based on accent color */}
                <div 
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${getIconColor(currentSlide.ColorAccent)} opacity-50`}
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full">
                  {/* Title */}
                  <h4 
                    className="text-base font-bold leading-tight mb-3"
                    style={{ color: currentSlide.ColorAccent }}
                  >
                    {currentSlide.SlideTitle}
                  </h4>
                  
                  {/* Key Points */}
                  <ul className="space-y-1.5 flex-1 overflow-hidden">
                    {currentSlide.KeyPoints.slice(0, 5).map((point, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-2 text-xs leading-relaxed text-foreground/85"
                      >
                        <span 
                          className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: currentSlide.ColorAccent }}
                        />
                        <span className="line-clamp-2">{point}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            {slides.length > 1 && (
              <>
                <button
                  onClick={() => setIdx(Math.max(0, idx - 1))}
                  disabled={idx === 0}
                  className="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full 
                    bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg
                    flex items-center justify-center transition-all
                    hover:bg-background hover:scale-110 disabled:opacity-30 disabled:hover:scale-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIdx(Math.min(slides.length - 1, idx + 1))}
                  disabled={idx === slides.length - 1}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full 
                    bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg
                    flex items-center justify-center transition-all
                    hover:bg-background hover:scale-110 disabled:opacity-30 disabled:hover:scale-100"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {slides.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 px-1">
          {slides.map((slide, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`shrink-0 w-12 h-9 rounded-lg overflow-hidden transition-all border-2 ${
                i === idx 
                  ? "border-primary ring-2 ring-primary/20 scale-105" 
                  : "border-border/30 opacity-60 hover:opacity-100 hover:border-border"
              }`}
            >
              <div 
                className="w-full h-full flex items-center justify-center text-[8px] font-bold p-1"
                style={{ 
                  backgroundColor: slide.ColorAccent + "15",
                  color: slide.ColorAccent
                }}
              >
                {i + 1}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Keyboard Hint */}
      {slides.length > 1 && (
        <p className="text-[10px] text-muted-foreground/60 text-center">
          Use ← → to navigate slides
        </p>
      )}
    </div>
  );
}
