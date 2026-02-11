import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, BookOpen } from "lucide-react";
import WorkbookDisplay from "@/components/WorkbookDisplay";

const WorkbookEditorPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lessonTitle = searchParams.get("title") || "Workbook";
  const courseId = searchParams.get("courseId") || undefined;
  const lessonIndex = searchParams.get("lessonIndex");
  const lessonId = lessonIndex !== null ? `lesson_${parseInt(lessonIndex, 10) + 1}` : undefined;

  const [workbookContent, setWorkbookContent] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("coursia_edit_workbook");
    if (raw) {
      setWorkbookContent(raw);
    } else {
      navigate("/my-course");
    }
  }, [navigate]);

  const handleBack = () => {
    sessionStorage.removeItem("coursia_edit_workbook");
    navigate("/my-course");
  };

  if (!workbookContent) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2 rounded-xl">
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-secondary" />
            </div>
            <div>
              <h1 className="text-sm font-semibold">Workbook</h1>
              <p className="text-xs text-muted-foreground">{lessonTitle}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <WorkbookDisplay
          workbook={workbookContent}
          courseId={courseId}
          lessonId={lessonId}
          onClose={handleBack}
        />
      </div>
    </div>
  );
};

export default WorkbookEditorPage;
