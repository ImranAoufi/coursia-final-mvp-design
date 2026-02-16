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

function generateColorPalette(title: string): string[] {
  // Generate a unique but cohesive palette from the title
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const baseHue = Math.abs(hash) % 360;
  return [
    `hsl(${baseHue}, 65%, 50%)`,
    `hsl(${(baseHue + 30) % 360}, 55%, 45%)`,
    `hsl(${(baseHue + 60) % 360}, 60%, 48%)`,
    `hsl(${(baseHue + 150) % 360}, 50%, 42%)`,
    `hsl(${(baseHue + 210) % 360}, 58%, 46%)`,
  ];
}

function extractSmartTitle(sentence: string): string {
  // Extract a short, meaningful title from a sentence
  const cleaned = sentence.trim().replace(/^(in this video,?|welcome to|let's|now,?|next,?|first,?|finally,?|remember,?)/i, '').trim();
  const words = cleaned.split(/\s+/).slice(0, 6);
  let t = words.join(' ');
  // Capitalize first letter
  t = t.charAt(0).toUpperCase() + t.slice(1);
  // Remove trailing punctuation
  t = t.replace(/[.,;:!?]+$/, '');
  return t || 'Key Insight';
}

function generateFallbackSlides(scriptText: string, title: string): SlideContent[] {
  const colors = generateColorPalette(title || "Lesson");
  const sentences = scriptText
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 15);

  const slides: SlideContent[] = [];

  // Title slide with extracted intro points
  const introPoints = sentences.slice(0, 3).map(s => s.length > 55 ? s.substring(0, 52) + '…' : s);
  slides.push({
    SlideTitle: title || "Lesson Overview",
    KeyPoints: introPoints.length > 0 ? introPoints : ["Let's explore the key concepts"],
    IconDescription: "book icon",
    ColorAccent: colors[0]
  });

  // Content slides — group sentences into chunks of 3-4
  const contentSentences = sentences.slice(3);
  const chunkSize = Math.max(3, Math.ceil(contentSentences.length / 5));
  for (let i = 0; i < contentSentences.length && slides.length < 7; i += chunkSize) {
    const chunk = contentSentences.slice(i, i + chunkSize);
    const slideTitle = extractSmartTitle(chunk[0]);
    slides.push({
      SlideTitle: slideTitle,
      KeyPoints: chunk.map(s => s.length > 55 ? s.substring(0, 52) + '…' : s),
      IconDescription: "lightbulb icon",
      ColorAccent: colors[slides.length % colors.length]
    });
  }

  // Closing slide with last sentence as takeaway
  const lastSentence = sentences[sentences.length - 1];
  slides.push({
    SlideTitle: "Key Takeaways",
    KeyPoints: [
      lastSentence && lastSentence.length > 55 ? lastSentence.substring(0, 52) + '…' : (lastSentence || "Review what you learned"),
      "Practice and apply these concepts",
      "Continue to the next lesson"
    ],
    IconDescription: "checkmark icon",
    ColorAccent: colors[colors.length - 1]
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
    
    // Already have slides for this session
    if (slides.length > 0) {
      setIdx(0);
      return;
    }

    // No script text at all — use fallback immediately
    if (!scriptText || scriptText.trim().length === 0) {
      setSlides(generateFallbackSlides("", lessonTitle || "Lesson"));
      setIdx(0);
      return;
    }

    setLoading(true);
    setError(null);

    // Set a timeout so if AI takes too long, we fallback
    const timeout = setTimeout(() => {
      if (slides.length === 0) {
        console.warn("AI slides timed out, using fallback");
        setSlides(generateFallbackSlides(scriptText, lessonTitle || "Lesson"));
        setIdx(0);
        setLoading(false);
      }
    }, 15000);

    supabase.functions.invoke("generate-slides", {
      body: {
        lesson_id: lessonId,
        script_text: scriptText,
        title: lessonTitle || "Lesson",
        preferred_style: "apple"
      }
    })
      .then((response) => {
        clearTimeout(timeout);
        try {
          const { data, error: fnError } = response || {};
          if (fnError || !data?.slides || !Array.isArray(data.slides) || data.slides.length === 0) {
            console.warn("AI slides failed, using fallback:", fnError);
            setSlides(generateFallbackSlides(scriptText, lessonTitle || "Lesson"));
            setIdx(0);
            return;
          }
          // Validate slide structure
          const validSlides = data.slides.filter((s: any) => s?.SlideTitle && Array.isArray(s?.KeyPoints));
          if (validSlides.length === 0) {
            setSlides(generateFallbackSlides(scriptText, lessonTitle || "Lesson"));
          } else {
            setSlides(validSlides);
          }
          setIdx(0);
        } catch {
          setSlides(generateFallbackSlides(scriptText, lessonTitle || "Lesson"));
          setIdx(0);
        }
      })
      .catch((e) => {
        clearTimeout(timeout);
        console.warn("Slides generation error, using fallback:", e);
        setSlides(generateFallbackSlides(scriptText, lessonTitle || "Lesson"));
        setIdx(0);
      })
      .finally(() => setLoading(false));

    return () => clearTimeout(timeout);
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
