import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Loader2, Presentation, Link2, Link2Off, Sparkles } from "lucide-react";
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
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

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
  const progressPercent = slides.length > 0 ? ((idx + 1) / slides.length) * 100 : 0;

  const handleManualNav = (newIdx: number) => {
    setAutoSync(false);
    setIdx(newIdx);
  };

  return (
    <div className="w-full px-2">
      {/* Premium Slide Container with layered depth */}
      <div className="relative">
        {/* Ambient glow behind card */}
        {currentSlide && (
          <motion.div
            key={currentSlide.ColorAccent}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            className="absolute -inset-4 rounded-3xl blur-2xl"
            style={{ 
              background: `radial-gradient(ellipse at center, ${currentSlide.ColorAccent}40 0%, transparent 70%)` 
            }}
          />
        )}

        {/* Main Slide Card - Elevated with premium shadows */}
        <motion.div 
          className="relative bg-white rounded-2xl overflow-hidden"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{ 
            boxShadow: `
              0 0 0 1px rgba(0,0,0,0.03),
              0 2px 4px rgba(0,0,0,0.04),
              0 8px 16px rgba(0,0,0,0.06),
              0 24px 48px rgba(0,0,0,0.08),
              0 48px 80px rgba(0,0,0,0.12)
            `,
          }}>
          
          {/* Frosted Header Bar */}
          <div className="relative flex items-center justify-between px-5 py-3.5 
            bg-gradient-to-r from-neutral-50/95 via-white/90 to-neutral-50/95
            backdrop-blur-xl border-b border-neutral-200/60">
            
            {/* Subtle shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-50" />
            
            <div className="relative flex items-center gap-4">
              {/* macOS window controls with hover effects */}
              <div className="flex gap-2">
                <motion.div 
                  whileHover={{ scale: 1.2 }}
                  className="w-3 h-3 rounded-full bg-gradient-to-br from-red-400 to-red-500 shadow-sm shadow-red-500/30 cursor-pointer" 
                />
                <motion.div 
                  whileHover={{ scale: 1.2 }}
                  className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 shadow-sm shadow-amber-500/30 cursor-pointer" 
                />
                <motion.div 
                  whileHover={{ scale: 1.2 }}
                  className="w-3 h-3 rounded-full bg-gradient-to-br from-green-400 to-green-500 shadow-sm shadow-green-500/30 cursor-pointer" 
                />
              </div>
              {slides.length > 0 && (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="text-sm font-semibold text-neutral-600 tracking-tight">
                    Slide {idx + 1} of {slides.length}
                  </span>
                </div>
              )}
            </div>
            
            {/* Sync Toggle - Premium style */}
            {slides.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setAutoSync(!autoSync)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold 
                  transition-all duration-300 overflow-hidden ${
                  autoSync 
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white" 
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
                style={{
                  boxShadow: autoSync 
                    ? '0 4px 12px rgba(59, 130, 246, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)' 
                    : '0 2px 6px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)'
                }}
              >
                {autoSync && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                )}
                <span className="relative">
                  {autoSync ? <Link2 className="w-3.5 h-3.5" /> : <Link2Off className="w-3.5 h-3.5" />}
                </span>
                <span className="relative">{autoSync ? "Auto-sync" : "Manual"}</span>
              </motion.button>
            )}
          </div>

          {/* Loading State - Premium spinner */}
          {loading && (
            <div className="h-80 flex flex-col items-center justify-center gap-5 bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 rounded-full border-4 border-neutral-200"
                  style={{ borderTopColor: 'rgb(59, 130, 246)' }}
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-2 rounded-full border-4 border-neutral-100"
                  style={{ borderBottomColor: 'rgb(168, 85, 247)' }}
                />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-neutral-700">Generating slides</p>
                <p className="text-xs text-neutral-400 mt-1">Crafting beautiful visuals...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="h-80 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-neutral-50 to-white">
              <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center">
                <Presentation className="w-8 h-8 text-neutral-300" />
              </div>
              <p className="text-sm text-neutral-500 font-medium">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && slides.length === 0 && (
            <div className="h-80 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-neutral-50 to-white">
              <motion.div 
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-50 flex items-center justify-center shadow-inner"
              >
                <Presentation className="w-8 h-8 text-neutral-300" />
              </motion.div>
              <p className="text-sm text-neutral-400 font-medium">Slides will appear here</p>
            </div>
          )}

          {/* Slide Content - Premium layout */}
          {!loading && !error && currentSlide && (
            <div className="relative min-h-[340px] bg-gradient-to-br from-white via-white to-neutral-50/50">
              {/* Subtle texture overlay */}
              <div 
                className="absolute inset-0 opacity-[0.015]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
              />

              <AnimatePresence mode="wait">
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                  className="relative p-10"
                >
                  {/* Gradient accent bar */}
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: 80 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="h-1.5 rounded-full mb-7"
                    style={{ 
                      background: `linear-gradient(90deg, ${currentSlide.ColorAccent}, ${currentSlide.ColorAccent}80)` 
                    }}
                  />
                  
                  {/* Title with enhanced typography */}
                  <motion.h2 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                    className="text-4xl font-extrabold text-neutral-900 tracking-tight mb-8 leading-[1.1]"
                  >
                    {currentSlide.SlideTitle}
                  </motion.h2>
                  
                  {/* Key Points - Interactive grid */}
                  <div className="grid grid-cols-2 gap-x-10 gap-y-5">
                    {currentSlide.KeyPoints.slice(0, 6).map((point, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          delay: 0.2 + i * 0.08, 
                          duration: 0.3,
                          ease: "easeOut"
                        }}
                        onHoverStart={() => setHoveredPoint(i)}
                        onHoverEnd={() => setHoveredPoint(null)}
                        className="relative flex items-start gap-4 group cursor-default"
                      >
                        {/* Animated bullet */}
                        <motion.div 
                          animate={{ 
                            scale: hoveredPoint === i ? 1.3 : 1,
                            boxShadow: hoveredPoint === i 
                              ? `0 0 12px ${currentSlide.ColorAccent}60` 
                              : `0 0 0 ${currentSlide.ColorAccent}00`
                          }}
                          className="mt-2.5 w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all duration-200"
                          style={{ backgroundColor: currentSlide.ColorAccent }}
                        />
                        <motion.span 
                          animate={{ 
                            color: hoveredPoint === i ? 'rgb(23, 23, 23)' : 'rgb(64, 64, 64)'
                          }}
                          className="text-lg leading-relaxed font-medium transition-colors duration-200"
                        >
                          {point}
                        </motion.span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Arrows - Elevated style */}
              {slides.length > 1 && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.1, x: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleManualNav(Math.max(0, idx - 1))}
                    disabled={idx === 0}
                    className="absolute left-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full 
                      bg-white/90 backdrop-blur-sm shadow-lg
                      flex items-center justify-center transition-all
                      hover:bg-white disabled:opacity-20 disabled:hover:scale-100"
                    style={{ 
                      boxShadow: idx > 0 
                        ? '0 4px 20px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.08)' 
                        : 'none' 
                    }}
                  >
                    <ChevronLeft className="w-6 h-6 text-neutral-600" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1, x: 2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleManualNav(Math.min(slides.length - 1, idx + 1))}
                    disabled={idx === slides.length - 1}
                    className="absolute right-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full 
                      bg-white/90 backdrop-blur-sm shadow-lg
                      flex items-center justify-center transition-all
                      hover:bg-white disabled:opacity-20 disabled:hover:scale-100"
                    style={{ 
                      boxShadow: idx < slides.length - 1 
                        ? '0 4px 20px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.08)' 
                        : 'none' 
                    }}
                  >
                    <ChevronRight className="w-6 h-6 text-neutral-600" />
                  </motion.button>
                </>
              )}
            </div>
          )}

          {/* Progress Bar - Elegant style at bottom of card */}
          {slides.length > 1 && (
            <div className="relative h-1 bg-neutral-100">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-r-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{
                  background: currentSlide 
                    ? `linear-gradient(90deg, ${currentSlide.ColorAccent}, ${currentSlide.ColorAccent}cc)` 
                    : 'rgb(59, 130, 246)'
                }}
              />
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-y-0 w-20 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                  left: `${progressPercent - 10}%`
                }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
          )}
        </motion.div>

        {/* Premium Thumbnail Strip */}
        {slides.length > 1 && (
          <div className="mt-5 flex justify-center gap-3">
            {slides.map((slide, i) => (
              <motion.button
                key={i}
                onClick={() => handleManualNav(i)}
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="relative group"
              >
                {/* Thumbnail card */}
                <motion.div 
                  animate={{ 
                    opacity: i === idx ? 1 : 0.5,
                    scale: i === idx ? 1 : 0.95
                  }}
                  transition={{ duration: 0.2 }}
                  className={`w-16 h-11 rounded-lg overflow-hidden bg-white transition-all duration-200 ${
                    i === idx ? "shadow-xl" : "shadow-md group-hover:shadow-lg"
                  }`}
                  style={{
                    boxShadow: i === idx 
                      ? `0 8px 24px rgba(0,0,0,0.15), 0 0 0 2px ${slide.ColorAccent}` 
                      : '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  {/* Mini slide content */}
                  <div className="w-full h-full flex flex-col items-start justify-center p-2 bg-gradient-to-br from-white to-neutral-50">
                    <div 
                      className="w-5 h-1 rounded-full mb-1.5"
                      style={{ backgroundColor: slide.ColorAccent }}
                    />
                    <div className="w-full space-y-1">
                      <div 
                        className="h-1 rounded-full w-4/5"
                        style={{ backgroundColor: `${slide.ColorAccent}30` }}
                      />
                      <div 
                        className="h-1 rounded-full w-3/5"
                        style={{ backgroundColor: `${slide.ColorAccent}20` }}
                      />
                    </div>
                  </div>
                </motion.div>
                
                {/* Slide number badge */}
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: i === idx ? 1 : 0,
                    scale: i === idx ? 1 : 0.8
                  }}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white 
                    flex items-center justify-center text-[10px] font-bold shadow-md"
                  style={{ color: slide.ColorAccent }}
                >
                  {i + 1}
                </motion.span>
              </motion.button>
            ))}
          </div>
        )}

        {/* Step Indicator Dots */}
        {slides.length > 1 && (
          <div className="mt-4 flex justify-center gap-1.5">
            {slides.map((slide, i) => (
              <motion.div
                key={i}
                animate={{ 
                  width: i === idx ? 20 : 6,
                  backgroundColor: i === idx ? slide.ColorAccent : 'rgba(255,255,255,0.3)'
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="h-1.5 rounded-full cursor-pointer hover:opacity-80"
                onClick={() => handleManualNav(i)}
              />
            ))}
          </div>
        )}

        {/* Keyboard Hint - Refined */}
        {slides.length > 1 && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-[11px] text-white/40 text-center mt-4 font-medium tracking-wide"
          >
            Use <kbd className="px-2 py-1 bg-white/10 rounded-md text-white/60 mx-1 font-mono text-[10px]">←</kbd> 
            <kbd className="px-2 py-1 bg-white/10 rounded-md text-white/60 mx-1 font-mono text-[10px]">→</kbd> 
            to navigate slides
          </motion.p>
        )}
      </div>
    </div>
  );
}
