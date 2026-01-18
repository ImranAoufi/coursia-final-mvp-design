import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BackgroundOrbs } from "@/components/BackgroundOrbs";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import { Button } from "@/components/ui/button";
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
  Loader2
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

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
  const lessons = courseData?.lessons || [];
  const totalVideos = lessons.reduce((acc: number, lesson: any) => {
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

          {/* Course Content */}
          {lessons.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-strong rounded-3xl border border-white/10 p-6 md:p-8"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-primary" />
                Course Curriculum
              </h2>

              <Accordion type="single" collapsible className="space-y-3">
                {lessons.map((lesson: any, index: number) => {
                  const videos = lesson.videos || [];
                  const videoTitles = lesson.video_titles || videos.map((v: any) => v.title);
                  const hasQuiz = lesson.quiz_file || lesson.quiz;
                  const hasWorkbook = lesson.workbook_file || lesson.workbook;

                  return (
                    <AccordionItem 
                      key={index} 
                      value={`lesson-${index}`}
                      className="glass border border-white/10 rounded-xl overflow-hidden"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-white/5">
                        <div className="flex items-center gap-4 text-left">
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-semibold text-sm">
                            {index + 1}
                          </span>
                          <div>
                            <h3 className="font-semibold">{lesson.lesson_title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {videoTitles.length} videos
                              {hasQuiz && " • Quiz"}
                              {hasWorkbook && " • Workbook"}
                            </p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4">
                        <div className="space-y-2 ml-12">
                          {videoTitles.map((title: string, vIndex: number) => (
                            <div 
                              key={vIndex}
                              className="flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-white/5 transition-colors"
                            >
                              <Play className="w-4 h-4 text-primary" />
                              <span className="text-sm">{title}</span>
                            </div>
                          ))}
                          {hasQuiz && (
                            <div className="flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-white/5 transition-colors">
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                              <span className="text-sm">Quiz</span>
                            </div>
                          )}
                          {hasWorkbook && (
                            <div className="flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-white/5 transition-colors">
                              <FileText className="w-4 h-4 text-blue-500" />
                              <span className="text-sm">Interactive Workbook</span>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </motion.div>
          )}

          {/* If no courseData, show basic info */}
          {!courseData && (
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
