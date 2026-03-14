import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Rocket, Upload, Wand2, Eye, Check, Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BackgroundOrbs } from "@/components/BackgroundOrbs";
import { UserMenu } from "@/components/UserMenu";
import { soundEngine } from "@/lib/sounds";
import { testBackend, generateFromBackend } from "@/api";

const Landing = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "glass py-3" : "py-4 md:py-6"
          }`}
      >
        <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between">
          <Logo />

          <nav className="hidden md:flex items-center justify-center gap-6 lg:gap-8 flex-1 mx-8">
            <a href="#product" className="text-foreground/70 hover:text-foreground transition-colors text-sm font-medium">
              Product
            </a>
            <a href="#learn" className="text-foreground/70 hover:text-foreground transition-colors text-sm font-medium">
              Learn
            </a>
            <button
              onClick={() => navigate("/pricing")}
              className="text-foreground/70 hover:text-foreground transition-colors text-sm font-medium"
            >
              Pricing
            </button>
            <button
              onClick={() => navigate("/enterprise")}
              className="text-foreground/70 hover:text-foreground transition-colors text-sm font-medium"
            >
              Enterprise
            </button>
            <button
              onClick={() => navigate("/marketplace")}
              className="relative px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 text-primary font-semibold text-sm hover:border-primary/50 hover:shadow-glow transition-all duration-300"
            >
              Marketplace
            </button>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <UserMenu />
            <Button variant="gradient" onClick={handleStartCreating} className="group hidden sm:inline-flex">
              Start Creating
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg glass"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-strong border-t border-white/10 mt-2">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
              <a href="#product" className="text-foreground/70 hover:text-foreground transition-colors text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                Product
              </a>
              <a href="#learn" className="text-foreground/70 hover:text-foreground transition-colors text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                Learn
              </a>
              <button onClick={() => { navigate("/pricing"); setMobileMenuOpen(false); }} className="text-foreground/70 hover:text-foreground transition-colors text-sm font-medium py-2 text-left">
                Pricing
              </button>
              <button onClick={() => { navigate("/enterprise"); setMobileMenuOpen(false); }} className="text-foreground/70 hover:text-foreground transition-colors text-sm font-medium py-2 text-left">
                Enterprise
              </button>
              <button onClick={() => { navigate("/marketplace"); setMobileMenuOpen(false); }} className="text-primary font-semibold text-sm py-2 text-left">
                Marketplace
              </button>
              <Button variant="gradient" onClick={() => { handleStartCreating(); setMobileMenuOpen(false); }} className="w-full mt-2 sm:hidden">
                Start Creating
                <ArrowRight className="ml-2" />
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-28 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6 sm:mb-8 animate-slide-up">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs sm:text-sm">Build. Launch. Earn. In one hour.</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 animate-slide-up leading-tight">
            Turn Your Knowledge
            <br />
            <span className="gradient-text">Into a Course. Instantly.</span>
          </h1>

          <p className="text-base sm:text-xl md:text-2xl text-muted-foreground mb-8 sm:mb-12 animate-slide-up max-w-3xl mx-auto px-2" style={{ animationDelay: "0.1s" }}>
            Coursia builds your entire course - lessons, videos, quizzes, and landing page. From your words.
            <span className="text-foreground font-medium"> Upload once. We handle the rest.</span>
          </p>

          <div className="flex flex-col items-center gap-4 animate-slide-up relative z-20" style={{ animationDelay: "0.2s" }}>
            <Button
              variant="gradient"
              size="lg"
              onClick={handleStartCreating}
              className="text-base sm:text-lg px-8 sm:px-12 py-5 sm:py-6 h-auto group shadow-glow"
            >
              Start Creating My Course
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Interactive Creation Card */}
          <div
            className="glass-strong rounded-2xl p-5 sm:p-8 mt-10 sm:mt-16 max-w-2xl mx-auto cursor-pointer hover:scale-[1.02] transition-all duration-300 group animate-slide-up"
            style={{ animationDelay: "0.3s" }}
            onClick={handleStartCreating}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-2xl font-semibold">Create Your First Course</h3>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-brand flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wand2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
            <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
              It's real. You're seconds away from your first course layout.
            </p>
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div className="glass rounded-lg p-3 sm:p-4 text-center hover:glass-strong transition-all">
                <Upload className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-primary" />
                <p className="text-xs sm:text-sm">Upload</p>
              </div>
              <div className="glass rounded-lg p-3 sm:p-4 text-center hover:glass-strong transition-all">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-secondary" />
                <p className="text-xs sm:text-sm">AI Generates</p>
              </div>
              <div className="glass rounded-lg p-3 sm:p-4 text-center hover:glass-strong transition-all">
                <Rocket className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-accent" />
                <p className="text-xs sm:text-sm">Launch</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="py-6 sm:py-8 border-y border-glass-border">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 sm:gap-8 text-center">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              <span className="text-muted-foreground text-sm">Trusted by 1,200+ coaches</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              <span className="text-muted-foreground text-sm">&lt;5 min setup</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              <span className="text-muted-foreground text-sm">98% satisfaction in pilot launch</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why Coursia */}
      <section className="py-16 sm:py-24 px-4 sm:px-6" id="product">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-10 sm:mb-16">
            Why <span className="gradient-text">Coursia</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="glass-strong rounded-2xl p-6 sm:p-8 hover:scale-105 transition-all duration-300 group cursor-pointer">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Real You, Pro Quality</h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                You record. We polish. Instantly pro-level production without the learning curve.
              </p>
            </div>

            <div className="glass-strong rounded-2xl p-6 sm:p-8 hover:scale-105 transition-all duration-300 group cursor-pointer">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-secondary" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Everything Auto-Generated</h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Curriculum, quizzes, landing page, marketing assets - all built for you automatically.
              </p>
            </div>

            <div className="glass-strong rounded-2xl p-6 sm:p-8 hover:scale-105 transition-all duration-300 group cursor-pointer">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <Rocket className="w-7 h-7 sm:w-8 sm:h-8 text-accent" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Launch & Sell in Hours</h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                One click. Full brand. Live site. Start earning from your expertise today.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-24 px-4 sm:px-6" id="learn">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-10 sm:mb-16">
            How It <span className="gradient-text">Works</span>
          </h2>

          <div className="relative">
            {/* Connection line */}
            <div className="absolute top-12 left-0 right-0 h-0.5 bg-gradient-brand opacity-20 hidden md:block" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 relative">
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
                  <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl glass-strong flex items-center justify-center mb-3 sm:mb-6 group-hover:shadow-glow transition-all duration-300 relative z-10">
                    <step.icon className="w-7 h-7 sm:w-10 sm:h-10 text-primary" />
                  </div>
                  <div className="text-xs sm:text-sm text-primary font-semibold mb-1 sm:mb-2">{step.num}</div>
                  <h3 className="text-sm sm:text-xl font-semibold mb-1 sm:mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm hidden sm:block">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Emotional CTA */}
      <section className="py-16 sm:py-32 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            You Focus on Teaching.
            <br />
            <span className="gradient-text">Coursia Handles the Rest.</span>
          </h2>
          <p className="text-base sm:text-xl text-muted-foreground mb-8 sm:mb-12 max-w-2xl mx-auto">
            No more editing, designing, or building. Just record and publish - in hours.
          </p>
          <div className="relative z-20">
            <Button
              variant="gradient"
              size="lg"
              onClick={handleStartCreating}
              className="text-base sm:text-lg px-8 sm:px-12 py-5 sm:py-6 h-auto group shadow-glow"
            >
              Start My Course Now
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass border-t border-glass-border py-6 sm:py-8 px-4 sm:px-6">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">© Coursia 2025</p>
          <nav className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center">
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
