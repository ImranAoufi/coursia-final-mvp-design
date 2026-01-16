import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ChevronRight, RotateCcw, Eye, Trophy, Sparkles, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface QuizQuestion {
    question: string;
    options: string[];
    answer: string; // "A", "B", "C", "D"
}

interface QuizProps {
    quizData: {
        questions: QuizQuestion[];
    };
    onClose?: () => void;
}

type QuizMode = "quiz" | "review" | "results";

interface UserAnswer {
    questionIndex: number;
    selectedAnswer: string | null;
    isCorrect: boolean;
}

export function QuizDisplay({ quizData, onClose }: QuizProps) {
    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [mode, setMode] = useState<QuizMode>("quiz");
    const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
    const [showFeedback, setShowFeedback] = useState(false);

    const question = quizData.questions[current];
    const letters = ["A", "B", "C", "D"];
    const totalQuestions = quizData.questions.length;
    const progress = ((current + 1) / totalQuestions) * 100;

    const handleSelect = (letter: string) => {
        if (selected || mode === "review") return;

        setSelected(letter);
        setShowFeedback(true);
        
        const isCorrect = letter === question.answer;
        if (isCorrect) {
            setScore((s) => s + 1);
        }

        setUserAnswers(prev => [
            ...prev,
            {
                questionIndex: current,
                selectedAnswer: letter,
                isCorrect
            }
        ]);
    };

    const handleNext = () => {
        if (current + 1 < totalQuestions) {
            setCurrent((c) => c + 1);
            setSelected(null);
            setShowFeedback(false);
        } else {
            setMode("results");
        }
    };

    const handleRetry = () => {
        setMode("quiz");
        setCurrent(0);
        setScore(0);
        setSelected(null);
        setShowFeedback(false);
        setUserAnswers([]);
    };

    const handleReview = () => {
        setMode("review");
        setCurrent(0);
        setSelected(null);
        setShowFeedback(false);
    };

    const handleReviewNav = (index: number) => {
        setCurrent(index);
    };

    const getScoreMessage = () => {
        const percentage = (score / totalQuestions) * 100;
        if (percentage === 100) return { text: "Perfect Score!", emoji: "🏆", color: "text-yellow-500" };
        if (percentage >= 80) return { text: "Excellent!", emoji: "🌟", color: "text-emerald-500" };
        if (percentage >= 60) return { text: "Good Job!", emoji: "👍", color: "text-blue-500" };
        if (percentage >= 40) return { text: "Keep Practicing!", emoji: "💪", color: "text-orange-500" };
        return { text: "Don't Give Up!", emoji: "📚", color: "text-rose-500" };
    };

    const getUserAnswerForQuestion = (index: number) => {
        return userAnswers.find(a => a.questionIndex === index);
    };

    // Results Screen
    if (mode === "results") {
        const scoreMessage = getScoreMessage();
        const percentage = Math.round((score / totalQuestions) * 100);

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex flex-col items-center py-6 px-4"
            >
                {/* Trophy Animation */}
                <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="relative mb-6"
                >
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent flex items-center justify-center">
                        <Trophy className="w-12 h-12 text-primary" />
                    </div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="absolute -top-1 -right-1"
                    >
                        <Sparkles className="w-6 h-6 text-yellow-500" />
                    </motion.div>
                </motion.div>

                {/* Score Display */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center mb-6"
                >
                    <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
                    <p className={cn("text-lg font-semibold", scoreMessage.color)}>
                        {scoreMessage.emoji} {scoreMessage.text}
                    </p>
                </motion.div>

                {/* Score Circle */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="relative w-32 h-32 mb-6"
                >
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="8"
                            className="text-muted/20"
                        />
                        <motion.circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="8"
                            strokeLinecap="round"
                            className="text-primary"
                            initial={{ strokeDasharray: "0 264" }}
                            animate={{ strokeDasharray: `${(percentage / 100) * 264} 264` }}
                            transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold">{percentage}%</span>
                        <span className="text-xs text-muted-foreground">{score}/{totalQuestions}</span>
                    </div>
                </motion.div>

                {/* Question Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex gap-2 flex-wrap justify-center mb-8"
                >
                    {userAnswers.map((answer, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                                answer.isCorrect
                                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                    : "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                            )}
                        >
                            {answer.isCorrect ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </div>
                    ))}
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex flex-col sm:flex-row gap-3 w-full max-w-xs"
                >
                    <Button
                        onClick={handleReview}
                        variant="outline"
                        className="flex-1 gap-2 rounded-xl"
                    >
                        <Eye className="w-4 h-4" />
                        Review Answers
                    </Button>
                    <Button
                        onClick={handleRetry}
                        className="flex-1 gap-2 rounded-xl"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Retry Quiz
                    </Button>
                </motion.div>

                {onClose && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                    >
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="mt-4 text-muted-foreground"
                        >
                            Close
                        </Button>
                    </motion.div>
                )}
            </motion.div>
        );
    }

    // Quiz or Review Mode
    const reviewAnswer = mode === "review" ? getUserAnswerForQuestion(current) : null;

    return (
        <div className="flex flex-col py-2">
            {/* Progress Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">
                            {mode === "review" ? "Reviewing" : "Question"} {current + 1} of {totalQuestions}
                        </span>
                    </div>
                    {mode === "quiz" && (
                        <span className="text-sm text-muted-foreground">
                            Score: {score}
                        </span>
                    )}
                </div>
                <Progress value={progress} className="h-2" />
            </div>

            {/* Question Navigation Dots (Review Mode) */}
            {mode === "review" && (
                <div className="flex gap-2 flex-wrap justify-center mb-6">
                    {quizData.questions.map((_, idx) => {
                        const answer = getUserAnswerForQuestion(idx);
                        return (
                            <button
                                key={idx}
                                onClick={() => handleReviewNav(idx)}
                                className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                                    idx === current && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                                    answer?.isCorrect
                                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                        : "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                                )}
                            >
                                {idx + 1}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Question Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="w-full"
                >
                    {/* Question */}
                    <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border border-border/50">
                        <h2 className="text-lg font-semibold text-center leading-relaxed">
                            {question.question}
                        </h2>
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-1 gap-3 mb-6">
                        {question.options.map((option, idx) => {
                            const letter = letters[idx];
                            const isSelected = mode === "quiz" ? selected === letter : reviewAnswer?.selectedAnswer === letter;
                            const isCorrectAnswer = letter === question.answer;
                            const showAsCorrect = (showFeedback || mode === "review") && isCorrectAnswer;
                            const showAsWrong = (showFeedback || mode === "review") && isSelected && !isCorrectAnswer;

                            return (
                                <motion.button
                                    key={idx}
                                    onClick={() => handleSelect(letter)}
                                    disabled={!!selected || mode === "review"}
                                    whileHover={!selected && mode !== "review" ? { scale: 1.01 } : {}}
                                    whileTap={!selected && mode !== "review" ? { scale: 0.99 } : {}}
                                    className={cn(
                                        "relative w-full text-left p-4 rounded-xl border-2 transition-all duration-300",
                                        "flex items-center gap-3",
                                        !selected && mode !== "review" && "hover:border-primary/50 hover:bg-accent/50",
                                        showAsCorrect && "border-emerald-500 bg-emerald-500/10",
                                        showAsWrong && "border-rose-500 bg-rose-500/10",
                                        !showAsCorrect && !showAsWrong && "border-border bg-background"
                                    )}
                                >
                                    {/* Letter Badge */}
                                    <span
                                        className={cn(
                                            "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors",
                                            showAsCorrect && "bg-emerald-500 text-white",
                                            showAsWrong && "bg-rose-500 text-white",
                                            !showAsCorrect && !showAsWrong && "bg-muted text-muted-foreground"
                                        )}
                                    >
                                        {showAsCorrect ? (
                                            <Check className="w-4 h-4" />
                                        ) : showAsWrong ? (
                                            <X className="w-4 h-4" />
                                        ) : (
                                            letter
                                        )}
                                    </span>

                                    {/* Option Text */}
                                    <span className={cn(
                                        "flex-1 font-medium",
                                        showAsCorrect && "text-emerald-700 dark:text-emerald-300",
                                        showAsWrong && "text-rose-700 dark:text-rose-300"
                                    )}>
                                        {option}
                                    </span>
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Feedback Message */}
                    <AnimatePresence>
                        {(showFeedback || mode === "review") && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className={cn(
                                    "text-center p-4 rounded-xl mb-4",
                                    (mode === "quiz" ? selected === question.answer : reviewAnswer?.isCorrect)
                                        ? "bg-emerald-500/10 border border-emerald-500/30"
                                        : "bg-rose-500/10 border border-rose-500/30"
                                )}
                            >
                                {(mode === "quiz" ? selected === question.answer : reviewAnswer?.isCorrect) ? (
                                    <p className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-center gap-2">
                                        <Check className="w-5 h-5" />
                                        Correct!
                                    </p>
                                ) : (
                                    <div>
                                        <p className="text-rose-600 dark:text-rose-400 font-semibold flex items-center justify-center gap-2 mb-1">
                                            <X className="w-5 h-5" />
                                            Incorrect
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            The correct answer is: <span className="font-medium text-foreground">{question.options[letters.indexOf(question.answer)]}</span>
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex gap-3">
                        {mode === "review" ? (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrent(c => Math.max(0, c - 1))}
                                    disabled={current === 0}
                                    className="flex-1 rounded-xl"
                                >
                                    Previous
                                </Button>
                                {current < totalQuestions - 1 ? (
                                    <Button
                                        onClick={() => setCurrent(c => c + 1)}
                                        className="flex-1 gap-2 rounded-xl"
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleRetry}
                                        className="flex-1 gap-2 rounded-xl"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        Retry Quiz
                                    </Button>
                                )}
                            </>
                        ) : (
                            showFeedback && (
                                <Button
                                    onClick={handleNext}
                                    className="w-full gap-2 rounded-xl"
                                >
                                    {current < totalQuestions - 1 ? (
                                        <>
                                            Next Question
                                            <ChevronRight className="w-4 h-4" />
                                        </>
                                    ) : (
                                        <>
                                            <Trophy className="w-4 h-4" />
                                            See Results
                                        </>
                                    )}
                                </Button>
                            )
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
