import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Layers, Loader2, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface SlideContent {
  SlideTitle: string;
  KeyPoints: string[];
  IconDescription: string;
  ColorAccent: string;
}

const SlidesViewerPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lessonTitle = searchParams.get("title") || "Slides";
  const lessonId = searchParams.get("lessonId") || null;

  const [scriptText, setScriptText] = useState<string | null>(null);
  const [slides, setSlides] = useState<SlideContent[]>([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load script from sessionStorage
  useEffect(() => {
    const raw = sessionStorage.getItem("coursia_edit_slides_script");
    if (raw) {
      setScriptText(raw);
    } else {
      navigate("/my-course");
    }
  }, [navigate]);

  // Generate slides once script is loaded
  useEffect(() => {
    if (!scriptText || !lessonId || slides.length > 0) return;

    setLoading(true);
    setError(null);

    supabase.functions.invoke("generate-slides", {
      body: {
        lesson_id: lessonId,
        script_text: scriptText,
        title: lessonTitle,
        preferred_style: "apple"
      }
    })
      .then(({ data, error: fnError }) => {
        if (fnError) {
          console.error("Edge function error:", fnError);
          setError("Failed to generate slides");
          return;
        }
        if (data?.slides && Array.isArray(data.slides)) {
          setSlides(data.slides);
          setIdx(0);
        } else {
          setError("No slides returned from AI");
        }
      })
      .catch((e) => {
        console.error("Slides generation error:", e);
        setError("Failed to generate slides");
      })
      .finally(() => setLoading(false));
  }, [scriptText, lessonId, lessonTitle, slides.length]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setIdx(prev => Math.max(0, prev - 1));
      if (e.key === "ArrowRight") setIdx(prev => Math.min(slides.length - 1, prev + 1));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [slides.length]);

  const handleBack = () => {
    sessionStorage.removeItem("coursia_edit_slides_script");
    navigate("/my-course");
  };

  const currentSlide = slides[idx];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2 rounded-xl">
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Layers className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-semibold">Slides</h1>
              <p className="text-xs text-muted-foreground">
                {lessonTitle} {slides.length > 0 && `• ${idx + 1}/${slides.length}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-6 items-start min-h-[500px]">
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
                <Button variant="outline" className="mt-4" onClick={handleBack}>
                  Go Back
                </Button>
              </div>
            )}

            {!loading && !error && slides.length === 0 && !scriptText && (
              <div className="text-muted-foreground text-center">
                <p>No slides available yet.</p>
              </div>
            )}

            {!loading && !error && currentSlide && (
              <div className="relative w-full flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-3xl"
                  >
                    <div
                      className="relative rounded-2xl shadow-2xl overflow-hidden"
                      style={{
                        aspectRatio: "16/9",
                        background: `linear-gradient(135deg, white 0%, ${currentSlide.ColorAccent}10 100%)`
                      }}
                    >
                      <div
                        className="absolute top-0 left-0 right-0 h-1"
                        style={{ backgroundColor: currentSlide.ColorAccent }}
                      />
                      <div className="p-8 h-full flex flex-col">
                        <h2
                          className="text-2xl md:text-3xl font-bold mb-6"
                          style={{ color: currentSlide.ColorAccent }}
                        >
                          {currentSlide.SlideTitle}
                        </h2>
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

        {slides.length > 0 && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Use arrow keys or click to navigate • AI-generated slides
          </div>
        )}
      </div>
    </div>
  );
};

export default SlidesViewerPage;
