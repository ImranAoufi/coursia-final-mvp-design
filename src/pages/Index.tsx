import { useNavigate } from "react-router-dom";
import IntakeWizard from "@/components/IntakeWizard";
import { generatePreviewCourse } from "@/api";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  async function handlePreview() {
    try {
      const payload = {
        prompt: "AI for Beginners", // auf Englisch
        num_lessons: 3,
        videos_per_lesson: 2,
        include_quiz: true,
        include_workbook: true,
      };

      const preview = await generatePreviewCourse(payload);
      console.log("Course Preview:", preview);

      // Versuch, den Text aus preview.preview zu parsen
      let parsedPreview;
      try {
        parsedPreview =
          typeof preview.preview === "string"
            ? JSON.parse(preview.preview)
            : preview.preview ?? preview;
      } catch {
        parsedPreview = preview;
      }

      // Minimal-Daten im SessionStorage speichern
      const store = {
        topic: payload.prompt,
        lessons: parsedPreview.lessons ?? parsedPreview,
      };
      sessionStorage.setItem("coursia_preview", JSON.stringify(store));

      // Zur Preview-Seite weiterleiten
      navigate("/preview");
    } catch (err) {
      console.error("Error generating preview:", err);
      alert("Error generating course preview");
    }
  }

  return (
    <div className="p-6 space-y-6">
      <IntakeWizard />
    </div>
  );
};

export default Index;
