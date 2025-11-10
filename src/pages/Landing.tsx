import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Rocket, Upload, Wand2, Eye, Check } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BackgroundOrbs } from "@/components/BackgroundOrbs";
import { soundEngine } from "@/lib/sounds";
import { testBackend, generateFromBackend } from "@/api";

const Landing = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleStartCreating = () => {
    soundEngine.playConfirmation();
    navigate("/wizard");
  };

  return (
    <div className="min-h-screen relative">
      <BackgroundOrbs />

      {/* Sticky Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "glass py-3" : "py-6"
          }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Logo />

          <nav className="hidden md:flex items-center gap-8">
            <a href="#product" className="text-foreground/80 hover:text-foreground transition-colors">
              Product
            </a>
            <a href="#learn" className="text-foreground/80 hover:text-foreground transition-colors">
              Learn
            </a>
            <button
              onClick={() => navigate("/pricing")}
              className="text-foreground/80 hover:text-foreground transition-colors"
            >
              Pricing
            </button>
            <button
              onClick={() => navigate("/enterprise")}
              className="text-foreground/80 hover:text-foreground transition-colors"
            >
              Enterprise
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button className="text-foreground/80 hover:text-foreground transition-colors">
              Login
            </button>
            <Button variant="gradient" onClick={handleStartCreating} className="group">
              Start Creating
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-slide-up">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm">Build. Launch. Earn. In one hour.</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-up leading-tight">
            Turn Your Knowledge
            <br />
            <span className="gradient-text">Into a Course — Instantly.</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-12 animate-slide-up max-w-3xl mx-auto" style={{ animationDelay: "0.1s" }}>
            Coursia builds your entire course — lessons, videos, quizzes, and landing page — from your words.
            <span className="text-foreground font-medium"> Upload once. We handle the rest.</span>
          </p>

          <div className="flex flex-col items-center gap-4 animate-slide-up relative z-20" style={{ animationDelay: "0.2s" }}>
            <Button
              variant="gradient"
              size="lg"
              onClick={handleStartCreating}
              className="text-lg px-12 py-6 h-auto group shadow-glow"
            >
              Start Creating My Course
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-sm text-muted-foreground">
              No tech. No templates. Just your expertise — automated.
            </p>
          </div>

          {/* Interactive Creation Card */}
          <div
            className="glass-strong rounded-2xl p-8 mt-16 max-w-2xl mx-auto cursor-pointer hover:scale-[1.02] transition-all duration-300 group animate-slide-up"
            style={{ animationDelay: "0.3s" }}
            onClick={handleStartCreating}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold">Create Your First Course</h3>
              <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wand2 className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-muted-foreground mb-6">
              It's real. You're seconds away from your first course layout.
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="glass rounded-lg p-4 text-center hover:glass-strong transition-all">
                <Upload className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-sm">Upload Materials</p>
              </div>
              <div className="glass rounded-lg p-4 text-center hover:glass-strong transition-all">
                <Sparkles className="w-6 h-6 mx-auto mb-2 text-secondary" />
                <p className="text-sm">AI Generates</p>
              </div>
              <div className="glass rounded-lg p-4 text-center hover:glass-strong transition-all">
                <Rocket className="w-6 h-6 mx-auto mb-2 text-accent" />
                <p className="text-sm">Launch & Earn</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="py-8 border-y border-glass-border">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-8 text-center md:text-left">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              <span className="text-muted-foreground">Trusted by 1,200+ coaches</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              <span className="text-muted-foreground">&lt;5 min setup</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              <span className="text-muted-foreground">98% satisfaction in pilot launch</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why Coursia */}
      <section className="py-24 px-6" id="product">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Why <span className="gradient-text">Coursia</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-strong rounded-2xl p-8 hover:scale-105 transition-all duration-300 group cursor-pointer">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Real You, Pro Quality</h3>
              <p className="text-muted-foreground">
                You record. We polish. Instantly pro-level production without the learning curve.
              </p>
            </div>

            <div className="glass-strong rounded-2xl p-8 hover:scale-105 transition-all duration-300 group cursor-pointer">
              <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Everything Auto-Generated</h3>
              <p className="text-muted-foreground">
                Curriculum, quizzes, landing page, marketing assets — all built for you automatically.
              </p>
            </div>

            <div className="glass-strong rounded-2xl p-8 hover:scale-105 transition-all duration-300 group cursor-pointer">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Rocket className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Launch & Sell in Hours</h3>
              <p className="text-muted-foreground">
                One click. Full brand. Live site. Start earning from your expertise today.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6" id="learn">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            How It <span className="gradient-text">Works</span>
          </h2>

          <div className="relative">
            {/* Connection line */}
            <div className="absolute top-12 left-0 right-0 h-0.5 bg-gradient-brand opacity-20 hidden md:block" />

            <div className="grid md:grid-cols-4 gap-8 relative">
              {[
                { num: "01", title: "Upload your material", icon: Upload, desc: "Drop in notes, slides, videos, or just talk" },
                { num: "02", title: "Coursia generates structure", icon: Wand2, desc: "AI creates curriculum, scripts, and assets" },
                { num: "03", title: "You review & polish", icon: Eye, desc: "Quick edits and personalization in minutes" },
                { num: "04", title: "Launch instantly", icon: Rocket, desc: "One click to publish and start selling" },
              ].map((step, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center text-center group"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="w-24 h-24 rounded-2xl glass-strong flex items-center justify-center mb-6 group-hover:shadow-glow transition-all duration-300 relative z-10">
                    <step.icon className="w-10 h-10 text-primary" />
                  </div>
                  <div className="text-sm text-primary font-semibold mb-2">{step.num}</div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Emotional CTA */}
      <section className="py-32 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            You Focus on Teaching.
            <br />
            <span className="gradient-text">Coursia Handles the Rest.</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            No more editing, designing, or building. Just record and publish — in hours.
          </p>
          <div className="relative z-20">
            <Button
              variant="gradient"
              size="lg"
              onClick={handleStartCreating}
              className="text-lg px-12 py-6 h-auto group shadow-glow"
            >
              Start My Course Now
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass border-t border-glass-border py-8 px-6">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">© Coursia 2025</p>
          <nav className="flex items-center gap-6">
            <a href="#product" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
              Product
            </a>
            <a href="#learn" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
              Learn
            </a>
            <button
              onClick={() => navigate("/pricing")}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Pricing
            </button>
            <a href="#careers" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
              Careers
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
