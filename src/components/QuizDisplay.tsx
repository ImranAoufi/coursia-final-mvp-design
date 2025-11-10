import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

interface QuizQuestion {
    question: string;
    options: string[];
    answer: string; // "A", "B", "C", "D"
}

interface QuizProps {
    quizData: {
        questions: QuizQuestion[];
    };
}

export function QuizDisplay({ quizData }: QuizProps) {
    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);

    const question = quizData.questions[current];
    const letters = ["A", "B", "C", "D"];

    const handleSelect = (option: string) => {
        if (selected) return; // prevent re-selection

        setSelected(option);
        if (option === question.answer) {
            setScore((s) => s + 1);
        }
    };

    const handleNext = () => {
        if (current + 1 < quizData.questions.length) {
            setCurrent((c) => c + 1);
            setSelected(null);
        } else {
            setFinished(true);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center">
            {!finished ? (
                <AnimatePresence mode="wait">
                    <motion.div
                        key={current}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="w-full"
                    >
                        <div className="text-sm text-muted-foreground text-center mb-2">
                            Question {current + 1} of {quizData.questions.length}
                        </div>

                        <Card className="p-6 shadow-lg border border-border/60 bg-background/80 rounded-2xl">
                            <CardContent>
                                <h2 className="text-lg font-semibold text-center mb-6 leading-snug">
                                    {question.question}
                                </h2>

                                <div className="grid grid-cols-1 gap-3">
                                    {question.options.map((option, idx) => {
                                        const letter = letters[idx];
                                        const isCorrect = selected && letter === question.answer;
                                        const isWrong = selected === letter && letter !== question.answer;

                                        return (
                                            <Button
                                                key={idx}
                                                variant="outline"
                                                disabled={!!selected}
                                                onClick={() => handleSelect(letter)}
                                                className={`w-full text-base py-3 rounded-xl transition-all duration-200 ${isCorrect
                                                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                                    : isWrong
                                                        ? "bg-red-100 text-red-800 border-red-300"
                                                        : "hover:bg-accent hover:text-accent-foreground"
                                                    }`}
                                            >
                                                <span className="font-medium mr-2 text-muted-foreground">
                                                    {letter}.
                                                </span>{" "}
                                                {option}
                                            </Button>
                                        );
                                    })}
                                </div>

                                {selected && (
                                    <div className="mt-6 text-center">
                                        {selected === question.answer ? (
                                            <p className="text-emerald-600 font-semibold">✅ Correct!</p>
                                        ) : (
                                            <p className="text-red-600 font-semibold">
                                                ❌ The correct answer is{" "}
                                                {
                                                    question.options[
                                                    letters.indexOf(question.answer)
                                                    ]
                                                }
                                            </p>
                                        )}

                                        <Button
                                            onClick={handleNext}
                                            className="mt-4 px-6 py-2 rounded-xl text-sm"
                                        >
                                            Next Question
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </AnimatePresence>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-center space-y-4"
                >
                    <h2 className="text-2xl font-semibold">🎉 Quiz Completed!</h2>
                    <p className="text-muted-foreground">
                        You scored <span className="font-bold">{score}</span> out of{" "}
                        {quizData.questions.length}.
                    </p>
                    <Button
                        onClick={() => {
                            setFinished(false);
                            setCurrent(0);
                            setScore(0);
                            setSelected(null);
                        }}
                        className="rounded-xl"
                    >
                        Retry Quiz
                    </Button>
                </motion.div>
            )}
        </div>
    );
}
