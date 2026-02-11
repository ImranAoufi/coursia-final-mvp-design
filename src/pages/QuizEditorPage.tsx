import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { QuizEditor } from "@/components/QuizEditor";

const QuizEditorPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lessonTitle = searchParams.get("title") || "Quiz";
  const lessonIndex = searchParams.get("lessonIndex");

  const [quizData, setQuizData] = useState<{ questions: any[] } | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("coursia_edit_quiz");
    if (raw) {
      try {
        setQuizData(JSON.parse(raw));
      } catch {
        navigate("/my-course");
      }
    } else {
      navigate("/my-course");
    }
  }, [navigate]);

  const handleSave = (updatedQuiz: { questions: any[] }) => {
    // Save updated quiz back to the full course in sessionStorage
    const courseRaw = sessionStorage.getItem("coursia_full_course");
    if (courseRaw && lessonIndex !== null) {
      try {
        const course = JSON.parse(courseRaw);
        const li = parseInt(lessonIndex, 10);

        // Store the updated quiz content mapped by lesson index
        const quizUpdates = JSON.parse(sessionStorage.getItem("coursia_quiz_updates") || "{}");
        quizUpdates[li] = updatedQuiz;
        sessionStorage.setItem("coursia_quiz_updates", JSON.stringify(quizUpdates));
      } catch (e) {
        console.error("Failed to save quiz update:", e);
      }
    }

    // Also update the edit buffer so navigating back and forth keeps changes
    sessionStorage.setItem("coursia_edit_quiz", JSON.stringify(updatedQuiz));
    setQuizData(updatedQuiz);
  };

  const handleBack = () => {
    sessionStorage.removeItem("coursia_edit_quiz");
    navigate("/my-course");
  };

  if (!quizData) return null;

  return (
    <QuizEditor
      quizData={quizData}
      lessonTitle={lessonTitle}
      onSave={handleSave}
      onBack={handleBack}
    />
  );
};

export default QuizEditorPage;
