import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface SlideContent {
  SlideTitle: string;
  KeyPoints: string[];
  IconDescription: string;
  ColorAccent: string;
}

interface SlideViewerProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  lessonId: string | null;
  scriptText?: string;
  lessonTitle?: string;
}

function generateFallbackSlides(scriptText: string, title: string): SlideContent[] {
  const paragraphs = scriptText.split(/\n\n+/).filter(p => p.trim().length > 20);
  const slides: SlideContent[] = [];
  const colors = ["#4A90E2", "#7C3AED", "#10B981", "#F59E0B", "#EF4444"];

  slides.push({
    SlideTitle: title || "Course Overview",
    KeyPoints: ["Welcome to this lesson", "Let's explore the key concepts", "Ready to learn!"],
    IconDescription: "book icon",
    ColorAccent: "#4A90E2"
  });

  for (let i = 0; i < Math.min(paragraphs.length, 6); i++) {
    const sentences = paragraphs[i].split(/[.!?]+/).filter(s => s.trim().length > 10).slice(0, 4);
    slides.push({
      SlideTitle: `Key Point ${i + 1}`,
      KeyPoints: sentences.map(s => s.trim().substring(0, 60)),
      IconDescription: "lightbulb icon",
      ColorAccent: colors[i % colors.length]
    });
  }

  slides.push({
    SlideTitle: "Summary",
    KeyPoints: ["Review the key concepts", "Practice what you learned", "Ready for the next lesson"],
    IconDescription: "checkmark icon",
    ColorAccent: "#10B981"
  });

  return slides;
}

export default function SlideViewer({
  open,
  onOpenChange,
  lessonId,
  scriptText,
  lessonTitle
}: SlideViewerProps) {
  const [slides, setSlides] = useState<SlideContent[]>([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !lessonId) return;
    
    if (slides.length > 0) {
      setIdx(0);
      return;
    }

    if (!scriptText || scriptText.trim().length === 0) {
      setSlides(generateFallbackSlides(scriptText || "", lessonTitle || "Lesson"));
      setIdx(0);
      return;
    }

    setLoading(true);
    setError(null);

    supabase.functions.invoke("generate-slides", {
      body: {
        lesson_id: lessonId,
        script_text: scriptText,
        title: lessonTitle || "Lesson",
        preferred_style: "apple"
      }
    })
      .then(({ data, error: fnError }) => {
        if (fnError || !data?.slides || !Array.isArray(data.slides) || data.slides.length === 0) {
          console.warn("AI slides failed, using fallback:", fnError);
          setSlides(generateFallbackSlides(scriptText, lessonTitle || "Lesson"));
          setIdx(0);
          return;
        }
        setSlides(data.slides);
        setIdx(0);
      })
      .catch((e) => {
        console.warn("Slides generation error, using fallback:", e);
        setSlides(generateFallbackSlides(scriptText, lessonTitle || "Lesson"));
        setIdx(0);
      })
      .finally(() => setLoading(false));
  }, [open, lessonId, scriptText, lessonTitle]);

  // Reset when closed
  useEffect(() => {
    if (!open) {
      setSlides([]);
      setIdx(0);
      setError(null);
    }
  }, [open]);

  // Disable right click
  useEffect(() => {
    const handler = (e: Event) => e.preventDefault();
    if (open) {
      document.addEventListener("contextmenu", handler);
    }
    return () => document.removeEventListener("contextmenu", handler);
  }, [open]);

  if (!open) return null;

  const currentSlide = slides[idx];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden bg-background/95 backdrop-blur-xl">
        <DialogHeader className="flex items-center justify-between p-4 border-b border-border/50">
          <DialogTitle className="text-lg font-semibold">
            {lessonTitle || "Slides"} {slides.length > 0 && `(${idx + 1}/${slides.length})`}
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="flex gap-4 p-6 items-start min-h-[500px]">
          {/* Main slide area */}
          <div className="flex-1 flex items-center justify-center">
            {loading && (
              <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p>Generating slides with AI...</p>
              </div>
            )}
            
            {error && !loading && (
              <div className="text-destructive text-center p-4">
                <p>{error}</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </Button>
              </div>
            )}

            {!loading && !error && slides.length === 0 && (
              <div className="text-muted-foreground text-center">
                <p>No slides available yet.</p>
                <p className="text-sm mt-2">Make sure you have script content to generate from.</p>
              </div>
            )}

            {!loading && !error && currentSlide && (
              <div className="relative w-full h-full flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-3xl"
                  >
                    {/* Rendered Slide Card */}
                    <div 
                      className="relative rounded-2xl shadow-2xl overflow-hidden"
                      style={{
                        aspectRatio: "16/9",
                        background: `linear-gradient(135deg, white 0%, ${currentSlide.ColorAccent}10 100%)`
                      }}
                    >
                      {/* Accent bar */}
                      <div 
                        className="absolute top-0 left-0 right-0 h-1"
                        style={{ backgroundColor: currentSlide.ColorAccent }}
                      />
                      
                      {/* Content */}
                      <div className="p-8 h-full flex flex-col">
                        {/* Title */}
                        <h2 
                          className="text-2xl md:text-3xl font-bold mb-6"
                          style={{ color: currentSlide.ColorAccent }}
                        >
                          {currentSlide.SlideTitle}
                        </h2>
                        
                        {/* Key points */}
                        <ul className="space-y-3 flex-1">
                          {currentSlide.KeyPoints.map((point, i) => (
                            <motion.li
                              key={i}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="flex items-start gap-3 text-lg text-foreground/90"
                            >
                              <span 
                                className="mt-2 w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: currentSlide.ColorAccent }}
                              />
                              <span>{point}</span>
                            </motion.li>
                          ))}
                        </ul>
                        
                        {/* Slide number */}
                        <div className="text-right text-sm text-muted-foreground mt-4">
                          {idx + 1} / {slides.length}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation buttons */}
                <button
                  aria-label="Previous slide"
                  onClick={() => setIdx(Math.max(0, idx - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-background/80 shadow-lg hover:bg-background border border-border/50 transition-all disabled:opacity-50"
                  disabled={idx === 0}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  aria-label="Next slide"
                  onClick={() => setIdx(Math.min(slides.length - 1, idx + 1))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-background/80 shadow-lg hover:bg-background border border-border/50 transition-all disabled:opacity-50"
                  disabled={idx === slides.length - 1}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Thumbnails sidebar */}
          {slides.length > 0 && (
            <div className="w-[140px] overflow-auto max-h-[60vh] pr-2 space-y-2">
              {slides.map((slide, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`w-full p-2 rounded-lg text-left transition-all ${
                    i === idx 
                      ? "ring-2 ring-primary bg-primary/10" 
                      : "bg-muted/50 hover:bg-muted opacity-75 hover:opacity-100"
                  }`}
                >
                  <div 
                    className="h-1 w-full rounded mb-1"
                    style={{ backgroundColor: slide.ColorAccent }}
                  />
                  <p className="text-xs font-medium truncate">{slide.SlideTitle}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border/50 flex items-center justify-between text-sm text-muted-foreground">
          <div>Use arrow keys or click to navigate</div>
          <div>AI-generated slides</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
