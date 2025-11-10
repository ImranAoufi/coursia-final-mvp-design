import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Slide {
    filename: string;
    url: string; // proxied signed url endpoint
}


export default function SlideViewer({
    open,
    onOpenChange,
    lessonId,
    apiBase = ""
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    lessonId: string | null;
    apiBase?: string;
}) {
    const [slides, setSlides] = useState<Slide[] | null>(null);
    const [idx, setIdx] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open || !lessonId) return;
        setLoading(true);
        fetch(`${apiBase}/api/slides-signed-urls/${lessonId}`)
            .then((r) => {
                if (!r.ok) throw new Error("Slides not ready");
                return r.json();
            })
            .then((d) => {
                // convert relative urls to absolute if needed
                const base = apiBase || "";
                const slides = d.slides.map((s: any) => ({ filename: s.filename, url: (s.url.startsWith("/") ? base + s.url : s.url) }));
                setSlides(slides);
                setIdx(0);
            })
            .catch((e) => {
                console.error(e);
                setSlides([]);
            })
            .finally(() => setLoading(false));
    }, [open, lessonId, apiBase]);

    // disable right click + drag on image
    useEffect(() => {
        const handler = (e: any) => e.preventDefault();
        if (open) {
            document.addEventListener("contextmenu", handler);
        }
        return () => document.removeEventListener("contextmenu", handler);
    }, [open]);

    if (!open) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden">
                <DialogHeader className="flex items-center justify-between p-4 border-b">
                    <DialogTitle className="text-lg font-semibold">Slides</DialogTitle>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" onClick={() => onOpenChange(false)}><X /></Button>
                    </div>
                </DialogHeader>

                <div className="flex gap-4 p-6 items-start">
                    <div className="flex-1 flex items-center justify-center">
                        {loading && <div>Loading slides…</div>}
                        {!loading && slides && slides.length === 0 && <div className="text-muted-foreground">No slides available yet.</div>}

                        {!loading && slides && slides.length > 0 && (
                            <div className="relative w-full h-[60vh] flex items-center justify-center">
                                <img
                                    src={slides[idx].url}
                                    alt={`Slide ${idx + 1}`}
                                    draggable={false}
                                    onDragStart={(e) => e.preventDefault()}
                                    className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl select-none"
                                    style={{ userSelect: "none", pointerEvents: "auto" }}
                                />

                                {/* left/right */}
                                <button
                                    aria-label="prev"
                                    onClick={() => setIdx(Math.max(0, idx - 1))}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 shadow hover:bg-white z-50"
                                    disabled={idx === 0}
                                >
                                    <ChevronLeft />
                                </button>
                                <button
                                    aria-label="next"
                                    onClick={() => setIdx(Math.min(slides.length - 1, idx + 1))}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 shadow hover:bg-white z-50"
                                    disabled={idx === slides.length - 1}
                                >
                                    <ChevronRight />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* small thumbnails */}
                    <div className="w-[160px] overflow-auto max-h-[60vh] pr-2">
                        {slides && slides.map((s, i) => (
                            <div key={s.filename} className={`mb-2 rounded overflow-hidden cursor-pointer ${i === idx ? "ring-2 ring-primary" : "opacity-90"}`} onClick={() => setIdx(i)}>
                                <img src={s.url} alt={s.filename} draggable={false} className="w-full h-20 object-cover" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-4 border-t flex items-center justify-between text-sm text-muted-foreground">
                    <div>{slides ? `${idx + 1} / ${slides.length}` : ""}</div>
                    <div>Slides are view-only on this platform</div>
                </div>
            </DialogContent>
        </Dialog>
    );
}