import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap, Briefcase, Users2, ChevronRight } from "lucide-react";

interface AudienceStepProps {
  onNext: (data: { audience: string; audienceLevel: string }) => void;
  onBack: () => void;
}

const AudienceStep = ({ onNext, onBack }: AudienceStepProps) => {
  const [audience, setAudience] = useState("");
  const [audienceLevel, setAudienceLevel] = useState("");

  const levels = [
    {
      id: "beginner",
      icon: GraduationCap,
      title: "Beginners",
      description: "Starting from scratch",
      color: "from-primary to-accent",
    },
    {
      id: "intermediate",
      icon: Users2,
      title: "Intermediate",
      description: "Building on basics",
      color: "from-accent to-secondary",
    },
    {
      id: "advanced",
      icon: Briefcase,
      title: "Advanced",
      description: "Mastering the craft",
      color: "from-secondary to-secondary-glow",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <label className="text-sm font-medium text-foreground">
          Who is this course for?
        </label>
        <Input
          placeholder="E.g., Freelance designers, aspiring entrepreneurs, marketing professionals..."
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          className="glass border-glass-border focus:border-primary text-base h-12"
        />
      </div>

      <div className="space-y-4">
        <label className="text-sm font-medium text-foreground">
          What's their current level?
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {levels.map((level) => {
            const Icon = level.icon;
            const isSelected = audienceLevel === level.id;
            
            return (
              <button
                key={level.id}
                onClick={() => setAudienceLevel(level.id)}
                className={`glass rounded-xl p-6 transition-all duration-300 hover:scale-105 text-left group border-2 ${
                  isSelected
                    ? "border-primary shadow-glow"
                    : "border-glass-border hover:border-primary/50"
                }`}
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${level.color} flex items-center justify-center`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{level.title}</h4>
                    <p className="text-xs text-muted-foreground">{level.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

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
          onClick={() => onNext({ audience, audienceLevel })}
          disabled={!audience || !audienceLevel}
          variant="gradient"
          size="lg"
          className="w-full sm:flex-1"
        >
          Continue
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default AudienceStep;
