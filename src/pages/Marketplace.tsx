import { useState } from "react";
import { BackgroundOrbs } from "@/components/BackgroundOrbs";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Star, Clock, Users, TrendingUp, Award, Sparkles, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All Levels");
  const [sortBy, setSortBy] = useState("Popular");
  const [showFilters, setShowFilters] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const filteredCourses = mockCourses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
    const matchesLevel = selectedLevel === "All Levels" || course.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const featuredCourses = mockCourses.filter(c => c.featured);

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
            <Link to="/my-course" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              My Courses
            </Link>
            <ThemeToggle />
            <Button variant="gradient" size="sm">Sign In</Button>
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
                className="glass-strong rounded-2xl overflow-hidden border border-white/10 hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] group"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 glass px-3 py-1 rounded-full">
                    <Award className="w-4 h-4 text-primary inline mr-1" />
                    <span className="text-sm font-semibold">Featured</span>
                  </div>
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
                    <Button variant="gradient" size="lg">Enroll Now</Button>
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
              <p className="text-muted-foreground">{filteredCourses.length} courses available</p>
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
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="glass-strong rounded-2xl overflow-hidden border border-white/10 hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] group"
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
                    <Button variant="gradient" size="sm">Enroll</Button>
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
    </div>
  );
}
