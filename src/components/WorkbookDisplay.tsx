// FILE: src/components/WorkbookDisplay.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface WorkbookDisplayProps {
    workbook: string; // full text as one string
}

export default function WorkbookDisplay({ workbook }: WorkbookDisplayProps) {
    const reflections = workbook
        .split("\n")
        .filter((line) => line.trim() !== "")
        .map((line) => line.replace(/^[-*•]\s*/, "").trim());

    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        if (currentIndex < reflections.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const progress = ((currentIndex + 1) / reflections.length) * 100;

    return (
        <div className="flex flex-col items-center justify-center gap-6">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="w-full"
                >
                    <Card className="border border-border/60 bg-muted/10 shadow-sm backdrop-blur-sm rounded-2xl">
                        <CardContent className="p-6">
                            <p className="text-lg md:text-xl font-medium leading-relaxed text-foreground/90 text-center">
                                {reflections[currentIndex]}
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </AnimatePresence>

            {/* Progress indicator */}
            <div className="w-full flex flex-col items-center gap-3">
                <div className="w-2/3 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-500 ease-in-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <p className="text-sm text-muted-foreground">
                    {currentIndex + 1} of {reflections.length}
                </p>
            </div>

            {/* Next button */}
            {currentIndex < reflections.length - 1 ? (
                <Button
                    onClick={handleNext}
                    className="rounded-full px-6 py-2 text-sm md:text-base"
                >
                    Next Reflection →
                </Button>
            ) : (
                <p className="text-muted-foreground text-sm mt-2 italic">
                    🌿 End of reflections
                </p>
            )}
        </div>
    );
}
