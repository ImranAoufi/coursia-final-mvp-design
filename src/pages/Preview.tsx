// FILE: src/pages/Preview.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/Logo";
import { BackgroundOrbs } from "@/components/BackgroundOrbs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";

import { generateFullCourse } from "@/api";
import { 
  ArrowRight, 
  BookOpen, 
  Video, 
  FileText, 
  CheckCircle2, 
  Sparkles,
  Palette,
  Megaphone,
  Edit3,
  ChevronDown,
  ChevronUp,
  Play,
  DollarSign,
  TrendingUp,
  Share2,
  Image,
  Layers,
  Clock,
  Target,
  Users,
  Rocket
} from "lucide-react";

interface LessonPreview {
  lesson_title: string;
  video_titles: string[];
  quiz?: boolean;
  workbook?: boolean;
}

interface CoursePreview {
  topic?: string;
  lessons?: LessonPreview[];
}

const Preview = () => {
  const navigate = useNavigate();
  const [preview, setPreview] = useState<CoursePreview | null>(null);
  const [expandedLesson, setExpandedLesson] = useState<number | null>(0);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("coursia_preview") || sessionStorage.getItem("Coursera Preview");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.course) {
          setPreview({
            topic: parsed.course.course_title,
            lessons: parsed.course.lessons?.map((l: any) => ({
              lesson_title: l.lesson_title || l.title,
              video_titles: Array.isArray(l.videos)
                ? l.videos.map((v: any) => (typeof v === "string" ? v : v.title || v.url))
                : [],
              quiz: !!l.quiz,
              workbook: !!l.workbook
            })),
          });
        } else if (parsed.preview) {
          setPreview(JSON.parse(parsed.preview));
        } else {
          setPreview(parsed as CoursePreview);
        }
      } catch (e) {
        console.error("Failed to parse preview from sessionStorage", e);
      }
    }
  }, []);

  const handleGenerateFullCourse = async () => {
    try {
      setIsGenerating(true);
      const previewData = JSON.parse(sessionStorage.getItem("coursia_preview") || "{}");
      const result = await generateFullCourse(previewData);

      if (!result?.jobId) {
        console.error("No jobId returned from backend:", result);
        alert("Generation started but no job ID received.");
        return;
      }

      sessionStorage.setItem("coursia_job_id", result.jobId);
      navigate("/my-course", { state: { jobId: result.jobId } });
    } catch (err) {
      console.error("Error starting full course generation:", err);
      alert("There was a problem generating the full course.");
    } finally {
      setIsGenerating(false);
    }
  };

  const totalVideos = preview?.lessons?.reduce(
    (sum, l) => sum + (Array.isArray(l.video_titles) ? l.video_titles.length : 0),
    0
  ) ?? 0;

  const totalQuizzes = preview?.lessons?.filter(l => l.quiz).length ?? 0;
  const totalWorkbooks = preview?.lessons?.filter(l => l.workbook).length ?? 0;

  // Generate mock branding data based on topic
  const mockBranding = {
    titleOptions: [
      preview?.topic || "Your Course",
      `Master ${preview?.topic || "This Skill"}`,
      `The Complete ${preview?.topic || "Course"} Guide`
    ],
    colorPalettes: [
      { name: "Ocean Depth", colors: ["#0EA5E9", "#0D9488", "#1E3A5F"] },
      { name: "Sunset Glow", colors: ["#F97316", "#EC4899", "#8B5CF6"] },
      { name: "Forest Calm", colors: ["#22C55E", "#059669", "#065F46"] }
    ]
  };

  const mockMarketing = {
    hooks: [
      `Learn ${preview?.topic || "this skill"} in just ${preview?.lessons?.length || 5} focused lessons`,
      `Transform your expertise with hands-on ${preview?.topic || "knowledge"}`,
      `Join thousands mastering ${preview?.topic || "this subject"} today`
    ],
    suggestedPrice: 97,
    estimatedRevenue: {
      monthly: 2900,
      yearly: 34800
    }
  };

  if (!preview) {
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center p-6">
        <BackgroundOrbs />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl w-full text-center space-y-6 relative z-10"
        >
          <Logo className="mx-auto h-14" />
          <h1 className="text-4xl font-bold gradient-text">Course Preview</h1>
          <p className="text-muted-foreground text-lg">
            No preview found. Go back to the wizard to generate a new preview.
          </p>
          <Button variant="gradient" size="lg" onClick={() => navigate('/wizard')} className="group">
            Back to Wizard
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <BackgroundOrbs />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass py-4">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="pt-24 pb-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}

          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-20 text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm">Your course structure is ready!</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              <span className="gradient-text">{preview.topic ?? 'Your Course'}</span>
            </h1>
            
            {/* Subline: Verb + Outcome + Target Audience/Context */}
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
              Master {preview.topic || "this skill"} and transform your expertise into actionable knowledge for aspiring professionals and lifelong learners.
            </p>
            
            {/* Course Promise: Result + Speed + Clarity */}
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl glass-strong border border-primary/20 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="font-medium text-foreground">
                  Achieve real-world results in {Math.ceil((totalVideos * 8) / 60) || 2} hours with crystal-clear, step-by-step guidance
                </span>
              </div>
            </div>
          </motion.div>

          {/* Stats Strip */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12"
          >
            {[
              { icon: Layers, label: "Lessons", value: preview.lessons?.length ?? 0, color: "text-primary" },
              { icon: Video, label: "Videos", value: totalVideos, color: "text-secondary" },
              { icon: Clock, label: "Duration", value: `${Math.ceil((totalVideos * 8) / 60) || 1}h`, color: "text-accent" },
              { icon: FileText, label: "Quizzes", value: totalQuizzes, color: "text-primary" },
              { icon: BookOpen, label: "Workbooks", value: totalWorkbooks, color: "text-secondary" },
            ].map((stat, idx) => (
              <div key={idx} className="glass-strong rounded-2xl p-6 text-center hover:scale-105 transition-all duration-300">
                <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Main Content Tabs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs defaultValue="curriculum" className="w-full">
              <TabsList className="bg-transparent border-none w-full md:w-auto flex flex-wrap justify-center gap-3 p-0 mb-8">
                <TabsTrigger 
                  value="curriculum" 
                  className="flex items-center gap-2 px-6 py-3 rounded-full glass-strong border border-glass-border data-[state=active]:bg-gradient-brand data-[state=active]:text-white data-[state=active]:border-transparent data-[state=active]:shadow-glow hover:border-primary/50 transition-all duration-300"
                >
                  <Layers className="w-4 h-4" />
                  Curriculum
                </TabsTrigger>
                <TabsTrigger 
                  value="branding" 
                  className="flex items-center gap-2 px-6 py-3 rounded-full glass-strong border border-glass-border data-[state=active]:bg-gradient-brand data-[state=active]:text-white data-[state=active]:border-transparent data-[state=active]:shadow-glow hover:border-primary/50 transition-all duration-300"
                >
                  <Palette className="w-4 h-4" />
                  Branding
                </TabsTrigger>
                <TabsTrigger 
                  value="marketing" 
                  className="flex items-center gap-2 px-6 py-3 rounded-full glass-strong border border-glass-border data-[state=active]:bg-gradient-brand data-[state=active]:text-white data-[state=active]:border-transparent data-[state=active]:shadow-glow hover:border-primary/50 transition-all duration-300"
                >
                  <Megaphone className="w-4 h-4" />
                  Marketing
                </TabsTrigger>
              </TabsList>

              {/* Curriculum Tab */}
              <TabsContent value="curriculum" className="space-y-6">
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold">Course Outline</h2>
                      <Button variant="ghost" size="sm" onClick={() => navigate('/wizard')} className="gap-2">
                        <Edit3 className="w-4 h-4" />
                        Edit in Wizard
                      </Button>
                    </div>

                    {preview.lessons && preview.lessons.length > 0 ? (
                      <div className="space-y-4">
                        {preview.lessons.map((lesson, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="glass-strong rounded-2xl overflow-hidden hover:shadow-glow transition-all duration-300"
                          >
                            <button
                              onClick={() => setExpandedLesson(expandedLesson === idx ? null : idx)}
                              className="w-full p-6 flex items-center justify-between text-left"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center text-white font-bold">
                                  {idx + 1}
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold">{lesson.lesson_title}</h3>
                                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Video className="w-3 h-3" />
                                      {lesson.video_titles.length} videos
                                    </span>
                                    {lesson.quiz && (
                                      <span className="flex items-center gap-1 text-primary">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Quiz
                                      </span>
                                    )}
                                    {lesson.workbook && (
                                      <span className="flex items-center gap-1 text-secondary">
                                        <BookOpen className="w-3 h-3" />
                                        Workbook
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {expandedLesson === idx ? (
                                <ChevronUp className="w-5 h-5 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-muted-foreground" />
                              )}
                            </button>

                            <AnimatePresence>
                              {expandedLesson === idx && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-6 pb-6 pt-2 border-t border-glass-border">
                                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Video Topics:</h4>
                                    <div className="space-y-2">
                                      {lesson.video_titles.map((video, vidIdx) => (
                                        <div
                                          key={vidIdx}
                                          className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                                        >
                                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Play className="w-4 h-4 text-primary" />
                                          </div>
                                          <span className="text-sm">{video}</span>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Sample Script Preview */}
                                    <div className="mt-6 p-4 rounded-xl glass border border-primary/20">
                                      <div className="flex items-center gap-2 mb-3">
                                        <FileText className="w-4 h-4 text-primary" />
                                        <span className="text-sm font-medium">Sample Script Preview</span>
                                        <Badge variant="secondary" className="text-xs">Auto-generated</Badge>
                                      </div>
                                      <p className="text-sm text-muted-foreground italic">
                                        "Welcome to {lesson.lesson_title}. In this lesson, you'll discover the key concepts that will transform your understanding of {preview.topic}. Let's dive in and explore..."
                                      </p>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="glass-strong rounded-2xl p-12 text-center">
                        <p className="text-muted-foreground">No lessons generated yet.</p>
                      </div>
                    )}
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    <Card className="glass-strong border-primary/20 overflow-hidden">
                      <div className="h-2 bg-gradient-brand" />
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Rocket className="w-5 h-5 text-primary" />
                          Ready to Generate?
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Your course structure looks great! Generate the full course including:
                        </p>
                        <ul className="space-y-2 text-sm">
                          {[
                            "Complete video scripts",
                            "Interactive quizzes",
                            "Interactive workbooks",
                            "Professional slide decks",
                            "Landing page & checkout"
                          ].map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-primary" />
                              {item}
                            </li>
                          ))}
                        </ul>
                        <Button 
                          variant="gradient" 
                          className="w-full group" 
                          size="lg"
                          onClick={handleGenerateFullCourse}
                          disabled={isGenerating}
                        >
                          {isGenerating ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                              Generating...
                            </>
                          ) : (
                            <>
                              Generate Full Course
                              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="glass-strong">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Clock className="w-5 h-5 text-muted-foreground" />
                          Estimated Time
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold gradient-text mb-2">
                          ~{Math.ceil(totalVideos * 8)} min
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Total course duration based on {totalVideos} videos
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Branding Tab */}
              <TabsContent value="branding" className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Title Options */}
                  <Card className="glass-strong">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        Title Options
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {mockBranding.titleOptions.map((title, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                            idx === 0 
                              ? "border-primary bg-primary/10 shadow-glow" 
                              : "border-glass-border hover:border-primary/50 hover:bg-white/5"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{title}</span>
                            {idx === 0 && <Badge className="bg-primary text-primary-foreground">Recommended</Badge>}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Color Palettes */}
                  <Card className="glass-strong">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="w-5 h-5 text-secondary" />
                        Color Palettes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {mockBranding.colorPalettes.map((palette, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                            idx === 0 
                              ? "border-primary bg-primary/10" 
                              : "border-glass-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-medium">{palette.name}</span>
                            {idx === 0 && <Badge variant="secondary">Selected</Badge>}
                          </div>
                          <div className="flex gap-2">
                            {palette.colors.map((color, colorIdx) => (
                              <div
                                key={colorIdx}
                                className="w-12 h-12 rounded-xl shadow-lg"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Cover Mockup */}
                  <Card className="glass-strong md:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Image className="w-5 h-5 text-accent" />
                        Cover Mockups
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-6">
                        {[1, 2, 3].map((_, idx) => (
                          <div
                            key={idx}
                            className={`aspect-video rounded-2xl bg-gradient-to-br ${
                              idx === 0 
                                ? "from-primary/40 to-secondary/40 ring-2 ring-primary shadow-glow" 
                                : idx === 1 
                                  ? "from-accent/40 to-primary/40" 
                                  : "from-secondary/40 to-accent/40"
                            } flex items-center justify-center cursor-pointer hover:scale-105 transition-all duration-300`}
                          >
                            <div className="text-center p-6">
                              <div className="text-lg font-bold mb-2 line-clamp-2">{preview.topic}</div>
                              <div className="text-sm text-muted-foreground">Online Course</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Marketing Tab */}
              <TabsContent value="marketing" className="space-y-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Social Hooks */}
                  <Card className="glass-strong lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Share2 className="w-5 h-5 text-primary" />
                        Social Media Hooks
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {mockMarketing.hooks.map((hook, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl glass border border-glass-border hover:border-primary/30 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center shrink-0">
                              <Megaphone className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium">{hook}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                Perfect for: {idx === 0 ? "Twitter/X" : idx === 1 ? "LinkedIn" : "Instagram"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Pricing & Revenue */}
                  <Card className="glass-strong">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-secondary" />
                        Suggested Pricing
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="text-center p-6 rounded-2xl bg-gradient-brand/10 border border-primary/20">
                        <div className="text-4xl font-bold gradient-text mb-2">
                          ${mockMarketing.suggestedPrice}
                        </div>
                        <p className="text-sm text-muted-foreground">Recommended price point</p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-xl glass">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            <span className="text-sm">Monthly (30 sales)</span>
                          </div>
                          <span className="font-bold">${mockMarketing.estimatedRevenue.monthly.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl glass">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-secondary" />
                            <span className="text-sm">Yearly Potential</span>
                          </div>
                          <span className="font-bold">${mockMarketing.estimatedRevenue.yearly.toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Target Audience */}
                  <Card className="glass-strong">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-accent" />
                        Target Audience
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {["Beginners looking to learn", "Professionals upskilling", "Entrepreneurs building expertise"].map((audience, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 rounded-xl glass">
                            <Target className="w-4 h-4 text-primary" />
                            <span className="text-sm">{audience}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Hero Image Preview */}
                  <Card className="glass-strong md:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Image className="w-5 h-5 text-primary" />
                        Hero Image Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-[21/9] rounded-2xl bg-gradient-to-br from-primary/30 via-secondary/20 to-accent/30 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                        <div className="relative z-10 text-center p-8">
                          <h3 className="text-3xl font-bold mb-4">{preview.topic}</h3>
                          <p className="text-muted-foreground mb-6">Transform your knowledge into actionable skills</p>
                          <Button variant="gradient" size="lg" className="pointer-events-none">
                            Enroll Now
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Bottom CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16 text-center"
          >
            <div className="glass-strong rounded-3xl p-12 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">
                Ready to <span className="gradient-text">Bring Your Course to Life?</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                Generate your complete course with scripts, videos, quizzes, and a professional landing page.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="ghost" size="lg" onClick={() => navigate('/wizard')} className="gap-2">
                  <Edit3 className="w-4 h-4" />
                  Edit Inputs
                </Button>
                <Button 
                  variant="gradient" 
                  size="lg" 
                  className="group shadow-glow"
                  onClick={handleGenerateFullCourse}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      Generate Full Course
                      <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Preview;