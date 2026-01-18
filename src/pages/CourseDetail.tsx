import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BackgroundOrbs } from "@/components/BackgroundOrbs";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  ArrowLeft, 
  Star, 
  Clock, 
  Users, 
  Play, 
  FileText, 
  CheckCircle2,
  BookOpen,
  Crown,
  Loader2,
  Brain,
  Film,
  Sparkles,
  GraduationCap,
  X
} from "lucide-react";
import { QuizDisplay } from "@/components/QuizDisplay";
import WorkbookDisplay from "@/components/WorkbookDisplay";

interface Course {
  id: string;
  title: string;
  instructor: string;
  rating: number;
  reviews: number;
  price: number;
  duration: string;
  students: number;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  image: string;
  featured?: boolean;
  isUserCourse?: boolean;
  courseData?: any;
}

interface Lesson {
  lesson_title: string;
  videos?: Array<{ title?: string; script_file?: string; script_content?: string } | string>;
  video_titles?: string[];
  quiz_file?: string;
  workbook_file?: string;
}

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  // Content viewing states
  const [openScript, setOpenScript] = useState(false);
  const [activeScriptTitle, setActiveScriptTitle] = useState<string | null>(null);
  const [activeScriptContent, setActiveScriptContent] = useState<string | null>(null);

  const [openQuiz, setOpenQuiz] = useState(false);
  const [activeQuizTitle, setActiveQuizTitle] = useState<string | null>(null);
  const [activeQuizContent, setActiveQuizContent] = useState<any>(null);

  const [openWorkbook, setOpenWorkbook] = useState(false);
  const [activeWorkbookTitle, setActiveWorkbookTitle] = useState<string | null>(null);
  const [activeWorkbookContent, setActiveWorkbookContent] = useState<string | null>(null);
  const [activeWorkbookLessonIndex, setActiveWorkbookLessonIndex] = useState<number | null>(null);

  useEffect(() => {
    // Load course from localStorage or use mock data
    const published = JSON.parse(localStorage.getItem("coursia_published_courses") || "[]");
    const allCourses = [...published, ...getMockCourses()];
    const found = allCourses.find((c: Course) => c.id === courseId);
    
    if (found) {
      setCourse(found);
    }
    setLoading(false);
  }, [courseId]);

  const handleViewScript = (title: string, content?: string) => {
    if (!content) return;
    setActiveScriptTitle(title);
    setActiveScriptContent(content);
    setOpenScript(true);
  };

  const handleViewQuiz = (title: string, quizData: any) => {
    if (!quizData) return;
    setActiveQuizTitle(title);
    setActiveQuizContent(quizData);
    setOpenQuiz(true);
  };

  const handleViewWorkbook = (title: string, content: string, lessonIndex: number) => {
    if (!content) return;
    setActiveWorkbookTitle(title);
    setActiveWorkbookContent(content);
    setActiveWorkbookLessonIndex(lessonIndex);
    setOpenWorkbook(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Course not found</p>
        <Button variant="gradient" onClick={() => navigate("/marketplace")}>
          Back to Marketplace
        </Button>
      </div>
    );
  }

  const courseData = course.courseData;
  const lessons: Lesson[] = courseData?.lessons || [];
  const totalVideos = lessons.reduce((acc: number, lesson: Lesson) => {
    const videoCount = lesson.videos?.length || lesson.video_titles?.length || 0;
    return acc + videoCount;
  }, 0);

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <BackgroundOrbs />

      {/* Header */}
      <header className="relative z-10 glass-strong border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/">
            <Logo className="h-12 md:h-14 object-contain" />
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link to="/marketplace" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Marketplace
            </Link>
            <Link to="/my-course" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              My Courses
            </Link>
            <ThemeToggle />
            <UserMenu />
          </nav>
        </div>
      </header>

      <div className="relative z-10 pt-8 pb-16 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Button 
              variant="ghost" 
              onClick={() => navigate("/marketplace")}
              className="gap-2 hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Marketplace
            </Button>
          </motion.div>

          {/* Course Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-strong rounded-3xl overflow-hidden border border-white/10 mb-8"
          >
            <div className="relative h-64 md:h-80 overflow-hidden">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
              
              {course.isUserCourse && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 px-4 py-2 rounded-full shadow-lg">
                  <Crown className="w-4 h-4 text-white inline mr-2" />
                  <span className="text-sm font-semibold text-white">Your Course</span>
                </div>
              )}

              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium text-primary bg-primary/20 px-3 py-1 rounded-full backdrop-blur-sm">
                    {course.category}
                  </span>
                  <span className="text-xs text-white/80 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                    {course.level}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {course.title}
                </h1>
                <p className="text-white/80">by {course.instructor}</p>
              </div>
            </div>

            <div className="p-6 md:p-8">
              {/* Course Description */}
              {courseData?.course_description && (
                <p className="text-muted-foreground mb-6 text-lg">
                  {courseData.course_description}
                </p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-primary text-primary" />
                  <span className="font-semibold">{course.rating}</span>
                  <span className="text-muted-foreground">({course.reviews.toLocaleString()} reviews)</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-5 h-5" />
                  <span>{course.students.toLocaleString()} students</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-5 h-5" />
                  <span>{course.duration}</span>
                </div>
                {totalVideos > 0 && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Play className="w-5 h-5" />
                    <span>{totalVideos} videos</span>
                  </div>
                )}
              </div>

              {/* Price & Enroll */}
              <div className="flex items-center gap-6">
                <span className="text-4xl font-bold gradient-text">${course.price}</span>
                <Button variant="gradient" size="lg" className="px-8">
                  Enroll Now
                </Button>
                {course.isUserCourse && (
                  <Button 
                    variant="glass" 
                    size="lg"
                    onClick={() => navigate("/my-course")}
                  >
                    Go to My Course
                  </Button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Course Content - Full Curriculum */}
          {lessons.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-strong rounded-3xl border border-white/10 p-6 md:p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/20">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Course Curriculum</h2>
                  <p className="text-sm text-muted-foreground">{lessons.length} lessons • {totalVideos} videos</p>
                </div>
              </div>

              <Accordion type="single" collapsible className="space-y-3">
                {lessons.map((lesson: Lesson, index: number) => {
                  const videos = lesson.videos || [];
                  const hasQuiz = !!lesson.quiz_file;
                  const hasWorkbook = !!lesson.workbook_file;

                  return (
                    <AccordionItem 
                      key={index} 
                      value={`lesson-${index}`}
                      className="glass border border-white/10 rounded-xl overflow-hidden hover:shadow-glass transition-all duration-300"
                    >
                      <AccordionTrigger className="px-5 py-4 hover:no-underline group">
                        <div className="flex items-center gap-4 text-left w-full">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/20 shrink-0 group-hover:scale-105 transition-transform">
                            <span className="text-lg font-bold gradient-text">{index + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-base block truncate">{lesson.lesson_title || `Lesson ${index + 1}`}</span>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Film className="w-3 h-3" /> {videos.length} Videos
                              </span>
                              {hasQuiz && (
                                <span className="text-xs text-emerald-500 flex items-center gap-1">
                                  <Brain className="w-3 h-3" /> Quiz
                                </span>
                              )}
                              {hasWorkbook && (
                                <span className="text-xs text-secondary flex items-center gap-1">
                                  <BookOpen className="w-3 h-3" /> Workbook
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-5 pb-4">
                        <div className="space-y-2 ml-16">
                          {/* Videos */}
                          {videos.map((video: any, vIndex: number) => {
                            const videoTitle = typeof video === 'string' ? video : video.title;
                            
                            return (
                              <motion.div
                                key={vIndex}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: vIndex * 0.05 }}
                                className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-white/5 transition-colors group/item"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Play className="w-4 h-4 text-primary" />
                                  </div>
                                  <span className="text-sm font-medium">{videoTitle}</span>
                                </div>
                                <span className="text-xs text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity">
                                  Enroll to access
                                </span>
                              </motion.div>
                            );
                          })}

                          {/* Quiz Button */}
                          {hasQuiz && (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-emerald-500/10 transition-colors cursor-pointer group/item"
                              onClick={() => {
                                const quizData = courseData?.quizzes?.[index];
                                if (quizData) {
                                  handleViewQuiz(lesson.lesson_title, quizData);
                                }
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                  <Brain className="w-4 h-4 text-emerald-500" />
                                </div>
                                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                  {courseData?.quizzes?.[index] ? "Take Quiz" : "Quiz (Enroll to access)"}
                                </span>
                              </div>
                              {courseData?.quizzes?.[index] && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                              )}
                            </motion.div>
                          )}

                          {/* Workbook Button */}
                          {hasWorkbook && (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-secondary/10 transition-colors cursor-pointer group/item"
                              onClick={() => {
                                const workbookContent = courseData?.workbooks?.[index];
                                if (workbookContent) {
                                  handleViewWorkbook(lesson.lesson_title, workbookContent, index);
                                }
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                                  <BookOpen className="w-4 h-4 text-secondary" />
                                </div>
                                <span className="text-sm font-medium text-secondary">
                                  {courseData?.workbooks?.[index] ? "Interactive Workbook" : "Workbook (Enroll to access)"}
                                </span>
                              </div>
                              {courseData?.workbooks?.[index] && (
                                <Sparkles className="w-4 h-4 text-secondary opacity-0 group-hover/item:opacity-100 transition-opacity" />
                              )}
                            </motion.div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-strong rounded-3xl border border-white/10 p-6 md:p-8 text-center"
            >
              <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Course Content</h2>
              <p className="text-muted-foreground mb-6">
                This course includes {course.duration} of comprehensive learning material.
              </p>
              <Button variant="gradient" size="lg">
                Enroll to Access Content
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Script Modal */}
      <Dialog open={openScript} onOpenChange={setOpenScript}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <span>{activeScriptTitle}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto rounded-xl bg-muted/30 p-6">
            <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono">
              {activeScriptContent}
            </pre>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quiz Modal */}
      <Dialog open={openQuiz} onOpenChange={setOpenQuiz}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                <Brain className="w-5 h-5 text-emerald-500" />
              </div>
              <span>Quiz: {activeQuizTitle}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            {activeQuizContent && (
              <QuizDisplay 
                quizData={activeQuizContent} 
                onClose={() => setOpenQuiz(false)} 
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Workbook Modal */}
      <Dialog open={openWorkbook} onOpenChange={setOpenWorkbook}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-secondary" />
              </div>
              <span>Workbook: {activeWorkbookTitle}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            {activeWorkbookContent && (
              <WorkbookDisplay 
                workbook={activeWorkbookContent}
                courseId={course?.id}
                lessonId={activeWorkbookLessonIndex !== null ? `lesson_${activeWorkbookLessonIndex + 1}` : undefined}
                onClose={() => setOpenWorkbook(false)} 
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Mock courses to match Marketplace
function getMockCourses(): Course[] {
  return [
    {
      id: "1",
      title: "Mastering AI & Machine Learning",
      instructor: "Dr. Sarah Chen",
      rating: 4.9,
      reviews: 2847,
      price: 149,
      duration: "12 weeks",
      students: 15234,
      category: "Technology",
      level: "Advanced",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
      featured: true,
    },
    {
      id: "2",
      title: "Digital Marketing Masterclass",
      instructor: "Marcus Rodriguez",
      rating: 4.8,
      reviews: 1923,
      price: 99,
      duration: "8 weeks",
      students: 8392,
      category: "Business",
      level: "Intermediate",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
      featured: true,
    },
    {
      id: "3",
      title: "UX/UI Design Principles",
      instructor: "Emma Thompson",
      rating: 4.9,
      reviews: 3102,
      price: 129,
      duration: "10 weeks",
      students: 12450,
      category: "Design",
      level: "Intermediate",
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
    },
    {
      id: "4",
      title: "Blockchain & Web3 Development",
      instructor: "Alex Kumar",
      rating: 4.7,
      reviews: 1456,
      price: 179,
      duration: "14 weeks",
      students: 6789,
      category: "Technology",
      level: "Advanced",
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80",
    },
    {
      id: "5",
      title: "Business Strategy & Leadership",
      instructor: "David Park",
      rating: 4.8,
      reviews: 2134,
      price: 159,
      duration: "9 weeks",
      students: 9823,
      category: "Business",
      level: "Advanced",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
    },
    {
      id: "6",
      title: "Photography Fundamentals",
      instructor: "Lisa Anderson",
      rating: 4.9,
      reviews: 4521,
      price: 79,
      duration: "6 weeks",
      students: 18934,
      category: "Creative",
      level: "Beginner",
      image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&q=80",
    },
  ];
}
