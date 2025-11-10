// FILE: src/components/wizard/steps/MaterialsStep.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Link2, FileText, CheckCircle2, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { uploadMaterialsToBackend } from "@/api";

interface MaterialsStepProps {
  onNext: (data: { materials: string; links: string; files?: string[] }) => void;
  onBack: () => void;
}

const MaterialsStep = ({ onNext, onBack }: MaterialsStepProps) => {
  const [materials, setMaterials] = useState("");
  const [links, setLinks] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const canProceed = materials.trim().length >= 50;
  const handleContinue = async () => {
    try {
      setUploading(true);

      const fileInput = document.getElementById("fileInput") as HTMLInputElement;
      let uploadedMaterials: any[] = [];

      // Wenn Dateien hochgeladen wurden → ans Backend schicken
      if (fileInput?.files && fileInput.files.length > 0) {
        const filesArray = Array.from(fileInput.files);
        console.log("📂 Uploading files to backend:", filesArray.map(f => f.name));
        const res = await uploadMaterialsToBackend(filesArray);
        console.log("✅ Uploaded materials:", res);
        uploadedMaterials = res.materials || [];
      }

      // Jetzt Wizard weiterführen
      onNext({
        materials: materials,
        links: links,
        files: uploadedMaterials.map((m) => m.filename),
      });

      setUploading(false);
    } catch (err) {
      console.error("❌ Error uploading materials:", err);
      setUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected?.length) return;

    setUploading(true);

    const uploaded: string[] = [];
    for (const file of Array.from(selected)) {
      const formData = new FormData();
      formData.append("files", file);

      try {
        const res = await fetch("http://127.0.0.1:8000/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        uploaded.push(...data.files);
      } catch (err) {
        console.error("Upload error:", err);
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
          Upload existing materials or tell us what you know — we’ll organize it for you.
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
          placeholder="Share everything you want to teach — key concepts, examples, frameworks..."
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
          placeholder="Paste links (one per line) — YouTube, blogs, Google Docs..."
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

      {/* Navigation buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={onBack} variant="glass" size="lg" className="w-full sm:w-auto">
          Back
        </Button>
        <Button
          onClick={async () => {
            try {
              console.log("🧩 Create Course clicked");
              console.log("🧠 Materials length:", materials.length);
              console.log("🔗 Links length:", links.length);

              const formData = new FormData();
              formData.append("materials", materials);
              formData.append("links", links);
              formData.append("courseSize", sessionStorage.getItem("courseSize") || "standard");

              // 🔥 Neu: Hochgeladene Files lesen lassen
              const fileInput = document.getElementById("fileInput") as HTMLInputElement;
              if (fileInput?.files?.length) {
                for (const file of fileInput.files) {
                  console.log("📎 Uploading file to backend for reading:", file.name);

                  const uploadData = new FormData();
                  uploadData.append("file", file);

                  // Schicke jede Datei an deinen neuen Endpoint
                  const uploadRes = await fetch("http://127.0.0.1:8000/api/read-file", {
                    method: "POST",
                    body: uploadData,
                  });

                  if (!uploadRes.ok) throw new Error("File upload for reading failed");
                  const uploadResult = await uploadRes.json();
                  console.log("✅ File processed by backend:", uploadResult);

                  // Wenn der Backend-Endpoint Text zurückgibt, füge ihn hinzu
                  if (uploadResult.text) {
                    formData.append("file_texts", uploadResult.text);
                  }
                }
              }

              console.log("🚀 Sending POST to /api/generate-course ...");
              const res = await fetch("http://127.0.0.1:8000/api/generate-course", {
                method: "POST",
                body: formData,
              });

              console.log("📥 Response status:", res.status);

              if (!res.ok) {
                const text = await res.text();
                console.error("❌ Backend responded with error:", text);
                alert("Error: Backend returned an invalid response.");
                return;
              }

              const data = await res.json();
              console.log("✅ Response from backend:", data);

              if (!data) console.warn("⚠️ Empty response data!");

              sessionStorage.setItem("coursia_preview", JSON.stringify(data));
              console.log("💾 Saved to sessionStorage");

              setTimeout(() => {
                console.log("➡️ Navigating to /preview");
                window.location.href = "/preview";
              }, 2500);
            } catch (err) {
              console.error("💥 Error during course generation:", err);
              alert("Something went wrong. Check console for details.");
            }
          }}
          disabled={!canProceed}
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
