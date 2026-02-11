import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Save, ChevronLeft, ChevronRight, Brain, GripVertical, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string; // "A", "B", "C", "D"
}

interface QuizEditorProps {
  quizData: {
    questions: QuizQuestion[];
  };
  lessonTitle?: string;
  onSave: (updatedQuiz: { questions: QuizQuestion[] }) => void;
  onBack: () => void;
}

export function QuizEditor({ quizData, lessonTitle, onSave, onBack }: QuizEditorProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    () => JSON.parse(JSON.stringify(quizData.questions))
  );
  const [current, setCurrent] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);

  const letters = ["A", "B", "C", "D"];
  const totalQuestions = questions.length;
  const progress = ((current + 1) / totalQuestions) * 100;
  const question = questions[current];

  const updateQuestion = (field: "question", value: string) => {
    const updated = [...questions];
    updated[current] = { ...updated[current], [field]: value };
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
    // Validate
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
    toast.success("Quiz saved successfully!");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="gap-2 rounded-xl"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Brain className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <h1 className="text-sm font-semibold">Quiz Editor</h1>
                {lessonTitle && (
                  <p className="text-xs text-muted-foreground">{lessonTitle}</p>
                )}
              </div>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={!hasChanges}
            className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Question {current + 1} of {totalQuestions}
            </span>
            {hasChanges && (
              <span className="text-xs text-amber-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Unsaved changes
              </span>
            )}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Navigation Dots */}
        <div className="flex gap-2 flex-wrap justify-center mb-8">
          {questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold transition-all border-2",
                idx === current
                  ? "border-primary bg-primary/10 text-primary scale-110"
                  : "border-border/50 bg-card hover:border-primary/30 text-muted-foreground"
              )}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {/* Question Editor Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Question Text */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border border-border/50">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
                Question Text
              </label>
              <Textarea
                value={question.question}
                onChange={(e) => updateQuestion("question", e.target.value)}
                placeholder="Enter your question..."
                className="text-lg font-semibold border-0 bg-transparent resize-none focus-visible:ring-0 p-0 min-h-[80px]"
              />
            </div>

            {/* Options */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Answer Options
              </label>
              {question.options.map((option, idx) => {
                const letter = letters[idx];
                const isCorrect = question.answer === letter;

                return (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border-2 transition-all",
                      isCorrect
                        ? "border-emerald-500 bg-emerald-500/5"
                        : "border-border/50 bg-card"
                    )}
                  >
                    {/* Correct Answer Toggle */}
                    <button
                      onClick={() => setCorrectAnswer(letter)}
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all shrink-0",
                        isCorrect
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                      title={isCorrect ? "Correct answer" : "Click to set as correct answer"}
                    >
                      {isCorrect ? <Check className="w-5 h-5" /> : letter}
                    </button>

                    {/* Option Input */}
                    <Input
                      value={option}
                      onChange={(e) => updateOption(idx, e.target.value)}
                      placeholder={`Option ${letter}...`}
                      className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-base font-medium"
                    />

                    {isCorrect && (
                      <span className="text-xs text-emerald-500 font-semibold shrink-0 hidden sm:block">
                        ✓ Correct
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrent(c => Math.max(0, c - 1))}
                disabled={current === 0}
                className="flex-1 rounded-xl gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <Button
                onClick={() => setCurrent(c => Math.min(totalQuestions - 1, c + 1))}
                disabled={current === totalQuestions - 1}
                className="flex-1 rounded-xl gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
