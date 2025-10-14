import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Link2, FileText, CheckCircle2, ChevronRight } from "lucide-react";

interface MaterialsStepProps {
  onNext: (data: { materials: string; links: string }) => void;
  onBack: () => void;
}

const MaterialsStep = ({ onNext, onBack }: MaterialsStepProps) => {
  const [materials, setMaterials] = useState("");
  const [links, setLinks] = useState("");

  const uploadOptions = [
    {
      icon: FileText,
      title: "Text & Notes",
      description: "Brain dump, outlines, existing content",
    },
    {
      icon: Link2,
      title: "Links & Resources",
      description: "Videos, articles, presentations",
    },
    {
      icon: Upload,
      title: "Files",
      description: "PDFs, slides, images, audio",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h3 className="text-xl font-semibold mb-2">Share Your Knowledge</h3>
        <p className="text-muted-foreground">
          Upload any existing materials or simply tell us what you know
        </p>
      </div>

      {/* Upload options showcase */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {uploadOptions.map((option, index) => {
          const Icon = option.icon;
          return (
            <div
              key={index}
              className="glass rounded-xl p-5 border border-glass-border hover:border-primary/50 transition-all duration-300"
            >
              <Icon className="w-6 h-6 text-primary mb-2" />
              <h4 className="font-semibold text-sm mb-1">{option.title}</h4>
              <p className="text-xs text-muted-foreground">{option.description}</p>
            </div>
          );
        })}
      </div>

      {/* Brain dump area */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <label className="text-sm font-medium text-foreground">
            Brain Dump (Your knowledge, ideas, key points)
          </label>
        </div>
        <Textarea
          placeholder="Share everything you want to teach... Key concepts, stories, examples, frameworks, or just your thoughts. Don't worry about structure - we'll organize it for you."
          value={materials}
          onChange={(e) => setMaterials(e.target.value)}
          className="min-h-[200px] glass border-glass-border focus:border-primary resize-none text-base"
        />
      </div>

      {/* Links area */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-accent" />
          <label className="text-sm font-medium text-foreground">
            Links & Resources (Optional)
          </label>
        </div>
        <Textarea
          placeholder="Paste any relevant links (one per line)&#10;- YouTube videos&#10;- Blog posts&#10;- Google Docs&#10;- Slide decks"
          value={links}
          onChange={(e) => setLinks(e.target.value)}
          className="min-h-[120px] glass border-glass-border focus:border-accent resize-none text-base"
        />
      </div>

      {/* File upload placeholder */}
      <div className="glass rounded-xl border-2 border-dashed border-glass-border hover:border-primary/50 transition-all duration-300 p-8 text-center cursor-pointer group">
        <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3 group-hover:text-primary transition-colors" />
        <p className="text-sm font-medium mb-1">Drop files here or click to upload</p>
        <p className="text-xs text-muted-foreground">PDF, DOCX, PPTX, MP3, or images</p>
      </div>

      {materials && (
        <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 rounded-lg px-4 py-3">
          <CheckCircle2 className="w-4 h-4" />
          <span>Great! We have enough to generate your course preview</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={onBack}
          variant="glass"
          size="lg"
          className="w-full sm:w-auto"
        >
          Back
        </Button>
        <Button
          onClick={() => onNext({ materials, links })}
          disabled={materials.length < 50}
          variant="gradient"
          size="lg"
          className="w-full sm:flex-1"
        >
          Generate Preview
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default MaterialsStep;
