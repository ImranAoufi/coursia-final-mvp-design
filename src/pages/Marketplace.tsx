import { useState, useEffect, useMemo } from "react";
import { BackgroundOrbs } from "@/components/BackgroundOrbs";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Star, Clock, Users, TrendingUp, Award, Sparkles, ChevronDown, Crown, X, Trash2, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

const mockCourses: Course[] = [
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

const categories = ["All", "Technology", "Business", "Design", "Creative", "Marketing"];
const levels = ["All Levels", "Beginner", "Intermediate", "Advanced"];
const sortOptions = ["Popular", "Highest Rated", "Newest", "Price: Low to High", "Price: High to Low"];

export default function Marketplace() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All Levels");
  const [sortBy, setSortBy] = useState("Popular");
  const [showFilters, setShowFilters] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [allCourses, setAllCourses] = useState<Course[]>(mockCourses);
  const [showMyCourses, setShowMyCourses] = useState(false);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load courses from both localStorage and database
  useEffect(() => {
    loadAllCourses();
  }, []);

  const loadAllCourses = async () => {
    setIsLoading(true);
    try {
      // Fetch published courses from database
      const { data: dbCourses, error } = await supabase
        .from("courses")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false });

      const dbMapped: Course[] = (dbCourses || []).map((c) => ({
        id: c.id,
        title: c.title,
        instructor: c.target_audience || "Coursia Creator",
        rating: 4.7 + Math.random() * 0.3,
        reviews: Math.floor(100 + Math.random() * 2000),
        price: Number(c.custom_price) || 49,
        duration: `${(c.lessons as any[])?.length || 0} lessons`,
        students: Math.floor(500 + Math.random() * 10000),
        category: c.category || "Personal Development",
        level: (c.audience_level as Course["level"]) || "Intermediate",
        image: c.banner_url || c.logo_url || "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
        isUserCourse: false,
        courseData: c,
      }));

      // Load user-published courses from localStorage
      const published: Course[] = JSON.parse(localStorage.getItem("coursia_published_courses") || "[]");
      setMyCourses(published);

      // Merge: localStorage courses first (marked as user's), then DB courses (deduplicated), then mock
      const dbIds = new Set(dbMapped.map(c => c.id));
      const localNotInDb = published.filter(c => !dbIds.has(c.id));
      const combined = [...localNotInDb, ...dbMapped, ...mockCourses];
      setAllCourses(combined);

      if (!error && published.length > 0) {
        const justPublished = sessionStorage.getItem("just_published");
        if (!justPublished) {
          sessionStorage.setItem("just_published", "true");
          toast.success("🎉 Your course is now live on the marketplace!");
        }
      }
    } catch (err) {
      console.error("Failed to load courses:", err);
      // Fallback to localStorage + mock
      const published: Course[] = JSON.parse(localStorage.getItem("coursia_published_courses") || "[]");
      setMyCourses(published);
      setAllCourses([...published, ...mockCourses]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCourse = (courseId: string) => {
    const updatedCourses = myCourses.filter(c => c.id !== courseId);
    localStorage.setItem("coursia_published_courses", JSON.stringify(updatedCourses));
    setMyCourses(updatedCourses);
    setAllCourses(prev => prev.filter(c => c.id !== courseId || !c.isUserCourse));
    toast.success("Course removed from marketplace");
  };

  const filteredCourses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allCourses.filter((course) => {
      const matchesSearch = !q || 
        course.title.toLowerCase().includes(q) ||
        course.instructor.toLowerCase().includes(q) ||
        course.category.toLowerCase().includes(q);
      const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
      const matchesLevel = selectedLevel === "All Levels" || course.level === selectedLevel;
      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [allCourses, searchQuery, selectedCategory, selectedLevel]);

  const sortedCourses = useMemo(() => {
    const sorted = [...filteredCourses];
    switch (sortBy) {
      case "Highest Rated": sorted.sort((a, b) => b.rating - a.rating); break;
      case "Price: Low to High": sorted.sort((a, b) => a.price - b.price); break;
      case "Price: High to Low": sorted.sort((a, b) => b.price - a.price); break;
      case "Newest": sorted.sort((a, b) => (b.isUserCourse ? 1 : 0) - (a.isUserCourse ? 1 : 0)); break;
      default: sorted.sort((a, b) => b.students - a.students); break;
    }
    return sorted;
  }, [filteredCourses, sortBy]);

  const featuredCourses = allCourses.filter(c => c.featured);

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
            <Link to="/marketplace" className="text-sm text-foreground font-medium">
              Marketplace
            </Link>
            <button 
              onClick={() => setShowMyCourses(true)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              My Courses
              {myCourses.length > 0 && (
                <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                  {myCourses.length}
                </span>
              )}
            </button>
            <ThemeToggle />
            <UserMenu />
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-12 px-6">
        <div className="container mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">10,000+ Premium Courses</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text leading-tight">
              Discover Your Next
              <br />
              Learning Journey
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
              World-class courses from industry experts. Transform your career with cutting-edge skills.
            </p>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto glass-strong p-2 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-muted-foreground ml-4" />
                <Input
                  type="text"
                  placeholder="Search for courses, instructors, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-0 text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button variant="gradient" size="lg" className="rounded-xl">
                  Search
                </Button>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              <Button
                variant="glass"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2 glass-strong hover:scale-105 transition-all duration-300"
              >
                <Filter className="w-4 h-4" />
                Filters
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "gradient" : "glass"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className={`glass-strong hover:scale-105 transition-all duration-300 ${
                    selectedCategory === cat 
                      ? "shadow-lg shadow-primary/25 border-primary/50" 
                      : "hover:border-primary/30"
                  }`}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="relative z-10 py-12 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Courses</h2>
              <p className="text-muted-foreground">Hand-picked by our experts</p>
            </div>
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {featuredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => navigate(`/course/${course.id}`)}
                className="glass-strong rounded-2xl overflow-hidden border border-white/10 hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] group cursor-pointer"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {course.isUserCourse ? (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 px-3 py-1 rounded-full shadow-lg">
                      <Crown className="w-4 h-4 text-white inline mr-1" />
                      <span className="text-sm font-semibold text-white">Your Course</span>
                    </div>
                  ) : (
                    <div className="absolute top-4 right-4 glass px-3 py-1 rounded-full">
                      <Award className="w-4 h-4 text-primary inline mr-1" />
                      <span className="text-sm font-semibold">Featured</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                      {course.category}
                    </span>
                    <span className="text-xs text-muted-foreground">{course.level}</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">by {course.instructor}</p>
                  
                  <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-primary text-primary" />
                      <span className="font-semibold text-foreground">{course.rating}</span>
                      <span>({course.reviews.toLocaleString()})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{course.students.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold gradient-text">${course.price}</span>
                    <Button variant="gradient" size="lg" onClick={(e) => { e.stopPropagation(); }}>Enroll Now</Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* All Courses */}
      <section className="relative z-10 py-12 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">All Courses</h2>
              <p className="text-muted-foreground">{sortedCourses.length} courses available</p>
            </div>
            <div className="relative">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="px-6 py-3 rounded-xl font-medium transition-all duration-300 cursor-pointer shadow-lg glass-strong border border-white/20 hover:border-primary/40 hover:shadow-xl hover:scale-105 backdrop-blur-xl text-foreground flex items-center gap-3 min-w-[200px] justify-between group"
              >
                <span>{sortBy}</span>
                <motion.div
                  animate={{ rotate: isSortOpen ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <ChevronDown className="w-5 h-5 text-primary group-hover:text-accent transition-colors" />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {isSortOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="fixed inset-0 z-40"
                      onClick={() => setIsSortOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute top-full mt-2 w-full glass-strong border border-white/20 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden z-50"
                    >
                      {sortOptions.map((option, index) => (
                        <motion.button
                          key={option}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          onClick={() => {
                            setSortBy(option);
                            setIsSortOpen(false);
                          }}
                          className={`w-full px-6 py-3 text-left transition-all duration-200 ${
                            sortBy === option
                              ? "bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 text-primary font-semibold"
                              : "text-foreground hover:bg-primary/10"
                          } ${index !== sortOptions.length - 1 ? "border-b border-white/10" : ""}`}
                        >
                          {option}
                        </motion.button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full text-center py-20">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading courses...</p>
              </div>
            ) : sortedCourses.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <Search className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
                <Button variant="glass" onClick={() => { setSearchQuery(""); setSelectedCategory("All"); setSelectedLevel("All Levels"); }}>
                  Clear Filters
                </Button>
              </div>
            ) : sortedCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                onClick={() => navigate(`/course/${course.id}`)}
                className="glass-strong rounded-2xl overflow-hidden border border-white/10 hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] group cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 glass px-2 py-1 rounded-lg text-xs font-medium">
                    {course.level}
                  </div>
                  {course.isUserCourse && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 px-2 py-1 rounded-lg shadow-lg">
                      <Crown className="w-3 h-3 text-white inline mr-1" />
                      <span className="text-xs font-semibold text-white">Yours</span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                    {course.category}
                  </span>
                  <h3 className="text-lg font-bold mt-3 mb-1 group-hover:text-primary transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">by {course.instructor}</p>
                  
                  <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-primary text-primary" />
                      <span className="font-semibold text-foreground">{course.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{(course.students / 1000).toFixed(1)}k</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{course.duration}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <span className="text-2xl font-bold gradient-text">${course.price}</span>
                    <Button variant="gradient" size="sm" onClick={(e) => { e.stopPropagation(); }}>Enroll</Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-6 mt-12">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-strong rounded-3xl p-12 border border-white/10"
          >
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-4 gradient-text">
              Ready to Transform Your Career?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join over 100,000 learners already advancing their skills
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="gradient" size="lg" className="text-lg px-8">
                Start Learning Today
              </Button>
              <Button variant="glass" size="lg" className="text-lg px-8">
                Explore Free Courses
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 glass-strong border-t border-white/10 mt-24 py-12 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Logo className="h-10 mb-4 object-contain" />
              <p className="text-sm text-muted-foreground">
                Empowering learners worldwide with premium education.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Browse Courses</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Become Instructor</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Enterprise</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 text-center text-sm text-muted-foreground">
            <p>© 2025 Coursia. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* My Courses Dialog */}
      <Dialog open={showMyCourses} onOpenChange={setShowMyCourses}>
        <DialogContent className="glass-strong border-white/20 max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold gradient-text flex items-center gap-2">
              <Crown className="w-6 h-6 text-primary" />
              My Published Courses
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4 overflow-y-auto max-h-[60vh] pr-2 space-y-4">
            {myCourses.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first course and publish it to see it here.
                </p>
                <Button 
                  variant="gradient" 
                  onClick={() => {
                    setShowMyCourses(false);
                    navigate("/wizard");
                  }}
                >
                  Create Course
                </Button>
              </div>
            ) : (
              myCourses.map((course) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-xl p-4 border border-white/10 hover:border-primary/30 transition-all duration-300"
                >
                  <div className="flex gap-4">
                    <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={course.image} 
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{course.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">by {course.instructor}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-primary text-primary" />
                          <span>{course.rating}</span>
                        </div>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          {course.category}
                        </span>
                        <span className="text-xs">{course.level}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button
                        variant="glass"
                        size="sm"
                        onClick={() => {
                          setShowMyCourses(false);
                          navigate(`/course/${course.id}`);
                        }}
                        className="gap-2"
                      >
                        <BookOpen className="w-4 h-4" />
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCourse(course.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {myCourses.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {myCourses.length} course{myCourses.length !== 1 ? "s" : ""} published
              </p>
              <Button 
                variant="gradient" 
                onClick={() => {
                  setShowMyCourses(false);
                  navigate("/wizard");
                }}
                className="gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Create New Course
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
