import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Check, ChevronLeft, ChevronRight, Sparkles, BookOpen, Loader2, Trophy, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface WorkbookDisplayProps {
    workbook: string;
    courseId?: string;
    lessonId?: string;
    onClose?: () => void;
}

interface ReflectionPrompt {
    index: number;
    text: string;
    response: string;
    saved: boolean;
}

export default function WorkbookDisplay({ workbook, courseId, lessonId, onClose }: WorkbookDisplayProps) {
    const { user } = useAuth();
    const [prompts, setPrompts] = useState<ReflectionPrompt[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [visitedPages, setVisitedPages] = useState<Set<number>>(new Set([0]));
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Parse workbook text into prompts
    const parseWorkbook = useCallback((text: string): string[] => {
        return text
            .split("\n")
            .filter((line) => line.trim() !== "")
            .map((line) => line.replace(/^[-*•]\s*/, "").trim())
            .filter((line) => line.length > 0);
    }, []);

    // Load saved responses from database
    useEffect(() => {
        const loadResponses = async () => {
            const parsedPrompts = parseWorkbook(workbook);
            
            if (!user || !courseId || !lessonId) {
                setPrompts(parsedPrompts.map((text, index) => ({
                    index,
                    text,
                    response: "",
                    saved: false
                })));
                setIsLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from("workbook_responses")
                    .select("*")
                    .eq("user_id", user.id)
                    .eq("course_id", courseId)
                    .eq("lesson_id", lessonId);

                if (error) throw error;

                const responseMap = new Map(
                    data?.map(r => [r.prompt_index, r.response]) || []
                );

                setPrompts(parsedPrompts.map((text, index) => ({
                    index,
                    text,
                    response: responseMap.get(index) || "",
                    saved: responseMap.has(index)
                })));
            } catch (error) {
                console.error("Error loading responses:", error);
                setPrompts(parsedPrompts.map((text, index) => ({
                    index,
                    text,
                    response: "",
                    saved: false
                })));
            } finally {
                setIsLoading(false);
            }
        };

        loadResponses();
    }, [workbook, courseId, lessonId, user, parseWorkbook]);

    // Auto-save with debounce
    const saveResponse = useCallback(async (promptIndex: number, response: string, promptText: string) => {
        if (!user || !courseId || !lessonId) return;

        setIsSaving(true);
        try {
            const { error } = await supabase
                .from("workbook_responses")
                .upsert({
                    user_id: user.id,
                    course_id: courseId,
                    lesson_id: lessonId,
                    prompt_index: promptIndex,
                    prompt_text: promptText,
                    response: response
                }, {
                    onConflict: "user_id,course_id,lesson_id,prompt_index"
                });

            if (error) throw error;

            setPrompts(prev => prev.map(p => 
                p.index === promptIndex ? { ...p, saved: true } : p
            ));
        } catch (error) {
            console.error("Error saving response:", error);
            toast.error("Failed to save your response");
        } finally {
            setIsSaving(false);
        }
    }, [user, courseId, lessonId]);

    const handleResponseChange = (value: string) => {
        const prompt = prompts[currentIndex];
        
        setPrompts(prev => prev.map(p => 
            p.index === currentIndex ? { ...p, response: value, saved: false } : p
        ));

        // Debounced auto-save
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
            saveResponse(prompt.index, value, prompt.text);
        }, 1000);
    };

    const handleNext = () => {
        if (currentIndex < prompts.length - 1) {
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            setVisitedPages(prev => new Set([...prev, nextIndex]));
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };
    
    const handleDotClick = (idx: number) => {
        setCurrentIndex(idx);
        setVisitedPages(prev => new Set([...prev, idx]));
    };

    const completedCount = prompts.filter(p => p.response.trim().length > 0).length;
    const progress = prompts.length > 0 ? (visitedPages.size / prompts.length) * 100 : 0;
    const currentPrompt = prompts[currentIndex];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading your workbook...</p>
            </div>
        );
    }

    if (prompts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
                <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">No reflection prompts available</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header with progress */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                        <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">Reflection Journal</h3>
                        <p className="text-xs text-muted-foreground">
                            {completedCount} of {prompts.length} completed
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {isSaving && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Saving...
                        </span>
                    )}
                    {!isSaving && currentPrompt?.saved && currentPrompt.response.trim() && (
                        <span className="text-xs text-emerald-500 flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            Saved
                        </span>
                    )}
                </div>
            </div>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-2">
                {prompts.map((prompt, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleDotClick(idx)}
                        className={cn(
                            "w-3 h-3 rounded-full transition-all duration-300",
                            idx === currentIndex 
                                ? "bg-primary scale-125 shadow-lg shadow-primary/30" 
                                : prompt.response.trim().length > 0
                                    ? "bg-emerald-500/80"
                                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                        )}
                        aria-label={`Go to prompt ${idx + 1}`}
                    />
                ))}
            </div>

            {/* Main prompt card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                >
                    <Card className="border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl shadow-2xl shadow-black/10 rounded-3xl overflow-hidden">
                        {/* Decorative gradient bar */}
                        <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent" />
                        
                        <CardContent className="p-6 sm:p-8 space-y-6">
                            {/* Prompt number badge */}
                            <div className="flex items-start gap-4">
                                <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg shadow-primary/20">
                                    {currentIndex + 1}
                                </div>
                                <p className="text-lg sm:text-xl font-medium leading-relaxed text-foreground pt-1.5">
                                    {currentPrompt?.text}
                                </p>
                            </div>

                            {/* Response textarea */}
                            <div className="relative">
                                <Textarea
                                    value={currentPrompt?.response || ""}
                                    onChange={(e) => handleResponseChange(e.target.value)}
                                    placeholder="Write your thoughts here... Your response will be saved automatically."
                                    className={cn(
                                        "min-h-[180px] resize-none border-2 rounded-2xl p-4 text-base",
                                        "bg-background/50 backdrop-blur-sm",
                                        "placeholder:text-muted-foreground/50",
                                        "focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
                                        "transition-all duration-300"
                                    )}
                                    disabled={!user}
                                />
                                {!user && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-2xl">
                                        <p className="text-muted-foreground text-center px-4">
                                            Please sign in to save your responses
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Character count */}
                            <div className="flex justify-end">
                                <span className="text-xs text-muted-foreground">
                                    {currentPrompt?.response?.length || 0} characters
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="rounded-xl gap-2"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                </Button>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{currentIndex + 1}</span>
                    <span>/</span>
                    <span>{prompts.length}</span>
                </div>

                {currentIndex < prompts.length - 1 ? (
                    <Button
                        onClick={handleNext}
                        className="rounded-xl gap-2"
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button
                        onClick={onClose}
                        className="rounded-xl gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/25"
                    >
                        <Trophy className="h-4 w-4" />
                        Finish Workbook
                    </Button>
                )}
            </div>

            {/* Overall progress bar */}
            <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Overall Progress</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-primary to-emerald-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                </div>
            </div>
        </div>
    );
}