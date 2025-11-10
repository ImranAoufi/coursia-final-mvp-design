import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BackgroundOrbs } from "@/components/BackgroundOrbs";
import { pollJobStatus } from "@/api";

interface PricingTier {
  name: string;
  price: number;
  priceAnnual: number;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

const Pricing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  useEffect(() => {
    const jobId = sessionStorage.getItem("coursia_job_id");
    if (!jobId) return;

    console.log("📡 Found job_id in session, starting polling:", jobId);

    const interval = setInterval(async () => {
      try {
        const status = await pollJobStatus(jobId);
        console.log("📡 Job status:", status);

        if (status === "completed") {
          clearInterval(interval);
          alert("🎉 Your full course is ready! Redirecting you now...");
          navigate("/my-course");
        }
      } catch (e) {
        console.error("⚠️ Error polling job status:", e);
      }
    }, 5000); // alle 5 Sekunden prüfen

    return () => clearInterval(interval);
  }, [navigate]);

  // Get wizard data from navigation state
  const wizardData = location.state?.wizardData;
  const recommended = location.state?.recommended;
  const fromWizard = !!wizardData;

  const tiers: PricingTier[] = [
    {
      name: "Free",
      price: 0,
      priceAnnual: 0,
      description: "Perfect for testing the waters",
      features: [
        "Demo + limited preview",
        "Coursia watermark",
        "Marketplace opt-out",
        "10% revenue share if published"
      ],
      cta: "Start Free"
    },
    {
      name: "Starter",
      price: 39.99,
      priceAnnual: 35.99,
      description: "For emerging creators",
      features: [
        "Up to 5 courses",
        "Limited AI credits",
        "Standard marketplace listing",
        "2% revenue share"
      ],
      cta: "Get Started"
    },
    {
      name: "Pro",
      price: 69.99,
      priceAnnual: 62.99,
      description: "For serious course creators",
      features: [
        "Unlimited courses",
        "Priority processing",
        "Premium templates",
        "No revenue share"
      ],
      highlighted: true,
      cta: "Go Pro"
    },
    {
      name: "Enterprise",
      price: 119.99,
      priceAnnual: 107.99,
      description: "For organizations at scale",
      features: [
        "Custom pricing available",
        "SSO integration",
        "SLAs & dedicated support",
        "Bulk licensing",
        "White-label options"
      ],
      cta: "Contact Sales"
    }
  ];

  const getRecommendationReason = (tierName: string) => {
    if (!wizardData || !recommended || recommended !== tierName) return null;

    const reasons: Record<string, string> = {
      "Free": "Great for trying out Coursia with a single course demo",
      "Starter": "Perfect for your course size and getting started with a few courses",
      "Pro": "Ideal for unlimited courses with premium features and no revenue share",
      "Enterprise": "Best for large-scale deployment with advanced features"
    };

    return reasons[tierName];
  };

  return (
    <div className="min-h-screen relative">
      <BackgroundOrbs />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Logo className="h-12 md:h-14 object-contain cursor-pointer" onClick={() => navigate("/")} />
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <div className="pt-32 pb-20 px-4 relative z-10">
        <div className="container mx-auto max-w-7xl">
          {/* Header Section */}
          <div className="text-center mb-12 animate-slide-up">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Choose Your <span className="gradient-text">Perfect Plan</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              {fromWizard
                ? "To create your complete course, please select an offer below"
                : "Transform your expertise into beautiful courses with the plan that fits your ambitions"
              }
            </p>

            {/* Monthly/Annual Toggle */}
            <div className="inline-flex items-center gap-3 glass rounded-full p-1.5">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${!isAnnual
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${isAnnual
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Annual
                <span className="ml-2 text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded-full">
                  Save 10%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((tier, index) => {
              const price = isAnnual ? tier.priceAnnual : tier.price;
              const isRecommended = recommended === tier.name;
              const recommendationReason = getRecommendationReason(tier.name);

              return (
                <div
                  key={tier.name}
                  className={`relative animate-slide-up`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Recommended Badge */}
                  {isRecommended && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <div className="glass-strong rounded-full px-4 py-1.5 flex items-center gap-2 shadow-glow border border-primary/50">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-semibold text-primary">Recommended for You</span>
                      </div>
                    </div>
                  )}

                  <div
                    className={`h-full glass rounded-2xl p-8 transition-all duration-300 hover:scale-105 cursor-pointer ${tier.highlighted
                      ? "border-2 border-primary/50 shadow-glow"
                      : "border border-glass-border hover:border-primary/30"
                      } ${isRecommended ? "ring-2 ring-primary/30" : ""} ${selectedTier === tier.name ? "ring-2 ring-primary shadow-glow" : ""
                      }`}
                    onClick={() => fromWizard && setSelectedTier(tier.name)}
                  >
                    {/* Tier Header */}
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                      <p className="text-sm text-muted-foreground">{tier.description}</p>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-bold gradient-text">
                          ${price === 0 ? "0" : Math.floor(price)}
                        </span>
                        {price > 0 && price % 1 !== 0 && (
                          <span className="text-2xl gradient-text">.{(price % 1).toFixed(2).slice(2)}</span>
                        )}
                        {price > 0 && (
                          <span className="text-muted-foreground ml-1">
                            /mo
                          </span>
                        )}
                      </div>
                      {isAnnual && price > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Billed annually (${(price * 12).toFixed(2)})
                        </p>
                      )}
                    </div>

                    {/* Recommendation Reason */}
                    {recommendationReason && (
                      <div className="mb-6 p-3 rounded-lg bg-primary/10 border border-primary/20">
                        <p className="text-xs text-primary font-medium">
                          {recommendationReason}
                        </p>
                      </div>
                    )}

                    {/* Features */}
                    <ul className="space-y-3 mb-8 flex-grow">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground/90">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    {!fromWizard && (
                      <Button
                        variant={tier.highlighted ? "gradient" : "glass"}
                        size="lg"
                        className="w-full"
                      >
                        {tier.cta}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Create Course Button (only shown when coming from wizard) */}
          {fromWizard && (
            <div className="text-center mt-12">
              <Button
                variant="gradient"
                size="lg"
                disabled={!selectedTier}
                className="min-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={async () => {
                  if (!selectedTier) return;
                  setSelectedTier("loading");

                  try {
                    console.log("🚀 Starting full course generation...");

                    const previewData = JSON.parse(sessionStorage.getItem("coursia_preview") || "{}");

                    const res = await fetch("http://127.0.0.1:8000/api/generate-full-course", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ course: previewData }),
                    });

                    const data = await res.json();

                    if (!data.job_id) throw new Error("No job ID returned from backend");

                    console.log("⏳ Job started, polling for status...", data.job_id);

                    // Polling starten
                    const fullCourse = await pollJobStatus(data.job_id, (s) =>
                      console.log("📡 Status:", s)
                    );

                    console.log("✅ Full course ready:", fullCourse);

                    // Redirect zur MyCourse Seite
                    navigate("/my-course");
                  } catch (err) {
                    console.error("❌ Error generating course:", err);
                    alert("There was a problem generating your full course. Check the console.");
                  } finally {
                    setSelectedTier(null);
                  }
                }}
              >
                {selectedTier === "loading" ? "Generating..." : "Create Course"}
              </Button>
            </div>
          )}

          {/* Footer Note */}
          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground">
              All plans include access to the Coursia marketplace and AI-powered course generation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;