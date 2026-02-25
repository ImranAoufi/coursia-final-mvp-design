// FILE: src/components/wizard/steps/MaterialsStep.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Link2, FileText, CheckCircle2, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import GenerationLoadingScreen from "@/components/GenerationLoadingScreen";
import { supabase } from "@/integrations/supabase/client";

interface MaterialsStepProps {
  onNext: (data: { materials: string; links: string; files?: string[] }) => void;
  onBack: () => void;
}

const MaterialsStep = ({ onNext, onBack }: MaterialsStepProps) => {
  const [materials, setMaterials] = useState("");
  const [links, setLinks] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("starting");
  const [generationProgress, setGenerationProgress] = useState(0);

  const canProceed = materials.trim().length >= 50;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected?.length) return;

    setUploading(true);
    const uploaded: string[] = [];
    
    for (const file of Array.from(selected)) {
      const filePath = `uploads/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from("course-branding").upload(filePath, file);
      if (!error) {
        uploaded.push(file.name);
      } else {
        console.error("Upload error:", error);
      }
    }

    setFiles((prev) => [...prev, ...uploaded]);
    setUploading(false);
  };

  return (
    <motion.div
      className="space-y-10"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="text-center max-w-2xl mx-auto">
        <h3 className="text-2xl font-semibold mb-2 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
          Share Your Knowledge
        </h3>
        <p className="text-muted-foreground text-sm">
          Upload existing materials or tell us what you know - we'll organize it for you.
        </p>
      </div>

      {/* Brain dump */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <label className="text-sm font-medium text-foreground">
            Brain Dump (your knowledge, ideas, key points)
          </label>
        </div>
        <Textarea
          placeholder="Share everything you want to teach - key concepts, examples, frameworks..."
          value={materials}
          onChange={(e) => setMaterials(e.target.value)}
          className="min-h-[200px] glass border-glass-border focus:border-primary resize-none text-base"
        />
      </div>

      {/* Links */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-accent" />
          <label className="text-sm font-medium text-foreground">
            Links & Resources (optional)
          </label>
        </div>
        <Textarea
          placeholder="Paste links (one per line) - YouTube, blogs, Google Docs..."
          value={links}
          onChange={(e) => setLinks(e.target.value)}
          className="min-h-[120px] glass border-glass-border focus:border-accent resize-none text-base"
        />
      </div>

      {/* File upload input (hidden) */}
      <input id="fileInput" type="file" multiple className="hidden" onChange={handleFileUpload} />

      {/* Upload box */}
      <div
        onClick={() => document.getElementById("fileInput")?.click()}
        className="glass rounded-xl border-2 border-dashed border-glass-border hover:border-primary/50 transition-all duration-300 p-8 text-center cursor-pointer group"
      >
        <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3 group-hover:text-primary transition-colors" />
        <p className="text-sm font-medium mb-1">Drop files here or click to upload</p>
        <p className="text-xs text-muted-foreground">PDF, DOCX, PPTX, MP3, or images</p>
      </div>

      {/* Success message for uploads */}
      {files.length > 0 && (
        <div className="bg-primary/10 rounded-lg p-4 text-sm text-primary">
          ✅ {files.length} file(s) uploaded successfully
        </div>
      )}

      {/* Confirmation message when enough content is provided */}
      {canProceed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-primary bg-primary/10 rounded-lg px-4 py-3"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Perfect! We have enough to generate your course preview.</span>
        </motion.div>
      )}

      {/* Generation Loading Screen */}
      <GenerationLoadingScreen
        isOpen={isGenerating}
        currentStep={generationStep}
        progress={generationProgress}
        title="Creating Your Course Preview"
        subtitle="Analyzing your content and building your course structure"
      />

      {/* Navigation buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={onBack} variant="glass" size="lg" className="w-full sm:w-auto">
          Back
        </Button>
        <Button
          onClick={async () => {
            try {
              setIsGenerating(true);
              setGenerationStep("analyzing");
              setGenerationProgress(5);

              // Store materials in wizard data
              const wizardData = JSON.parse(sessionStorage.getItem("coursia_wizard_data") || "{}");
              wizardData.materials = materials;
              wizardData.links = links;
              sessionStorage.setItem("coursia_wizard_data", JSON.stringify(wizardData));

              setGenerationStep("structuring");
              setGenerationProgress(20);

              // Simulate progress during AI generation
              const progressInterval = setInterval(() => {
                setGenerationProgress((prev) => {
                  if (prev >= 90) {
                    clearInterval(progressInterval);
                    return prev;
                  }
                  if (prev < 50) setGenerationStep("generating_scripts");
                  else if (prev < 65) setGenerationStep("creating_quizzes");
                  else if (prev < 80) setGenerationStep("building_workbooks");
                  else setGenerationStep("polishing");
                  return prev + 3;
                });
              }, 800);

              // Call Supabase edge function
              const { data, error } = await supabase.functions.invoke("generate-course", {
                body: {
                  outcome: wizardData.outcome || "Course",
                  audience: wizardData.audience || "",
                  audience_level: wizardData.audienceLevel || "Intermediate",
                  course_size: wizardData.courseSize || "standard",
                  materials: materials,
                  links: links,
                }
              });

              clearInterval(progressInterval);

              if (error) {
                console.error("❌ Edge function error:", error);
                setIsGenerating(false);
                alert("Error generating course. Please try again.");
                return;
              }

              setGenerationStep("finalizing");
              setGenerationProgress(95);

              sessionStorage.setItem("coursia_preview", JSON.stringify(data));
              console.log("✅ Course generated:", data);

              setGenerationProgress(100);
              setGenerationStep("done");

              setTimeout(() => {
                // Pass data through to the next wizard step
                onNext({ materials, links, files });
              }, 1000);
            } catch (err) {
              console.error("💥 Error during course generation:", err);
              setIsGenerating(false);
              alert("Something went wrong. Please try again.");
            }
          }}
          disabled={!canProceed || isGenerating}
          variant="gradient"
          size="lg"
          className="w-full sm:flex-1"
        >
          Create Course
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
};

export default MaterialsStep;
