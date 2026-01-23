import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Loader2, Presentation, Link2, Link2Off } from "lucide-react";
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
  scrollProgress?: number;
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

  const handleManualNav = (newIdx: number) => {
    setAutoSync(false);
    setIdx(newIdx);
  };

  return (
    <div className="w-full px-2">
      {/* Apple Keynote-style slide container */}
      <div className="relative">
        {/* Main Slide Card */}
        <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden"
             style={{ 
               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.1)' 
             }}>
          
          {/* Slide Header Bar */}
          <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-neutral-100 to-neutral-50 border-b border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              {slides.length > 0 && (
                <span className="text-sm font-semibold text-neutral-600 tracking-tight">
                  Slide {idx + 1} of {slides.length}
                </span>
              )}
            </div>
            
            {/* Sync Toggle */}
            {slides.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setAutoSync(!autoSync)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  autoSync 
                    ? "bg-blue-500 text-white shadow-md shadow-blue-500/30" 
                    : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300"
                }`}
              >
                {autoSync ? <Link2 className="w-3.5 h-3.5" /> : <Link2Off className="w-3.5 h-3.5" />}
                {autoSync ? "Synced" : "Manual"}
              </motion.button>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="h-72 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-neutral-50 to-white">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 rounded-full border-4 border-neutral-200 border-t-blue-500"
              />
              <p className="text-sm font-medium text-neutral-500">Generating slides...</p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="h-72 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-neutral-50 to-white">
              <Presentation className="w-8 h-8 text-neutral-300" />
              <p className="text-sm text-neutral-500">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && slides.length === 0 && (
            <div className="h-72 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-neutral-50 to-white">
              <Presentation className="w-8 h-8 text-neutral-300" />
              <p className="text-sm text-neutral-400">Slides will appear here</p>
            </div>
          )}

          {/* Slide Content */}
          {!loading && !error && currentSlide && (
            <div className="relative min-h-[320px] bg-white">
              <AnimatePresence mode="wait">
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="p-8"
                >
                  {/* Accent Line */}
                  <div 
                    className="w-16 h-1.5 rounded-full mb-6"
                    style={{ backgroundColor: currentSlide.ColorAccent }}
                  />
                  
                  {/* Title */}
                  <h2 className="text-3xl font-bold text-neutral-900 tracking-tight mb-6 leading-tight">
                    {currentSlide.SlideTitle}
                  </h2>
                  
                  {/* Key Points - Clean Grid */}
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    {currentSlide.KeyPoints.slice(0, 6).map((point, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.2 }}
                        className="flex items-start gap-3"
                      >
                        <div 
                          className="mt-2 w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: currentSlide.ColorAccent }}
                        />
                        <span className="text-base text-neutral-700 leading-relaxed">
                          {point}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Arrows - Clean style */}
              {slides.length > 1 && (
                <>
                  <button
                    onClick={() => handleManualNav(Math.max(0, idx - 1))}
                    disabled={idx === 0}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full 
                      bg-neutral-900/5 backdrop-blur-sm
                      flex items-center justify-center transition-all
                      hover:bg-neutral-900/10 hover:scale-110 disabled:opacity-20 disabled:hover:scale-100"
                  >
                    <ChevronLeft className="w-5 h-5 text-neutral-600" />
                  </button>
                  <button
                    onClick={() => handleManualNav(Math.min(slides.length - 1, idx + 1))}
                    disabled={idx === slides.length - 1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full 
                      bg-neutral-900/5 backdrop-blur-sm
                      flex items-center justify-center transition-all
                      hover:bg-neutral-900/10 hover:scale-110 disabled:opacity-20 disabled:hover:scale-100"
                  >
                    <ChevronRight className="w-5 h-5 text-neutral-600" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Thumbnail Strip - Below slide */}
        {slides.length > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            {slides.map((slide, i) => (
              <motion.button
                key={i}
                onClick={() => handleManualNav(i)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`relative w-14 h-10 rounded-lg overflow-hidden transition-all duration-200 ${
                  i === idx 
                    ? "ring-2 ring-white shadow-lg" 
                    : "opacity-60 hover:opacity-90"
                }`}
              >
                {/* Mini slide preview */}
                <div className="w-full h-full bg-white border border-neutral-200 flex flex-col items-start justify-center p-1.5">
                  <div 
                    className="w-4 h-0.5 rounded-full mb-1"
                    style={{ backgroundColor: slide.ColorAccent }}
                  />
                  <div className="w-full space-y-0.5">
                    <div className="h-0.5 bg-neutral-300 rounded w-3/4" />
                    <div className="h-0.5 bg-neutral-200 rounded w-1/2" />
                  </div>
                </div>
                
                {/* Active indicator */}
                {i === idx && (
                  <motion.div
                    layoutId="activeSlide"
                    className="absolute inset-0 border-2 border-blue-500 rounded-lg"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        )}

        {/* Keyboard Hint */}
        {slides.length > 1 && (
          <p className="text-[11px] text-white/50 text-center mt-3 font-medium">
            Use <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/70 mx-1">←</kbd> 
            <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/70 mx-1">→</kbd> 
            to navigate
          </p>
        )}
      </div>
    </div>
  );
}
