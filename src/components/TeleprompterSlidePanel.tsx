import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Loader2, Layers, Sparkles, Link2, Link2Off } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface SlideContent {
  SlideTitle: string;
  KeyPoints: string[];
  IconDescription: string;
  ColorAccent: string;
}

interface TeleprompterSlidePanelProps {
  lessonId: string | null;
  scriptText: string | null;
  lessonTitle?: string;
  isVisible: boolean;
  scrollProgress?: number; // 0-1 representing teleprompter scroll progress
}

export default function TeleprompterSlidePanel({
  lessonId,
  scriptText,
  lessonTitle,
  isVisible,
  scrollProgress = 0
}: TeleprompterSlidePanelProps) {
  const [slides, setSlides] = useState<SlideContent[]>([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [autoSync, setAutoSync] = useState(true);

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

  // Auto-sync slides based on scroll progress
  useEffect(() => {
    if (!autoSync || slides.length === 0) return;
    
    // Calculate which slide should be shown based on scroll progress
    const slideIndex = Math.min(
      Math.floor(scrollProgress * slides.length),
      slides.length - 1
    );
    
    if (slideIndex !== idx && slideIndex >= 0) {
      setIdx(slideIndex);
    }
  }, [scrollProgress, slides.length, autoSync, idx]);

  // Reset when lesson changes
  useEffect(() => {
    setSlides([]);
    setIdx(0);
    setError(null);
    setHasGenerated(false);
  }, [lessonId]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible || slides.length === 0) return;
      
      if (e.key === "ArrowLeft") {
        setAutoSync(false);
        setIdx(prev => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight") {
        setAutoSync(false);
        setIdx(prev => Math.min(slides.length - 1, prev + 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, slides.length]);

  if (!isVisible) return null;

  const currentSlide = slides[idx];

  // Icon mapping for slide context
  const getIconColor = (color: string) => {
    const colorMap: Record<string, string> = {
      "#4A90E2": "from-blue-500/30 to-blue-600/10",
      "#7C3AED": "from-purple-500/30 to-purple-600/10",
      "#10B981": "from-emerald-500/30 to-emerald-600/10",
      "#F59E0B": "from-amber-500/30 to-amber-600/10",
      "#EF4444": "from-red-500/30 to-red-600/10",
    };
    return colorMap[color] || "from-primary/30 to-primary/10";
  };

  const handleManualNav = (newIdx: number) => {
    setAutoSync(false);
    setIdx(newIdx);
  };

  return (
    <div className="w-full">
      {/* Slide Container - Horizontal layout */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-white/90">Slides</span>
            {slides.length > 0 && (
              <span className="text-xs text-white/50 bg-white/10 px-2 py-0.5 rounded-full">
                {idx + 1} / {slides.length}
              </span>
            )}
          </div>
          
          {/* Auto-sync toggle */}
          {slides.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAutoSync(!autoSync)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                autoSync 
                  ? "bg-primary/20 text-primary border border-primary/30" 
                  : "bg-white/10 text-white/60 border border-white/10 hover:border-white/20"
              }`}
            >
              {autoSync ? <Link2 className="w-3 h-3" /> : <Link2Off className="w-3 h-3" />}
              {autoSync ? "Auto-sync" : "Manual"}
            </motion.button>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="h-40 flex flex-col items-center justify-center gap-3 px-6">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              </div>
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-primary/30"
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <p className="text-sm text-white/70">Generating slides...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="h-32 flex flex-col items-center justify-center gap-2 px-6 text-center">
            <Layers className="w-6 h-6 text-white/40" />
            <p className="text-sm text-white/60">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && slides.length === 0 && (
          <div className="h-32 flex flex-col items-center justify-center gap-2 px-6 text-center">
            <Sparkles className="w-6 h-6 text-white/30" />
            <p className="text-sm text-white/50">Slides will appear here</p>
          </div>
        )}

        {/* Slide Display - Horizontal card */}
        {!loading && !error && currentSlide && (
          <div className="relative p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex gap-6"
              >
                {/* Color accent & gradient background */}
                <div 
                  className={`absolute inset-0 rounded-xl bg-gradient-to-r ${getIconColor(currentSlide.ColorAccent)} opacity-40`}
                />
                
                {/* Left - Title & Icon */}
                <div className="relative z-10 flex flex-col justify-center min-w-[180px] pr-4 border-r border-white/10">
                  <div 
                    className="w-3 h-3 rounded-full mb-3"
                    style={{ backgroundColor: currentSlide.ColorAccent }}
                  />
                  <h4 
                    className="text-lg font-bold leading-tight"
                    style={{ color: currentSlide.ColorAccent }}
                  >
                    {currentSlide.SlideTitle}
                  </h4>
                </div>
                
                {/* Right - Key Points */}
                <div className="relative z-10 flex-1 py-1">
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                    {currentSlide.KeyPoints.slice(0, 6).map((point, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-start gap-2 text-sm leading-relaxed text-white/85"
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
                  onClick={() => handleManualNav(Math.max(0, idx - 1))}
                  disabled={idx === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full 
                    bg-black/60 backdrop-blur-sm border border-white/20 shadow-lg
                    flex items-center justify-center transition-all
                    hover:bg-black/80 hover:scale-110 disabled:opacity-30 disabled:hover:scale-100"
                >
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => handleManualNav(Math.min(slides.length - 1, idx + 1))}
                  disabled={idx === slides.length - 1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full 
                    bg-black/60 backdrop-blur-sm border border-white/20 shadow-lg
                    flex items-center justify-center transition-all
                    hover:bg-black/80 hover:scale-110 disabled:opacity-30 disabled:hover:scale-100"
                >
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
              </>
            )}
          </div>
        )}

        {/* Thumbnail Strip */}
        {slides.length > 1 && (
          <div className="flex gap-1.5 overflow-x-auto px-4 pb-3 pt-1 border-t border-white/5">
            {slides.map((slide, i) => (
              <button
                key={i}
                onClick={() => handleManualNav(i)}
                className={`shrink-0 w-10 h-7 rounded-md overflow-hidden transition-all border-2 ${
                  i === idx 
                    ? "border-primary ring-2 ring-primary/30 scale-110" 
                    : "border-white/10 opacity-50 hover:opacity-80 hover:border-white/30"
                }`}
              >
                <div 
                  className="w-full h-full flex items-center justify-center text-[9px] font-bold"
                  style={{ 
                    backgroundColor: slide.ColorAccent + "20",
                    color: slide.ColorAccent
                  }}
                >
                  {i + 1}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Keyboard Hint */}
      {slides.length > 1 && (
        <p className="text-[10px] text-white/40 text-center mt-2">
          ← → to navigate • {autoSync ? "Slides sync with teleprompter" : "Manual mode"}
        </p>
      )}
    </div>
  );
}
