// FILE: src/pages/MyCourse.tsx
import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Download, CheckCircle, Film, BookOpen, Brain, Sparkles, Play, Pause, Square, SkipBack, SkipForward, GraduationCap, Layers, Palette, Rocket, Store, Edit, Video, RefreshCw, X } from "lucide-react";
import { motion } from "framer-motion";
import { pollJobStatus as apiPollJobStatus } from "@/api";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { QuizDisplay } from "@/components/QuizDisplay";
import WorkbookDisplay from "@/components/WorkbookDisplay";
import SlideViewer from "@/components/SlideViewer";








interface Lesson {
    lesson_title: string;
    videos?: Array<{ title?: string; script_file?: string } | string>;
    quiz_file?: string;
    workbook_file?: string;
    script_file?: string;
    script_content?: string;
}


interface FullCourse {
    course_title?: string;
    course_description?: string;
    logo_path?: string;
    banner_path?: string;
    logo_url?: string;
    banner_url?: string;
    lessons?: Lesson[];
    zip?: string;
}


const MyCourse = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const jobIdFromState = (location.state as any)?.jobId as string | undefined;


    const [course, setCourse] = useState<FullCourse | null>(() => {
        const saved = sessionStorage.getItem("coursia_full_course");
        return saved ? JSON.parse(saved) : null;
    });
    const [jobId, setJobId] = useState<string | null>(jobIdFromState || null);
    const [status, setStatus] = useState<string | null>(course ? "done" : jobId ? "queued" : null);
    const [progressMsg, setProgressMsg] = useState<string>("Waiting...");
    const [downloading, setDownloading] = useState(false);
    const [publishing, setPublishing] = useState(false);


    const [openScript, setOpenScript] = useState(false);
    const [activeScriptTitle, setActiveScriptTitle] = useState<string | null>(null);
    const [activeScriptContent, setActiveScriptContent] = useState<string | null>(null);
    const [activeScriptLessonIndex, setActiveScriptLessonIndex] = useState<number | null>(null);


    const [activeWorkbookTitle, setActiveWorkbookTitle] = useState<string | null>(null);
    const [activeWorkbookContent, setActiveWorkbookContent] = useState<string | null>(null);
    const [activeWorkbookLessonIndex, setActiveWorkbookLessonIndex] = useState<number | null>(null);


    const [activeQuizTitle, setActiveQuizTitle] = useState<string | null>(null);
    const [activeQuizContent, setActiveQuizContent] = useState<string | null>(null);


    const [isTeleprompterActive, setIsTeleprompterActive] = useState(false);
    const [isTeleprompterPaused, setIsTeleprompterPaused] = useState(false);
    const [scrollSpeed, setScrollSpeed] = useState(2); // 1 = slow, 2 = medium, 3 = fast
    const teleprompterScrollRef = useRef<number>(0); // Track precise scroll position


    const [isRecording, setIsRecording] = useState(false);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [videoURL, setVideoURL] = useState<string | null>(null);
    const [activeVideoTitle, setActiveVideoTitle] = useState<string | null>(null);


    const [openSlidesForLesson, setOpenSlidesForLesson] = useState<string | null>(null);


    const [openSlides, setOpenSlides] = useState(false);
    const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

    // Slides in script modal
    interface Slide {
        filename: string;
        url: string;
    }
    const [scriptSlides, setScriptSlides] = useState<Slide[]>([]);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [slidesLoading, setSlidesLoading] = useState(false);


    const handleStartRecording = async (title: string) => {
        setActiveVideoTitle(title);
        setRecordedBlob(null);
        setVideoURL(null);
        setIsRecording(true);






        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks: BlobPart[] = [];


            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: "video/webm" });
                setRecordedBlob(blob);
                setVideoURL(URL.createObjectURL(blob));
                stream.getTracks().forEach((track) => track.stop());
            };


            setMediaRecorder(recorder);
            recorder.start();
        } catch (err) {
            console.error("Could not start recording:", err);
            alert("Microphone or camera permission denied.");
            setIsRecording(false);
        }
    };


    const handleStopRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
        }
        setIsRecording(false);
        setIsTeleprompterActive(false); // 🧠 stoppe Teleprompter wenn Aufnahme endet
    };


    const handleSaveRecording = () => {
        if (!recordedBlob || !activeVideoTitle) return;
        const link = document.createElement("a");
        link.href = URL.createObjectURL(recordedBlob);
        link.download = `${activeVideoTitle.replace(/\s+/g, "_")}.webm`;
        link.click();
        toast.success("🎬 Video saved locally!");
    };


    const API_BASE = "http://127.0.0.1:8000";
    
    const handleViewSlides = async (lessonId: string, scriptText?: string) => {
        // ensure slides generated on demand (auto)
        try {
            // call backend to generate (if not already)
            await fetch(`${API_BASE}/api/generate-slides`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lesson_id: lessonId, script_text: scriptText || activeScriptContent, preferred_style: "apple" })
            });
            // open viewer
            setOpenSlidesForLesson(lessonId);
        } catch (e) {
            console.error(e);
            alert("Could not request slides generation.");
        }
    };






    const toURL = (path?: string) => {
        if (!path) return "";
        return path
            .replace(/^.*generated[\\/]/, "http://127.0.0.1:8000/generated/")
            .replace(/\\/g, "/");
    };


    useEffect(() => {
        if (course) {
            setStatus("done");
            return;
        }


        let cancelled = false;
        if (jobId) {
            (async () => {
                try {
                    setStatus("polling");
                    const full = await apiPollJobStatus(jobId, (s) => {
                        if (cancelled) return;
                        setStatus(s);
                        setProgressMsg(s);
                    });


                    if (full) {
                        sessionStorage.setItem("coursia_full_course", JSON.stringify(full));
                        if (!cancelled) {
                            setCourse(full);
                            setStatus("done");
                            toast.success("✅ Your full course is ready!");
                            navigate("/mycourse", { state: { jobId } });
                        }
                    }
                } catch (err) {
                    console.error("Polling failed:", err);
                    if (!cancelled) setStatus("error");
                }
            })();
        }


        return () => {
            cancelled = true;
        };
    }, [jobId]);


    // Smooth teleprompter scrolling using requestAnimationFrame
    useEffect(() => {
        let animationFrameId: number | null = null;
        let lastTime: number | null = null;

        // Speed in pixels per second (much smoother than interval-based)
        const getSpeedPxPerSecond = () => {
            switch (scrollSpeed) {
                case 1: return 25;  // Slow
                case 2: return 50;  // Medium
                case 3: return 85;  // Fast
                default: return 50;
            }
        };

        const animate = (currentTime: number) => {
            const inner = document.getElementById("script-scroll-inner");
            if (!inner) {
                animationFrameId = requestAnimationFrame(animate);
                return;
            }

            if (lastTime === null) {
                lastTime = currentTime;
            }

            const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
            lastTime = currentTime;

            // Only scroll if not paused
            if (!isTeleprompterPaused) {
                const scrollAmount = getSpeedPxPerSecond() * deltaTime;
                teleprompterScrollRef.current += scrollAmount;
                inner.scrollTop = teleprompterScrollRef.current;

                // When reaching end, pause instead of auto-dismissing
                if (inner.scrollTop + inner.clientHeight >= inner.scrollHeight - 5) {
                    if (inner.scrollHeight > inner.clientHeight + 5) {
                        // Pause at the end so user can dismiss when ready
                        setIsTeleprompterPaused(true);
                        return;
                    }
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        if (isTeleprompterActive) {
            // Sync ref with current scroll position on start
            const inner = document.getElementById("script-scroll-inner");
            if (inner) {
                teleprompterScrollRef.current = inner.scrollTop;
            }
            animationFrameId = requestAnimationFrame(animate);
        }

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [isTeleprompterActive, isTeleprompterPaused, scrollSpeed]);

    // Skip teleprompter forward/backward by seconds
    const skipTeleprompter = (seconds: number) => {
        const inner = document.getElementById("script-scroll-inner");
        if (!inner) return;

        // Calculate pixels based on current speed
        const speedPxPerSecond = scrollSpeed === 1 ? 25 : scrollSpeed === 2 ? 50 : 85;
        const skipAmount = speedPxPerSecond * seconds;
        
        teleprompterScrollRef.current = Math.max(0, Math.min(
            inner.scrollHeight - inner.clientHeight,
            teleprompterScrollRef.current + skipAmount
        ));
        inner.scrollTop = teleprompterScrollRef.current;
    };

    // Reset teleprompter position when starting fresh
    const startTeleprompter = () => {
        const inner = document.getElementById("script-scroll-inner");
        if (inner) {
            inner.scrollTop = 0;
            teleprompterScrollRef.current = 0;
        }
        setIsTeleprompterPaused(false);
        setIsTeleprompterActive(true);
    };

    const toggleTeleprompterPause = () => {
        setIsTeleprompterPaused(prev => !prev);
    };

    const stopTeleprompter = () => {
        setIsTeleprompterActive(false);
        setIsTeleprompterPaused(false);
    };


    useEffect(() => {
        if (!openScript && isTeleprompterActive) {
            setIsTeleprompterActive(false);
        }
    }, [openScript, isTeleprompterActive]);


    const handleDownloadZip = async () => {
        if (!course?.zip) {
            alert("No ZIP available for download.");
            return;
        }
        try {
            setDownloading(true);
            const res = await fetch(course.zip);
            if (!res.ok) throw new Error("Download failed");
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${(course.course_title || "course").replace(/\s+/g, "_")}.zip`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error(e);
            alert("Download failed — check console.");
        } finally {
            setDownloading(false);
        }
    };


    const handleViewScript = async (title: string, path?: string, lessonIndex?: number) => {
        if (!path) return alert("No script file found.");


        try {
            const res = await fetch(toURL(path));
            if (!res.ok) throw new Error("Failed to load script file");
            const text = await res.text();


            setActiveScriptTitle(title);
            setActiveScriptContent(text);
            setActiveScriptLessonIndex(lessonIndex ?? null);
            setOpenScript(true);
            setCurrentSlideIndex(0);
            setScriptSlides([]);

            // Load slides for this lesson
            if (lessonIndex !== undefined) {
                setSlidesLoading(true);
                try {
                    const lessonId = `lesson_${lessonIndex + 1}`;
                    // Try to generate slides on demand
                    await fetch(`${API_BASE}/api/generate-slides`, {
                        method: "POST",
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ lesson_id: lessonId, script_text: text, preferred_style: "apple" })
                    });
                    // Render slides to PNGs
                    await fetch(`${API_BASE}/api/render-slides/${lessonId}`, { method: "POST" });
                    // Then fetch the slides
                    const slidesRes = await fetch(`${API_BASE}/api/slides-signed-urls/${lessonId}`);
                    if (slidesRes.ok) {
                        const data = await slidesRes.json();
                        const slides = data.slides?.map((s: any) => ({
                            filename: s.filename,
                            url: s.url.startsWith("http") ? s.url : `${API_BASE}${s.url}`
                        })) || [];
                        setScriptSlides(slides);
                    }
                } catch (e) {
                    console.error("Could not load slides:", e);
                } finally {
                    setSlidesLoading(false);
                }
            }
        } catch (err) {
            console.error(err);
            alert("Failed to load script — check console.");
        }
    };


    const handleViewQuiz = async (title: string, path?: string) => {
        if (!path) return alert("No quiz file found.");
        try {
            const res = await fetch(toURL(path));
            if (!res.ok) throw new Error("Failed to load quiz file");
            const text = await res.text();


            setActiveQuizTitle(title);
            setActiveQuizContent(text);
        } catch (err) {
            console.error(err);
            alert("Failed to load quiz — check console.");
        }
    };


    const handleViewWorkbook = async (title: string, path?: string, lessonIndex?: number) => {
        if (!path) return alert("No workbook file found.");
        try {
            const res = await fetch(toURL(path));
            if (!res.ok) throw new Error("Failed to load workbook file");
            const text = await res.text();

            setActiveWorkbookTitle(title);
            setActiveWorkbookContent(text);
            setActiveWorkbookLessonIndex(lessonIndex ?? null);
        } catch (err) {
            console.error(err);
            alert("Failed to load workbook — check console.");
        }
    };


    return (
        <div className="min-h-screen bg-background">
            {/* Animated background orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
                <div className="absolute top-1/2 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
                <div className="absolute -bottom-20 right-1/3 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Hero Section with Banner & Logo */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative"
                >
                    {/* Banner with Glassmorphic Overlay */}
                    <div className="relative rounded-3xl overflow-hidden shadow-elevated">
                        {course?.banner_url ? (
                            <img
                                src={course.banner_url}
                                alt="Course banner"
                                className="w-full h-72 sm:h-80 lg:h-96 object-cover"
                            />
                        ) : (
                            <div className="w-full h-72 sm:h-80 lg:h-96 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center">
                                <div className="text-center space-y-4">
                                    <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center">
                                        <GraduationCap className="w-10 h-10 text-primary" />
                                    </div>
                                    <p className="text-muted-foreground">Your course banner will appear here</p>
                                </div>
                            </div>
                        )}
                        
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                        
                        {/* Content overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                            <div className="flex flex-col lg:flex-row items-start lg:items-end gap-6">
                                {/* Logo */}
                                <motion.div 
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2, duration: 0.5 }}
                                    className="shrink-0"
                                >
                                    {course?.logo_url || course?.logo_path ? (
                                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-lg shrink-0 bg-white">
                                            <img
                                                src={course.logo_url || course.logo_path}
                                                alt="Course logo"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl glass border-2 border-white/20 flex items-center justify-center">
                                            <Sparkles className="w-10 h-10 text-primary" />
                                        </div>
                                    )}
                                </motion.div>
                                
                                {/* Title & Description */}
                                <div className="flex-1 min-w-0">
                                    <motion.h1 
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3, duration: 0.5 }}
                                        className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight gradient-text mb-2"
                                    >
                                        {course?.course_title ?? "Your Course"}
                                    </motion.h1>
                                    <motion.p 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.4, duration: 0.5 }}
                                        className="text-muted-foreground text-sm sm:text-base max-w-2xl line-clamp-2"
                                    >
                                        {course?.course_description ?? "Your full AI-generated course will appear here once ready."}
                                    </motion.p>
                                </div>
                                
                                {/* Action buttons */}
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5, duration: 0.5 }}
                                    className="flex flex-wrap gap-2 sm:gap-3 shrink-0"
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(139, 92, 246, 0.5), 0 0 80px rgba(236, 72, 153, 0.3)" }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={async () => {
                                            if (!course) {
                                                alert("No course data yet to publish.");
                                                return;
                                            }
                                            setPublishing(true);
                                            
                                            // Fetch and embed quiz/workbook content for each lesson
                                            const quizzes: any[] = [];
                                            const workbooks: string[] = [];
                                            
                                            for (const lesson of course.lessons || []) {
                                                // Fetch quiz content
                                                if (lesson.quiz_file) {
                                                    try {
                                                        const res = await fetch(toURL(lesson.quiz_file));
                                                        if (res.ok) {
                                                            const quizData = await res.json();
                                                            quizzes.push(quizData);
                                                        } else {
                                                            quizzes.push(null);
                                                        }
                                                    } catch {
                                                        quizzes.push(null);
                                                    }
                                                } else {
                                                    quizzes.push(null);
                                                }
                                                
                                                // Fetch workbook content
                                                if (lesson.workbook_file) {
                                                    try {
                                                        const res = await fetch(toURL(lesson.workbook_file));
                                                        if (res.ok) {
                                                            const workbookText = await res.text();
                                                            workbooks.push(workbookText);
                                                        } else {
                                                            workbooks.push("");
                                                        }
                                                    } catch {
                                                        workbooks.push("");
                                                    }
                                                } else {
                                                    workbooks.push("");
                                                }
                                            }
                                            
                                            // Create marketplace-compatible course object with embedded content
                                            const publishedCourse = {
                                                id: `user-${Date.now()}`,
                                                title: course.course_title || "Untitled Course",
                                                instructor: "You",
                                                rating: 5.0,
                                                reviews: 0,
                                                price: 99,
                                                duration: `${course.lessons?.length || 1} lessons`,
                                                students: 0,
                                                category: "Technology",
                                                level: "Intermediate" as const,
                                                image: course.banner_url || course.banner_path || "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
                                                featured: true,
                                                isUserCourse: true,
                                                courseData: {
                                                    ...course,
                                                    quizzes,
                                                    workbooks,
                                                },
                                            };
                                            
                                            // Save to localStorage
                                            const existing = JSON.parse(localStorage.getItem("coursia_published_courses") || "[]");
                                            existing.unshift(publishedCourse);
                                            localStorage.setItem("coursia_published_courses", JSON.stringify(existing));
                                            
                                            toast.success("🎉 Course published to marketplace!");
                                            
                                            setTimeout(() => {
                                                navigate("/marketplace");
                                            }, 800);
                                        }}
                                        disabled={!course || publishing}
                                        className="relative group px-6 py-3 rounded-xl font-semibold text-white overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {/* Animated gradient background */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 animate-gradient-x" />
                                        
                                        {/* Shimmer effect */}
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                        </div>
                                        
                                        {/* Glow ring */}
                                        <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 rounded-xl blur-lg opacity-40 group-hover:opacity-70 transition-opacity duration-300 -z-10" />
                                        
                                        {/* Inner content */}
                                        <span className="relative flex items-center gap-2">
                                            {publishing ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    <span>Publishing...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Store className="w-5 h-5" />
                                                    <span>Launch to Marketplace</span>
                                                    <Rocket className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                                                </>
                                            )}
                                        </span>
                                        
                                        {/* Sparkle decorations */}
                                        <div className="absolute top-1 right-2 w-2 h-2 bg-yellow-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping" />
                                        <div className="absolute bottom-1 left-3 w-1.5 h-1.5 bg-cyan-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping" style={{ animationDelay: "0.2s" }} />
                                    </motion.button>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Status Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                >
                    <Card className="glass-strong border border-white/10 overflow-hidden">
                        <CardContent className="flex items-center justify-between py-4 px-6">
                            <div className="flex items-center gap-4">
                                {status === "done" ? (
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/30">
                                        <CheckCircle className="text-emerald-500 w-5 h-5" />
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 animate-pulse">
                                        <Sparkles className="text-primary w-5 h-5" />
                                    </div>
                                )}
                                <div>
                                    <div className="font-semibold text-foreground">
                                        {status === "done" ? "Generation Complete" : "Generating Your Course..."}
                                    </div>
                                    <div className="text-xs text-muted-foreground">{progressMsg}</div>
                                </div>
                            </div>
                            <div className="hidden sm:block text-xs text-muted-foreground font-mono bg-muted/50 px-3 py-1.5 rounded-full">
                                {jobId ? `#${jobId.slice(0, 8)}` : "—"}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>


                {/* Main Content Section */}
                <motion.section 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                    {/* Lessons Column */}
                    <main className="lg:col-span-2 space-y-4">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/20">
                                <Layers className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">Course Content</h2>
                                <p className="text-sm text-muted-foreground">{course?.lessons?.length || 0} lessons available</p>
                            </div>
                        </div>

                        {course?.lessons?.length ? (
                            <Accordion type="single" collapsible className="w-full space-y-3">
                                {course.lessons.map((lesson, li) => (
                                    <motion.div
                                        key={li}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * li, duration: 0.4 }}
                                    >
                                        <AccordionItem
                                            value={`lesson-${li}`}
                                            className="glass-strong border border-white/10 rounded-2xl overflow-hidden hover:shadow-glass transition-all duration-300"
                                        >
                                            <AccordionTrigger className="px-5 py-4 hover:no-underline group">
                                                <div className="flex items-center gap-4 text-left w-full">
                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/20 shrink-0 group-hover:scale-105 transition-transform">
                                                        <span className="text-lg font-bold gradient-text">{li + 1}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <span className="font-semibold text-base block truncate">{lesson.lesson_title || `Lesson ${li + 1}`}</span>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <Film className="w-3 h-3" /> {lesson.videos?.length || 0} Videos
                                                            </span>
                                                            {lesson.quiz_file && (
                                                                <span className="text-xs text-emerald-500 flex items-center gap-1">
                                                                    <Brain className="w-3 h-3" /> Quiz
                                                                </span>
                                                            )}
                                                            {lesson.workbook_file && (
                                                                <span className="text-xs text-secondary flex items-center gap-1">
                                                                    <BookOpen className="w-3 h-3" /> Workbook
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </AccordionTrigger>

                                            <AccordionContent className="px-5 pb-5 pt-2 space-y-5">
                                                {/* Videos Grid */}
                                                {lesson.videos?.length ? (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {lesson.videos.map((v, vi) => {
                                                            const video = typeof v === "string" 
                                                                ? { title: `Video ${vi + 1}`, script_file: v } 
                                                                : v;

                                                            return (
                                                                <div
                                                                    key={vi}
                                                                    className="group p-4 rounded-xl glass border border-white/10 hover:border-primary/30 transition-all duration-300 hover:shadow-md"
                                                                >
                                                                    <div className="flex items-start gap-3">
                                                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                                                                            <Play className="w-4 h-4 text-primary" />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="font-medium text-sm truncate">{video.title || `Video ${vi + 1}`}</div>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="ghost"
                                                                                className="mt-2 h-7 text-xs px-2 hover:bg-primary/10"
                                                                                onClick={() => handleViewScript(video.title || `Video ${vi + 1}`, video.script_file, li)}
                                                                            >
                                                                                <Film className="w-3 h-3 mr-1" /> View Script
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-muted-foreground text-center py-4">No videos available.</div>
                                                )}

                                                {/* Quiz & Workbook */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {lesson.quiz_file && (
                                                        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <Brain className="w-5 h-5 text-emerald-500" />
                                                                <span className="font-semibold text-sm">Quiz</span>
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                                                                onClick={() => handleViewQuiz(lesson.lesson_title || "Quiz", lesson.quiz_file)}
                                                            >
                                                                Take Quiz
                                                            </Button>
                                                        </div>
                                                    )}

                                                    {lesson.workbook_file && (
                                                        <div className="p-4 rounded-xl bg-gradient-to-br from-secondary/10 to-purple-500/10 border border-secondary/20">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <BookOpen className="w-5 h-5 text-secondary" />
                                                                <span className="font-semibold text-sm">Workbook</span>
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                className="w-full bg-secondary/20 hover:bg-secondary/30 text-secondary-foreground border border-secondary/30"
                                                                onClick={() => handleViewWorkbook(lesson.lesson_title || "Workbook", lesson.workbook_file, li)}
                                                            >
                                                                Open Workbook
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </motion.div>
                                ))}
                            </Accordion>
                        ) : (
                            <div className="glass-strong border border-white/10 rounded-2xl p-12 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
                                    <Sparkles className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Generating Your Course</h3>
                                <p className="text-muted-foreground">Please wait while we create your content...</p>
                            </div>
                        )}
                    </main>

                    {/* Sidebar */}
                    <aside className="space-y-4">
                        {/* Branding Card */}
                        <Card className="glass-strong border border-white/10 p-5 overflow-hidden">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                    <Palette className="w-4 h-4 text-primary" />
                                </div>
                                <h3 className="font-semibold">Branding</h3>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    {course?.logo_url || course?.logo_path ? (
                                        <div className="w-16 h-16 rounded-xl overflow-hidden shadow-md shrink-0 bg-white">
                                            <img
                                                src={course.logo_url || course.logo_path}
                                                alt="Course logo"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 rounded-xl bg-muted/30 flex items-center justify-center shrink-0 border border-white/10">
                                            <Sparkles className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <p className="text-xs text-muted-foreground">Logo & banner are AI-generated based on your course content.</p>
                                    </div>
                                </div>
                                
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="w-full glass border border-white/10"
                                    onClick={() => alert("Open Branding editor (future)")}
                                >
                                    <Palette className="w-4 h-4 mr-2" /> Customize Branding
                                </Button>
                            </div>
                        </Card>

                        {/* Tips Card */}
                        <Card className="glass-strong border border-white/10 p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-amber-500" />
                                </div>
                                <h3 className="font-semibold">Quick Tips</h3>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex items-start gap-3 text-sm">
                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <Download className="w-3 h-3 text-primary" />
                                    </div>
                                    <span className="text-muted-foreground">Download ZIP for your complete course package</span>
                                </div>
                                <div className="flex items-start gap-3 text-sm">
                                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                                    </div>
                                    <span className="text-muted-foreground">Publish to share your course online</span>
                                </div>
                                <div className="flex items-start gap-3 text-sm">
                                    <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <Edit className="w-3 h-3 text-secondary" />
                                    </div>
                                    <span className="text-muted-foreground">Use Edit to adjust and regenerate content</span>
                                </div>
                            </div>
                        </Card>

                        {/* Stats Card */}
                        {course?.lessons?.length && (
                            <Card className="glass-strong border border-white/10 p-5">
                                <h3 className="font-semibold mb-4">Course Overview</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="text-center p-3 rounded-xl bg-primary/5 border border-primary/10">
                                        <div className="text-2xl font-bold gradient-text">{course.lessons.length}</div>
                                        <div className="text-xs text-muted-foreground">Lessons</div>
                                    </div>
                                    <div className="text-center p-3 rounded-xl bg-secondary/5 border border-secondary/10">
                                        <div className="text-2xl font-bold text-secondary">{course.lessons.reduce((acc, l) => acc + (l.videos?.length || 0), 0)}</div>
                                        <div className="text-xs text-muted-foreground">Videos</div>
                                    </div>
                                    <div className="text-center p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                                        <div className="text-2xl font-bold text-emerald-500">{course.lessons.filter(l => l.quiz_file).length}</div>
                                        <div className="text-xs text-muted-foreground">Quizzes</div>
                                    </div>
                                    <div className="text-center p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                                        <div className="text-2xl font-bold text-amber-500">{course.lessons.filter(l => l.workbook_file).length}</div>
                                        <div className="text-xs text-muted-foreground">Workbooks</div>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </aside>
                </motion.section>
            </div>
            <Dialog open={openScript} onOpenChange={setOpenScript}>
                <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col gap-4 rounded-2xl backdrop-blur-xl bg-background/95 border border-border shadow-2xl overflow-y-auto">
                    <DialogHeader className="pb-2 border-b border-border/50">
                        <DialogTitle className="text-xl font-semibold tracking-tight">
                            {activeScriptTitle}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-row gap-4">
                        {/* LEFT PANEL - CONTROLS */}
                        <div className="w-[180px] flex flex-col gap-3 shrink-0">
                        {/* TELEPROMPTER CONTROLS */}
                            <Card className="p-4 glass-strong border border-white/10 shadow-xl">
                                <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                    Teleprompter
                                </h3>
                                <div className="flex flex-col gap-3">
                                    {/* Main Control Button */}
                                    {!isTeleprompterActive ? (
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={startTeleprompter}
                                            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary 
                                                text-white font-semibold text-sm flex items-center justify-center gap-2
                                                shadow-lg hover:shadow-primary/30 transition-all duration-300"
                                        >
                                            <Play className="w-4 h-4" /> Start
                                        </motion.button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={toggleTeleprompterPause}
                                                className={`flex-1 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2
                                                    transition-all duration-300 ${
                                                    isTeleprompterPaused 
                                                        ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg" 
                                                        : "bg-muted/50 text-foreground border border-border hover:bg-muted"
                                                }`}
                                            >
                                                {isTeleprompterPaused ? (
                                                    <><Play className="w-4 h-4" /> Resume</>
                                                ) : (
                                                    <><Pause className="w-4 h-4" /> Pause</>
                                                )}
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={stopTeleprompter}
                                                className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive 
                                                    border border-destructive/20 flex items-center justify-center
                                                    hover:bg-destructive hover:text-white transition-all duration-300"
                                            >
                                                <Square className="w-4 h-4" />
                                            </motion.button>
                                        </div>
                                    )}

                                    {/* Skip Controls */}
                                    {isTeleprompterActive && (
                                        <div className="flex gap-2">
                                            <motion.button
                                                whileHover={{ scale: 1.03, x: -2 }}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => skipTeleprompter(-5)}
                                                className="flex-1 py-2 rounded-lg bg-muted/30 border border-border/50 
                                                    text-xs font-medium flex items-center justify-center gap-1.5
                                                    hover:bg-muted/50 hover:border-border transition-all duration-200"
                                            >
                                                <SkipBack className="w-3.5 h-3.5" /> 5s
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.03, x: 2 }}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => skipTeleprompter(5)}
                                                className="flex-1 py-2 rounded-lg bg-muted/30 border border-border/50 
                                                    text-xs font-medium flex items-center justify-center gap-1.5
                                                    hover:bg-muted/50 hover:border-border transition-all duration-200"
                                            >
                                                5s <SkipForward className="w-3.5 h-3.5" />
                                            </motion.button>
                                        </div>
                                    )}

                                    {/* Speed Control */}
                                    <div className="pt-2 border-t border-border/30">
                                        <span className="text-xs text-muted-foreground mb-2 block">Speed</span>
                                        <div className="flex gap-1.5">
                                            {[
                                                { value: 1, label: "Slow", icon: "🐢" },
                                                { value: 2, label: "Med", icon: "🚶" },
                                                { value: 3, label: "Fast", icon: "🏃" },
                                            ].map((speed) => (
                                                <motion.button
                                                    key={speed.value}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => setScrollSpeed(speed.value)}
                                                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                                                        ${scrollSpeed === speed.value 
                                                            ? "bg-primary/20 text-primary border border-primary/30" 
                                                            : "bg-muted/20 text-muted-foreground border border-transparent hover:border-border/50"
                                                        }`}
                                                >
                                                    {speed.icon}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* RECORDING CONTROLS */}
                            <Card className="p-4 glass-strong border border-white/10">
                                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                    <Video className="w-4 h-4 text-primary" />
                                    Recording
                                </h3>
                                <div className="flex flex-col gap-3">
                                    {!isRecording && !recordedBlob && (
                                        <motion.button
                                            whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(239,68,68,0.4)" }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleStartRecording(activeScriptTitle || "video")}
                                            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 via-red-600 to-rose-600
                                                text-white font-semibold text-sm flex items-center justify-center gap-2
                                                shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-300
                                                border border-red-400/30"
                                        >
                                            <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                                            Start Recording
                                        </motion.button>
                                    )}
                                    {isRecording && (
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleStopRecording}
                                            className="w-full py-3 rounded-xl bg-gradient-to-r from-gray-700 to-gray-800
                                                text-white font-semibold text-sm flex items-center justify-center gap-2
                                                shadow-lg border border-gray-600/50 hover:border-gray-500 transition-all duration-300"
                                        >
                                            <Square className="w-4 h-4 fill-current" />
                                            Stop Recording
                                        </motion.button>
                                    )}
                                    {!isRecording && recordedBlob && (
                                        <div className="space-y-2">
                                            <motion.button
                                                whileHover={{ scale: 1.02, boxShadow: "0 0 25px rgba(34,197,94,0.4)" }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handleSaveRecording}
                                                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500
                                                    text-white font-semibold text-sm flex items-center justify-center gap-2
                                                    shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300
                                                    border border-emerald-400/30"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Save Video
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => {
                                                    setRecordedBlob(null);
                                                    setVideoURL(null);
                                                }}
                                                className="w-full py-2.5 rounded-xl bg-muted/30 backdrop-blur-sm
                                                    text-muted-foreground font-medium text-sm flex items-center justify-center gap-2
                                                    border border-border/50 hover:border-border hover:bg-muted/50 transition-all duration-300"
                                            >
                                                <RefreshCw className="w-3.5 h-3.5" />
                                                Record Again
                                            </motion.button>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>

                        {/* CENTER PANEL — VIDEO + TELEPROMPTER */}
                        <div className="flex-1 relative rounded-xl overflow-hidden border border-border shadow-lg bg-black min-h-[350px]">
                            {/* Show video only when recording or after recording */}
                            {isRecording && (
                                <video id="liveVideo" autoPlay muted className="w-full h-full object-cover" />
                            )}
                            
                            {!isRecording && recordedBlob && (
                                <video src={videoURL || ""} controls className="w-full h-full object-cover" />
                            )}

                            {/* TELEPROMPTER - Full screen when not recording, overlay when recording */}
                            {activeScriptContent && isTeleprompterActive && (
                                <div
                                    className={`${
                                        isRecording 
                                            ? "absolute bottom-6 left-1/2 -translate-x-1/2 w-[92%] h-[200px]" 
                                            : "absolute inset-0 w-full h-full"
                                    } bg-black/90 backdrop-blur-2xl text-white
                                    rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.8)]
                                    border border-white/10 transition-all duration-300 ease-out overflow-hidden`}
                                >
                                    {/* Soft edge gradients - top and bottom */}
                                    <div className="absolute inset-0 pointer-events-none z-10"
                                        style={{
                                            background: "linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.95) 100%)",
                                        }}
                                    />
                                    
                                    {/* Pause indicator */}
                                    {isTeleprompterPaused && (
                                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 
                                            bg-amber-500/90 text-black px-4 py-1 rounded-full text-xs font-bold
                                            flex items-center gap-1.5 shadow-lg">
                                            <Pause className="w-3 h-3" /> PAUSED
                                        </div>
                                    )}
                                    
                                    {/* Dismiss button */}
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={stopTeleprompter}
                                        className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full 
                                            bg-white/10 hover:bg-white/20 backdrop-blur-sm
                                            flex items-center justify-center transition-colors border border-white/20"
                                    >
                                        <X className="w-4 h-4 text-white/70" />
                                    </motion.button>
                                    
                                    <div
                                        id="script-scroll-inner"
                                        className={`h-full flex flex-col justify-center ${
                                            isRecording 
                                                ? "text-3xl sm:text-4xl lg:text-5xl" 
                                                : "text-4xl sm:text-5xl lg:text-6xl"
                                        } leading-[1.5] tracking-wide font-medium
                                        whitespace-pre-wrap px-12 text-center select-none`}
                                        style={{
                                            overflowY: "scroll",
                                            scrollbarWidth: "none",
                                            scrollBehavior: "auto",
                                        }}
                                    >
                                        {/* Top padding to allow first line to center */}
                                        <div className={isRecording ? "h-[85px]" : "h-[40%]"} style={{ flexShrink: 0 }} />
                                        <div className="max-w-4xl mx-auto">
                                            {activeScriptContent.split("\n").map((line, idx) => (
                                                <div key={idx} className={isRecording ? "py-4" : "py-6"}>
                                                    {line || " "}
                                                </div>
                                            ))}
                                        </div>
                                        {/* Bottom padding to allow last line to center */}
                                        <div className={isRecording ? "h-[85px]" : "h-[40%]"} style={{ flexShrink: 0 }} />
                                    </div>
                                </div>
                            )}
                            
                            {/* Empty state - only when no teleprompter and no video */}
                            {!isRecording && !recordedBlob && !isTeleprompterActive && (
                                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
                                    <Video className="w-12 h-12 opacity-30" />
                                    <span className="text-sm">Start the teleprompter to begin</span>
                                </div>
                            )}

                            {/* Recording indicator */}
                            {isRecording && (
                                <div className="absolute top-3 right-3 flex items-center gap-2 bg-red-500/90 text-white px-3 py-1 rounded-full text-xs font-medium">
                                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                    REC
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SLIDES SECTION - Below teleprompter */}
                    <div className="border-t border-border/50 pt-4">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-sm flex items-center gap-2">
                                <Layers className="w-4 h-4" /> Presentation Slides
                            </h4>
                            {scriptSlides.length > 0 && (
                                <span className="text-xs text-muted-foreground">
                                    {currentSlideIndex + 1} / {scriptSlides.length}
                                </span>
                            )}
                        </div>

                        {slidesLoading ? (
                            <div className="flex items-center justify-center py-6">
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
                                <span className="ml-3 text-sm text-muted-foreground">Generating slides...</span>
                            </div>
                        ) : scriptSlides.length > 0 ? (
                            <div className="space-y-3">
                                {/* Current slide */}
                                <div className="relative aspect-video max-h-[180px] mx-auto rounded-lg overflow-hidden bg-muted/20 border border-border flex items-center justify-center">
                                    <img
                                        src={scriptSlides[currentSlideIndex].url}
                                        alt={`Slide ${currentSlideIndex + 1}`}
                                        className="max-w-full max-h-full object-contain"
                                        draggable={false}
                                    />
                                </div>

                                {/* Thumbnails with navigation */}
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setCurrentSlideIndex(i => Math.max(0, i - 1))}
                                        disabled={currentSlideIndex === 0}
                                        className="shrink-0"
                                    >
                                        ←
                                    </Button>
                                    
                                    <div className="flex-1 flex gap-2 overflow-x-auto py-1 px-1">
                                        {scriptSlides.map((slide, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentSlideIndex(i)}
                                                className={`shrink-0 w-16 h-10 rounded overflow-hidden border-2 transition-all ${
                                                    i === currentSlideIndex
                                                        ? "border-primary ring-2 ring-primary/30"
                                                        : "border-border hover:border-primary/50"
                                                }`}
                                            >
                                                <img
                                                    src={slide.url}
                                                    alt={`Thumbnail ${i + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setCurrentSlideIndex(i => Math.min(scriptSlides.length - 1, i + 1))}
                                        disabled={currentSlideIndex === scriptSlides.length - 1}
                                        className="shrink-0"
                                    >
                                        →
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4 text-muted-foreground text-sm">
                                <Layers className="w-6 h-6 mx-auto mb-2 opacity-40" />
                                Slides will appear here once generated
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>




            {/* Quiz Modal (sibling) */}
            <Dialog open={!!activeQuizTitle} onOpenChange={() => setActiveQuizTitle(null)}>
                <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto scrollbar-glow rounded-2xl shadow-2xl border bg-background/95 backdrop-blur-md">
                    <DialogHeader>
                        <DialogTitle className="text-center text-xl font-semibold tracking-tight">
                            {activeQuizTitle}
                        </DialogTitle>
                    </DialogHeader>


                    {activeQuizContent ? (
                        <QuizDisplay quizData={JSON.parse(activeQuizContent)} />
                    ) : (
                        <p className="text-sm text-muted-foreground text-center">Loading quiz...</p>
                    )}
                </DialogContent>
            </Dialog>


            {/* Workbook Modal (sibling) */}
            <Dialog open={!!activeWorkbookTitle} onOpenChange={() => {
                setActiveWorkbookTitle(null);
                setActiveWorkbookLessonIndex(null);
            }}>
                <DialogContent className="max-w-3xl max-h-[85vh]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-secondary" />
                            {activeWorkbookTitle}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="mt-2 max-h-[70vh] overflow-y-auto pr-2">
                        {activeWorkbookContent ? (
                            <WorkbookDisplay 
                                workbook={activeWorkbookContent} 
                                courseId={jobId || undefined}
                                lessonId={activeWorkbookLessonIndex !== null ? `lesson_${activeWorkbookLessonIndex + 1}` : undefined}
                                onClose={() => {
                                    setActiveWorkbookTitle(null);
                                    setActiveWorkbookLessonIndex(null);
                                }}
                            />
                        ) : (
                            <p className="text-sm text-muted-foreground">Loading workbook...</p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>


            {/* --- Slide Viewer Modal (korrekt: open + onOpenChange übergeben) --- */}
            <Dialog
                open={!!openSlidesForLesson}
                onOpenChange={(open) => {
                    if (!open) setOpenSlidesForLesson(null);
                }}
            >
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">
                            Slides {openSlidesForLesson ? `for ${openSlidesForLesson}` : ""}
                        </DialogTitle>
                    </DialogHeader>


                    <div className="p-4 h-[75vh]">
                        {/* SlideViewer erwartet jetzt open + onOpenChange + lessonId */}
                        <SlideViewer
                            open={!!openSlidesForLesson}
                            onOpenChange={(v) => { if (!v) setOpenSlidesForLesson(null); }}
                            lessonId={openSlidesForLesson}
                            apiBase={""}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    );
};


export default MyCourse;