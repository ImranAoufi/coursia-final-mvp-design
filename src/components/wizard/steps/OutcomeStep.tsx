import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Target, Users } from "lucide-react";

interface OutcomeStepProps {
  onNext: (data: { outcome: string }) => void;
}

const OutcomeStep = ({ onNext }: OutcomeStepProps) => {
  const [outcome, setOutcome] = useState("");

  const suggestions = [
    {
      icon: Target,
      title: "Business Growth",
      description: "Help entrepreneurs scale their businesses",
    },
    {
      icon: Users,
      title: "Personal Development",
      description: "Transform lives through self-improvement",
    },
    {
      icon: Sparkles,
      title: "Skill Mastery",
      description: "Teach practical, in-demand skills",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <label className="text-sm font-medium text-foreground">
          What transformation will your course create?
        </label>
        <Textarea
          placeholder="Example: My course will help freelance designers build a 6-figure business by teaching them advanced client acquisition strategies and pricing techniques..."
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
          className="min-h-[150px] glass border-glass-border focus:border-primary resize-none text-base"
        />
      </div>

      {/* Suggestion cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {suggestions.map((suggestion, index) => {
          const Icon = suggestion.icon;
          return (
            <button
              key={index}
              onClick={() => setOutcome(suggestion.description)}
              className="glass rounded-xl p-4 hover:glass-strong transition-all duration-300 hover:scale-105 text-left group border border-glass-border"
            >
              <Icon className="w-6 h-6 text-primary mb-2 group-hover:animate-glow" />
              <h4 className="font-semibold text-sm mb-1">{suggestion.title}</h4>
              <p className="text-xs text-muted-foreground">{suggestion.description}</p>
            </button>
          );
        })}
      </div>

      <Button
        onClick={() => onNext({ outcome })}
        disabled={outcome.length < 20}
        variant="gradient"
        size="lg"
        className="w-full sm:w-auto sm:min-w-[200px]"
      >
        Continue
      </Button>
    </div>
  );
};

export default OutcomeStep;
