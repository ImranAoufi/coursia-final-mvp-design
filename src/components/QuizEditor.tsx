import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, X, Save, ChevronLeft, ChevronRight, Brain, Sparkles,
  Trophy, RotateCcw, Eye, Target, Pencil
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

interface QuizEditorProps {
  quizData: { questions: QuizQuestion[] };
  lessonTitle?: string;
  onSave: (updatedQuiz: { questions: QuizQuestion[] }) => void;
  onBack: () => void;
}

interface UserAnswer {
  questionIndex: number;
  selectedAnswer: string | null;
  isCorrect: boolean;
}

type Mode = "quiz" | "review" | "results";

export function QuizEditor({ quizData, lessonTitle, onSave, onBack }: QuizEditorProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    () => JSON.parse(JSON.stringify(quizData.questions))
  );
  const [hasChanges, setHasChanges] = useState(false);

  // Quiz play state
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [mode, setMode] = useState<Mode>("quiz");
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);

  // Edit mode per question
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const isEditing = editingIndex === current;

  const letters = ["A", "B", "C", "D"];
  const totalQuestions = questions.length;
  const progress = ((current + 1) / totalQuestions) * 100;
  const question = questions[current];

  // --- Edit handlers ---
  const toggleEdit = () => {
    if (isEditing) {
      setEditingIndex(null);
    } else {
      setEditingIndex(current);
    }
  };

  const updateQuestionText = (value: string) => {
    const updated = [...questions];
    updated[current] = { ...updated[current], question: value };
    setQuestions(updated);
    setHasChanges(true);
  };

  const updateOption = (optionIndex: number, value: string) => {
    const updated = [...questions];
    const newOptions = [...updated[current].options];
    newOptions[optionIndex] = value;
    updated[current] = { ...updated[current], options: newOptions };
    setQuestions(updated);
    setHasChanges(true);
  };

  const setCorrectAnswer = (letter: string) => {
    const updated = [...questions];
    updated[current] = { ...updated[current], answer: letter };
    setQuestions(updated);
    setHasChanges(true);
  };

  const handleSave = () => {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        toast.error(`Question ${i + 1} has no text`);
        setCurrent(i);
        return;
      }
      if (q.options.some(o => !o.trim())) {
        toast.error(`Question ${i + 1} has empty options`);
        setCurrent(i);
        return;
      }
    }
    onSave({ questions });
    setHasChanges(false);
  };

  // --- Quiz play handlers ---
  const handleSelect = (letter: string) => {
    if (selected || mode === "review" || isEditing) return;
    setSelected(letter);
    setShowFeedback(true);
    const isCorrect = letter === question.answer;
    if (isCorrect) setScore(s => s + 1);
    setUserAnswers(prev => [...prev, { questionIndex: current, selectedAnswer: letter, isCorrect }]);
  };

  const handleNext = () => {
    if (current + 1 < totalQuestions) {
      setCurrent(c => c + 1);
      setSelected(null);
      setShowFeedback(false);
      setEditingIndex(null);
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
    setEditingIndex(null);
  };

  const handleReview = () => {
    setMode("review");
    setCurrent(0);
    setSelected(null);
    setShowFeedback(false);
    setEditingIndex(null);
  };

  const getUserAnswerForQuestion = (index: number) =>
    userAnswers.find(a => a.questionIndex === index);

  const getScoreMessage = () => {
    const pct = (score / totalQuestions) * 100;
    if (pct === 100) return { text: "Perfect Score!", emoji: "🏆", color: "text-yellow-500" };
    if (pct >= 80) return { text: "Excellent!", emoji: "🌟", color: "text-emerald-500" };
    if (pct >= 60) return { text: "Good Job!", emoji: "👍", color: "text-blue-500" };
    if (pct >= 40) return { text: "Keep Practicing!", emoji: "💪", color: "text-orange-500" };
    return { text: "Don't Give Up!", emoji: "📚", color: "text-rose-500" };
  };

  // --- Results screen ---
  if (mode === "results") {
    const scoreMessage = getScoreMessage();
    const percentage = Math.round((score / totalQuestions) * 100);

    return (
      <div className="min-h-screen bg-background">
        <StickyHeader
          lessonTitle={lessonTitle}
          hasChanges={hasChanges}
          onBack={onBack}
          onSave={handleSave}
        />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative mb-6"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent flex items-center justify-center">
                <Trophy className="w-12 h-12 text-primary" />
              </div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="absolute -top-1 -right-1">
                <Sparkles className="w-6 h-6 text-yellow-500" />
              </motion.div>
            </motion.div>

            <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
            <p className={cn("text-lg font-semibold mb-6", scoreMessage.color)}>
              {scoreMessage.emoji} {scoreMessage.text}
            </p>

            {/* Score circle */}
            <div className="relative w-32 h-32 mb-6">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
                <motion.circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" className="text-primary"
                  initial={{ strokeDasharray: "0 264" }}
                  animate={{ strokeDasharray: `${(percentage / 100) * 264} 264` }}
                  transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{percentage}%</span>
                <span className="text-xs text-muted-foreground">{score}/{totalQuestions}</span>
              </div>
            </div>

            {/* Question summary dots */}
            <div className="flex gap-2 flex-wrap justify-center mb-8">
              {userAnswers.map((answer, idx) => (
                <div key={idx} className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
                  answer.isCorrect ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                )}>
                  {answer.isCorrect ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
              <Button onClick={handleReview} variant="outline" className="flex-1 gap-2 rounded-xl">
                <Eye className="w-4 h-4" /> Review
              </Button>
              <Button onClick={handleRetry} className="flex-1 gap-2 rounded-xl">
                <RotateCcw className="w-4 h-4" /> Retry
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // --- Quiz / Review mode ---
  const reviewAnswer = mode === "review" ? getUserAnswerForQuestion(current) : null;

  return (
    <div className="min-h-screen bg-background">
      <StickyHeader
        lessonTitle={lessonTitle}
        hasChanges={hasChanges}
        onBack={onBack}
        onSave={handleSave}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">
                {mode === "review" ? "Reviewing" : "Question"} {current + 1} of {totalQuestions}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {mode === "quiz" && (
                <span className="text-sm text-muted-foreground">Score: {score}</span>
              )}
              {/* Edit toggle */}
              <Button
                variant={isEditing ? "default" : "outline"}
                size="sm"
                onClick={toggleEdit}
                className={cn("gap-1.5 rounded-xl text-xs h-8", isEditing && "bg-amber-500 hover:bg-amber-600 text-white")}
              >
                <Pencil className="w-3 h-3" />
                {isEditing ? "Done Editing" : "Edit"}
              </Button>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Review nav dots */}
        {mode === "review" && (
          <div className="flex gap-2 flex-wrap justify-center mb-6">
            {questions.map((_, idx) => {
              const answer = getUserAnswerForQuestion(idx);
              return (
                <button key={idx} onClick={() => { setCurrent(idx); setEditingIndex(null); }}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                    idx === current && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                    answer?.isCorrect ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                  )}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        )}

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${current}-${isEditing}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            {/* Question */}
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border border-border/50">
              {isEditing ? (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Question Text</label>
                  <Textarea
                    value={question.question}
                    onChange={(e) => updateQuestionText(e.target.value)}
                    className="text-lg font-semibold border-0 bg-transparent resize-none focus-visible:ring-0 p-0 min-h-[60px]"
                  />
                </div>
              ) : (
                <h2 className="text-lg font-semibold text-center leading-relaxed">{question.question}</h2>
              )}
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3 mb-6">
              {isEditing && (
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Options — click letter badge to set correct answer
                </label>
              )}
              {question.options.map((option, idx) => {
                const letter = letters[idx];
                const isSelected = mode === "quiz" ? selected === letter : reviewAnswer?.selectedAnswer === letter;
                const isCorrectAnswer = letter === question.answer;
                const showAsCorrect = !isEditing && (showFeedback || mode === "review") && isCorrectAnswer;
                const showAsWrong = !isEditing && (showFeedback || mode === "review") && isSelected && !isCorrectAnswer;

                if (isEditing) {
                  return (
                    <div key={idx} className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border-2 transition-all",
                      isCorrectAnswer ? "border-emerald-500 bg-emerald-500/5" : "border-border/50 bg-card"
                    )}>
                      <button
                        onClick={() => setCorrectAnswer(letter)}
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all shrink-0",
                          isCorrectAnswer ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        {isCorrectAnswer ? <Check className="w-5 h-5" /> : letter}
                      </button>
                      <Input
                        value={option}
                        onChange={(e) => updateOption(idx, e.target.value)}
                        placeholder={`Option ${letter}...`}
                        className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-base font-medium"
                      />
                      {isCorrectAnswer && (
                        <span className="text-xs text-emerald-500 font-semibold shrink-0 hidden sm:block">✓ Correct</span>
                      )}
                    </div>
                  );
                }

                return (
                  <motion.button
                    key={idx}
                    onClick={() => handleSelect(letter)}
                    disabled={!!selected || mode === "review"}
                    whileHover={!selected && mode !== "review" ? { scale: 1.01 } : {}}
                    whileTap={!selected && mode !== "review" ? { scale: 0.99 } : {}}
                    className={cn(
                      "relative w-full text-left p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-3",
                      !selected && mode !== "review" && "hover:border-primary/50 hover:bg-accent/50",
                      showAsCorrect && "border-emerald-500 bg-emerald-500/10",
                      showAsWrong && "border-rose-500 bg-rose-500/10",
                      !showAsCorrect && !showAsWrong && "border-border bg-background"
                    )}
                  >
                    <span className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors",
                      showAsCorrect && "bg-emerald-500 text-white",
                      showAsWrong && "bg-rose-500 text-white",
                      !showAsCorrect && !showAsWrong && "bg-muted text-muted-foreground"
                    )}>
                      {showAsCorrect ? <Check className="w-4 h-4" /> : showAsWrong ? <X className="w-4 h-4" /> : letter}
                    </span>
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

            {/* Feedback */}
            <AnimatePresence>
              {!isEditing && (showFeedback || mode === "review") && (
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
                      <Check className="w-5 h-5" /> Correct!
                    </p>
                  ) : (
                    <div>
                      <p className="text-rose-600 dark:text-rose-400 font-semibold flex items-center justify-center gap-2 mb-1">
                        <X className="w-5 h-5" /> Incorrect
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
                  <Button variant="outline" onClick={() => { setCurrent(c => Math.max(0, c - 1)); setEditingIndex(null); }} disabled={current === 0} className="flex-1 rounded-xl">Previous</Button>
                  {current < totalQuestions - 1 ? (
                    <Button onClick={() => { setCurrent(c => c + 1); setEditingIndex(null); }} className="flex-1 gap-2 rounded-xl">Next <ChevronRight className="w-4 h-4" /></Button>
                  ) : (
                    <Button onClick={handleRetry} className="flex-1 gap-2 rounded-xl"><RotateCcw className="w-4 h-4" /> Retry Quiz</Button>
                  )}
                </>
              ) : (
                !isEditing && showFeedback && (
                  <Button onClick={handleNext} className="w-full gap-2 rounded-xl">
                    {current < totalQuestions - 1 ? (
                      <>Next Question <ChevronRight className="w-4 h-4" /></>
                    ) : (
                      <><Trophy className="w-4 h-4" /> See Results</>
                    )}
                  </Button>
                )
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- Sticky header sub-component ---
function StickyHeader({ lessonTitle, hasChanges, onBack, onSave }: {
  lessonTitle?: string;
  hasChanges: boolean;
  onBack: () => void;
  onSave: () => void;
}) {
  return (
    <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 rounded-xl">
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Brain className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-sm font-semibold">Quiz</h1>
              {lessonTitle && <p className="text-xs text-muted-foreground">{lessonTitle}</p>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <span className="text-xs text-amber-500 flex items-center gap-1 hidden sm:flex">
              <Sparkles className="w-3 h-3" /> Unsaved
            </span>
          )}
          <Button onClick={onSave} disabled={!hasChanges} className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">
            <Save className="w-4 h-4" /> Save
          </Button>
        </div>
      </div>
    </div>
  );
}
