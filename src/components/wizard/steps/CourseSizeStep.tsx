import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Zap, Package, Crown, ChevronRight } from "lucide-react";

interface CourseSizeStepProps {
  onNext: (data: { courseSize: string }) => void;
  onBack: () => void;
}

const CourseSizeStep = ({ onNext, onBack }: CourseSizeStepProps) => {
  const [courseSize, setCourseSize] = useState("");

  const sizes = [
    {
      id: "micro",
      icon: Zap,
      title: "Micro Course",
      duration: "1-2 hours",
      modules: "3-5 modules",
      description: "Quick wins, focused learning",
      recommended: false,
      color: "from-primary to-accent",
    },
    {
      id: "standard",
      icon: Package,
      title: "Standard Course",
      duration: "4-6 hours",
      modules: "6-10 modules",
      description: "Comprehensive transformation",
      recommended: true,
      color: "from-accent to-secondary",
    },
    {
      id: "masterclass",
      icon: Crown,
      title: "Masterclass",
      duration: "10+ hours",
      modules: "12+ modules",
      description: "Deep expertise, premium value",
      recommended: false,
      color: "from-secondary to-secondary-glow",
    },
  ];

  // ✅ NEU: Funktion, die Auswahl setzt UND in Session Storage speichert
  const handleSelectSize = (sizeId: string) => {
    setCourseSize(sizeId);
    sessionStorage.setItem("courseSize", sizeId); // 🔥 speichert Kursgröße dauerhaft für MaterialsStep
    console.log("📦 Course size saved to session:", sizeId);
  };

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h3 className="text-xl font-semibold mb-2">Choose Your Course Format</h3>
        <p className="text-muted-foreground">
          Select the size that best fits your content and audience goals
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sizes.map((size) => {
          const Icon = size.icon;
          const isSelected = courseSize === size.id;

          return (
            <button
              key={size.id}
              onClick={() => handleSelectSize(size.id)} // ⚡ geändert – nutzt neue Funktion
              className={`glass rounded-2xl p-8 transition-all duration-300 hover:scale-105 text-left group relative border-2 ${isSelected
                  ? "border-primary shadow-glow"
                  : "border-glass-border hover:border-primary/50"
                }`}
            >
              {size.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-brand text-white text-xs font-semibold px-4 py-1 rounded-full shadow-glow">
                    Recommended
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-4">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${size.color} flex items-center justify-center`}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-1">{size.title}</h4>
                  <p className="text-xs text-muted-foreground mb-3">{size.description}</p>

                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-muted-foreground">{size.duration} total</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                      <span className="text-muted-foreground">{size.modules}</span>
                    </div>
                  </div>
                </div>
              </div>

              {isSelected && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-brand opacity-5 pointer-events-none"></div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={onBack} variant="glass" size="lg" className="w-full sm:w-auto">
          Back
        </Button>
        <Button
          onClick={() => onNext({ courseSize })}
          disabled={!courseSize}
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

export default CourseSizeStep;