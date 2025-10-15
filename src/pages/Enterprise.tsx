import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Sparkles, 
  Building2, 
  Users, 
  ShoppingBag, 
  BarChart3, 
  Bot,
  GraduationCap,
  Briefcase,
  TrendingUp,
  Check
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BackgroundOrbs } from "@/components/BackgroundOrbs";
import logoFull from "@/assets/logo-full.png";

const Enterprise = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleBookDemo = () => {
    // TODO: Implement demo booking functionality
    console.log("Book demo clicked");
  };

  return (
    <div className="min-h-screen">
      <BackgroundOrbs />
      
      {/* Sticky Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "glass py-3" : "py-6"
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Logo className="h-16 md:h-20 object-contain cursor-pointer" onClick={() => navigate("/")} />
          
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => navigate("/#product")}
              className="text-foreground/80 hover:text-foreground transition-colors"
            >
              Product
            </button>
            <button 
              onClick={() => navigate("/#learn")}
              className="text-foreground/80 hover:text-foreground transition-colors"
            >
              Learn
            </button>
            <button 
              onClick={() => navigate("/pricing")}
              className="text-foreground/80 hover:text-foreground transition-colors"
            >
              Pricing
            </button>
            <button 
              onClick={() => navigate("/enterprise")}
              className="text-foreground hover:text-foreground transition-colors font-semibold"
            >
              Enterprise
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button className="text-foreground/80 hover:text-foreground transition-colors">
              Login
            </button>
            <Button variant="gradient" onClick={handleBookDemo} className="group">
              Book a Demo
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="container mx-auto max-w-6xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-slide-up">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Enterprise Solution</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up leading-tight">
            Transform how your
            <br />
            organization learns —
            <br />
            powered by
            <br />
            <span className="inline-flex items-center justify-center gap-4 mt-2">
              <Logo className="h-24 md:h-28 lg:h-32 inline-block" />
              <span className="gradient-text">Enterprise.</span>
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-12 animate-slide-up max-w-4xl mx-auto leading-relaxed" style={{ animationDelay: "0.1s" }}>
            Custom AI course creation and branded learning infrastructure for teams, schools, and companies.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up relative z-20" style={{ animationDelay: "0.2s" }}>
            <Button 
              variant="gradient" 
              size="lg" 
              onClick={handleBookDemo}
              className="text-lg px-12 py-6 h-auto group shadow-glow"
            >
              Book a Demo
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="glass" 
              size="lg" 
              onClick={handleBookDemo}
              className="text-lg px-12 py-6 h-auto"
            >
              Talk to Sales
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            Join 50+ organizations transforming their learning infrastructure
          </p>
        </div>
      </section>

      {/* Core Value Section */}
      <section className="py-24 px-6 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Enterprise-Grade <span className="gradient-text">Features</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything your organization needs to build, deploy, and scale a world-class learning ecosystem
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Building2,
                title: "Custom Branding",
                description: "Own domain, white-label design, and fully branded dashboards that reflect your organization's identity",
                color: "primary"
              },
              {
                icon: Users,
                title: "Multi-user Access",
                description: "Manage multiple instructors, teams, or departments with granular permissions and role-based access control",
                color: "secondary"
              },
              {
                icon: ShoppingBag,
                title: "Private Course Marketplaces",
                description: "Create internal or external course marketplaces with flexible monetization and payment processing",
                color: "accent"
              },
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                description: "Deep learner insights, engagement tracking, and AI-driven recommendations to optimize learning outcomes",
                color: "primary"
              },
              {
                icon: Bot,
                title: "Dedicated AI Support",
                description: "Fine-tuned AI model trained on your organization's tone, style, and content standards",
                color: "secondary"
              },
              {
                icon: Sparkles,
                title: "Priority Support",
                description: "Dedicated success manager, 24/7 technical support, and custom integration assistance",
                color: "accent"
              }
            ].map((feature, idx) => (
              <div 
                key={idx}
                className="glass-strong rounded-2xl p-8 hover:scale-[1.02] transition-all duration-300 group cursor-pointer animate-slide-up"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className={`w-14 h-14 rounded-xl bg-${feature.color}/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-7 h-7 text-${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24 px-6 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Built for <span className="gradient-text">Every Organization</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From education to enterprise, Coursia Enterprise scales with your needs
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Education */}
            <div className="glass-strong rounded-3xl p-8 hover:scale-[1.02] transition-all duration-500 group cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:shadow-glow transition-all">
                  <GraduationCap className="w-8 h-8 text-primary" />
                </div>
                
                <h3 className="text-2xl font-bold mb-4">🧑‍🏫 Education</h3>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Universities & academies turning their curriculum into interactive AI-driven courses
                </p>
                
                <div className="space-y-3">
                  {[
                    "Transform traditional curricula into engaging online courses",
                    "Scale faculty expertise across thousands of students",
                    "Automated grading and personalized learning paths",
                    "Integrated certification and credentialing"
                  ].map((point, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Corporate Training */}
            <div className="glass-strong rounded-3xl p-8 hover:scale-[1.02] transition-all duration-500 group cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:shadow-glow transition-all">
                  <Briefcase className="w-8 h-8 text-secondary" />
                </div>
                
                <h3 className="text-2xl font-bold mb-4">🧑‍💼 Corporate Training</h3>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Companies training employees at scale with consistent quality
                </p>
                
                <div className="space-y-3">
                  {[
                    "Onboard new hires with automated training modules",
                    "Upskill teams with role-specific learning paths",
                    "Track compliance and certification requirements",
                    "Reduce training costs by 70% with AI automation"
                  ].map((point, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Agencies & Creators */}
            <div className="glass-strong rounded-3xl p-8 hover:scale-[1.02] transition-all duration-500 group cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:shadow-glow transition-all">
                  <TrendingUp className="w-8 h-8 text-accent" />
                </div>
                
                <h3 className="text-2xl font-bold mb-4">💸 Agencies & Creators</h3>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Businesses that sell 100+ courses under one unified brand
                </p>
                
                <div className="space-y-3">
                  {[
                    "Build white-label course platforms for clients",
                    "Launch course marketplaces with payment integration",
                    "Scale content production without scaling team size",
                    "Multi-tenant architecture for managing clients"
                  ].map((point, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="glass-strong rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-brand opacity-5" />
            
            <div className="relative z-10 grid md:grid-cols-4 gap-8 text-center">
              {[
                { value: "50+", label: "Enterprise Clients" },
                { value: "500K+", label: "Active Learners" },
                { value: "10M+", label: "Courses Generated" },
                { value: "99.9%", label: "Uptime SLA" }
              ].map((stat, idx) => (
                <div key={idx} className="animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Ready to build your organization's
            <br />
            <span className="gradient-text">learning ecosystem?</span>
          </h2>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join the future of education. Let's discuss how Coursia Enterprise can transform your organization's learning infrastructure.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-20">
            <Button 
              variant="gradient" 
              size="lg" 
              onClick={handleBookDemo}
              className="text-lg px-12 py-6 h-auto group shadow-glow"
            >
              Book an Enterprise Demo
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="glass" 
              size="lg" 
              onClick={handleBookDemo}
              className="text-lg px-12 py-6 h-auto"
            >
              Contact our Enterprise Team
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-8">
            Trusted by leading universities, Fortune 500 companies, and innovative agencies worldwide
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass border-t border-glass-border py-8 px-6">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">© Coursia 2025</p>
          <nav className="flex items-center gap-6">
            <button 
              onClick={() => navigate("/#product")}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Product
            </button>
            <button 
              onClick={() => navigate("/#learn")}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Learn
            </button>
            <button 
              onClick={() => navigate("/pricing")}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Pricing
            </button>
            <button 
              onClick={() => navigate("/enterprise")}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Enterprise
            </button>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Enterprise;