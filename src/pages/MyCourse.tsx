// FILE: src/pages/MyCourse.tsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Download, RefreshCw, Edit, CheckCircle, Film, BookOpen, Brain } from "lucide-react";
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

    const [openScript, setOpenScript] = useState(false);
    const [activeScriptTitle, setActiveScriptTitle] = useState<string | null>(null);
    const [activeScriptContent, setActiveScriptContent] = useState<string | null>(null);

    const [activeWorkbookTitle, setActiveWorkbookTitle] = useState<string | null>(null);
    const [activeWorkbookContent, setActiveWorkbookContent] = useState<string | null>(null);

    const [activeQuizTitle, setActiveQuizTitle] = useState<string | null>(null);
    const [activeQuizContent, setActiveQuizContent] = useState<string | null>(null);

    const [isTeleprompterActive, setIsTeleprompterActive] = useState(false);
    const [scrollSpeed, setScrollSpeed] = useState(1); // 1 = langsam, 3 = schnell

    const [isRecording, setIsRecording] = useState(false);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [videoURL, setVideoURL] = useState<string | null>(null);
    const [activeVideoTitle, setActiveVideoTitle] = useState<string | null>(null);

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
    };

    const handleSaveRecording = () => {
        if (!recordedBlob || !activeVideoTitle) return;
        const link = document.createElement("a");
        link.href = URL.createObjectURL(recordedBlob);
        link.download = `${activeVideoTitle.replace(/\s+/g, "_")}.webm`;
        link.click();
        toast.success("🎬 Video saved locally!");
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

    useEffect(() => {
        const getInner = () => document.getElementById("script-scroll-inner");

        const tickMs = 30; // alle 20ms (smooth)
        const baseSpeed = 0.4; // Basisgeschwindigkeit

        let interval: ReturnType<typeof setInterval> | null = null;

        if (isTeleprompterActive) {
            interval = setInterval(() => {
                const inner = document.getElementById("script-scroll-inner");
                if (!inner) return;

                const scrollStep = baseSpeed * scrollSpeed;

                // Scroll um den Wert nach unten
                inner.scrollTop += scrollStep;

                // 🚀 NEU: nur stoppen, wenn wirklich "sichtbar unten angekommen"
                if (inner.scrollTop + inner.clientHeight >= inner.scrollHeight - 5) {
                    // Wenn Text zu kurz ist, trotzdem ein paar Sekunden weiterlaufen lassen
                    if (inner.scrollHeight <= inner.clientHeight + 5) return;
                    setIsTeleprompterActive(false);
                }
            }, tickMs);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isTeleprompterActive, scrollSpeed]);

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

    const handleViewScript = async (title: string, path?: string) => {
        if (!path) return alert("No script file found.");

        try {
            const res = await fetch(toURL(path));
            if (!res.ok) throw new Error("Failed to load script file");
            const text = await res.text();

            setActiveScriptTitle(title);
            setActiveScriptContent(text);
            setOpenScript(true);
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

    const handleViewWorkbook = async (title: string, path?: string) => {
        if (!path) return alert("No workbook file found.");
        try {
            const res = await fetch(toURL(path));
            if (!res.ok) throw new Error("Failed to load workbook file");
            const text = await res.text();

            setActiveWorkbookTitle(title);
            setActiveWorkbookContent(text);
        } catch (err) {
            console.error(err);
            alert("Failed to load workbook — check console.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 py-16 px-4">
            <div className="max-w-7xl mx-auto space-y-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                            {course?.course_title ?? "Your Course"}
                        </h1>
                        <p className="text-muted-foreground text-base max-w-2xl">
                            {course?.course_description ?? "Your full AI-generated course will appear here once ready."}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button variant="ghost" onClick={() => navigate("/preview")}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                        </Button>
                        <Button variant="outline" onClick={() => window.location.reload()}>
                            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                        </Button>
                        <Button
                            variant="gradient"
                            onClick={handleDownloadZip}
                            disabled={!course?.zip || downloading}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            {downloading ? "Preparing..." : "Download ZIP"}
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                if (!course) {
                                    alert("No course data yet to publish.");
                                    return;
                                }
                                const slug = encodeURIComponent(course.course_title || "my-course");
                                navigate(`/public/${slug}`, { state: { course } });
                            }}
                        >
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                            Publish
                        </Button>
                    </div>
                </div>

                {/* Banner */}
                {course?.banner_url && (
                    <div className="rounded-3xl overflow-hidden shadow-xl border border-white/10">
                        <img
                            src={course.banner_url}
                            alt="Course banner"
                            className="w-full h-64 object-cover"
                        />
                    </div>
                )}

                {/* Status Box */}
                <Card className="glass border border-indigo-100/40 shadow-sm">
                    <CardContent className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-3">
                            {status === "done" ? (
                                <CheckCircle className="text-green-500 w-6 h-6" />
                            ) : (
                                <div className="w-6 h-6 rounded-full bg-primary/20 animate-pulse" />
                            )}
                            <div>
                                <div className="font-medium">
                                    {status === "done" ? "Generation complete" : "Generating your course..."}
                                </div>
                                <div className="text-xs text-muted-foreground">{progressMsg}</div>
                            </div>
                        </div>
                        <div className="text-xs text-muted-foreground">Job ID: {jobId ?? "—"}</div>
                    </CardContent>
                </Card>

                {/* Main Section */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <main className="lg:col-span-2 space-y-6">
                        {course?.lessons?.length ? (
                            <Accordion type="single" collapsible className="w-full space-y-3">
                                {course.lessons.map((lesson, li) => (
                                    <AccordionItem
                                        key={li}
                                        value={`lesson-${li}`}
                                        className="border border-gray-200/20 dark:border-white/10 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
                                    >
                                        <AccordionTrigger className="px-4 py-3 text-lg font-semibold">
                                            <div className="flex flex-col text-left">
                                                <span>{lesson.lesson_title || `Lesson ${li + 1}`}</span>
                                                <span className="text-sm text-muted-foreground">
                                                    {(lesson.videos?.length || 0)} Videos •{" "}
                                                    {lesson.quiz_file ? "Quiz ✓" : "No Quiz"} •{" "}
                                                    {lesson.workbook_file ? "Workbook ✓" : "No Workbook"}
                                                </span>
                                            </div>
                                        </AccordionTrigger>

                                        <AccordionContent className="p-4 space-y-6 bg-white/30 dark:bg-white/5 rounded-b-2xl">

                                            {/* Videos */}
                                            {lesson.videos?.length ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {lesson.videos.map((v, vi) => {
                                                        const video =
                                                            typeof v === "string" ? { title: `Video ${vi + 1}`, script_file: v } : v;

                                                        return (
                                                            <div
                                                                key={vi}
                                                                className="p-3 rounded-xl border border-gray-200/20 dark:border-white/10 bg-primary/5 hover:bg-primary/10 transition-all"
                                                            >
                                                                <div className="font-medium flex items-center gap-2">
                                                                    <Film className="w-4 h-4 text-primary" /> {video.title || `Video ${vi + 1}`}
                                                                </div>

                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="mt-2"
                                                                    onClick={() => handleViewScript(video.title || `Video ${vi + 1}`, video.script_file)}
                                                                >
                                                                    View Script
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="mt-2 ml-2"
                                                                    onClick={() => handleStartRecording(video.title || `Video ${vi + 1}`)}
                                                                >
                                                                    🎥 Record Video
                                                                </Button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="text-sm text-muted-foreground">No videos available.</div>
                                            )}

                                            {/* Quiz & Workbook */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {lesson.quiz_file && (
                                                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                                                        <div className="font-semibold text-sm flex items-center gap-2">
                                                            <Brain className="w-4 h-4 text-primary" /> Quiz
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            className="mt-2"
                                                            onClick={() => handleViewQuiz(lesson.lesson_title || "Quiz", lesson.quiz_file)}
                                                        >
                                                            View Quiz
                                                        </Button>
                                                    </div>
                                                )}

                                                {lesson.workbook_file && (
                                                    <div className="p-3 rounded-lg bg-secondary/5 border border-secondary/20">
                                                        <div className="font-semibold text-sm flex items-center gap-2">
                                                            <BookOpen className="w-4 h-4 text-secondary" /> Workbook
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            className="mt-2"
                                                            onClick={() => handleViewWorkbook(lesson.lesson_title || "Workbook", lesson.workbook_file)}
                                                        >
                                                            View Workbook
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        ) : (
                            <div className="text-center text-muted-foreground py-20 text-lg">
                                🚀 Your course is being generated — please wait a few moments...
                            </div>
                        )}
                    </main>

                    {/* Sidebar */}
                    <aside className="space-y-6">
                        <Card className="p-5 text-center">
                            {course?.logo_url || course?.logo_path ? (
                                <img
                                    src={course.logo_url || course.logo_path}
                                    alt="Course logo"
                                    className="w-32 h-32 object-contain mx-auto mb-3 rounded-lg shadow-md border border-gray-200/30"
                                />
                            ) : (
                                <div className="w-32 h-32 mx-auto mb-3 rounded-lg bg-muted/20 flex items-center justify-center">
                                    Logo
                                </div>
                            )}
                            <div className="text-sm text-muted-foreground mb-3">
                                Branded assets & visuals are automatically generated.
                            </div>
                            <Button variant="ghost" onClick={() => alert("Open Branding editor (future)")}>
                                Edit Branding
                            </Button>
                        </Card>

                        <Card className="p-5">
                            <div className="text-sm text-muted-foreground space-y-2">
                                <div><strong>Tips</strong></div>
                                <div>• Download ZIP for your full course package.</div>
                                <div>• Publish to share your course online.</div>
                                <div>• Use Edit to adjust and regenerate content anytime.</div>
                            </div>
                        </Card>
                    </aside>
                </section>
            </div>
            <Dialog open={openScript} onOpenChange={setOpenScript}>
                <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>{activeScriptTitle}</DialogTitle>
                    </DialogHeader>

                    {/* Controls */}
                    <div className="flex items-center justify-between gap-3 mt-2 mb-3">
                        <div className="flex gap-2">
                            <Button
                                variant={isTeleprompterActive ? "destructive" : "default"}
                                onClick={() => setIsTeleprompterActive((s) => !s)}
                            >
                                {isTeleprompterActive ? "⏸ Pause" : "▶ Start Teleprompter"}
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="text-sm">
                                        Speed: {scrollSpeed === 1 ? "Slow" : scrollSpeed === 2 ? "Medium" : "Fast"}
                                        <ChevronDown className="ml-2 h-4 w-4 opacity-70" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => setScrollSpeed(1)}>Slow</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setScrollSpeed(2)}>Medium</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setScrollSpeed(3)}>Fast</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="text-sm text-muted-foreground">Tip: close dialog to stop</div>
                    </div>

                    {/* Teleprompter viewport: mask + inner scroll */}
                    <div
                        id="script-scroll-viewport"
                        style={{
                            height: "124px", // small viewport height — roughly 1–2 lines depending on font-size
                            // Make it visually nice with soft fades (mask)
                            WebkitMaskImage:
                                "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)",
                            maskImage:
                                "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)",
                        }}
                    >

                        {/* inner scrollable container (this is what we scroll programmatically) */}
                        <div
                            id="script-scroll-inner"
                            className="p-4 whitespace-pre-wrap text-4xl leading-relaxed tracking-wide"
                            style={{
                                overflowY: "scroll", // ✅ explizit scrollfähig
                                maxHeight: "124px",   // ✅ exakt gleich groß wie der Viewport
                                scrollbarWidth: "none", // optional: hide scrollbar
                            }}
                        >
                            {activeScriptContent ? (
                                // render each line in its own block so the "reveal one line at a time" looks natural
                                activeScriptContent.split("\n").map((line, idx) => (
                                    <div
                                        key={idx}
                                        className="tele-line py-1"
                                        style={{
                                            minHeight: "1.2em",
                                            display: "block",
                                            color: "var(--foreground)", // respect theme
                                        }}
                                    >
                                        {line || " "}
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm text-muted-foreground">Loading script...</div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>


            {/* Quiz Modal (sibling) */}
            <Dialog open={!!activeQuizTitle} onOpenChange={() => setActiveQuizTitle(null)}>
                <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl border bg-background/95 backdrop-blur-md">
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
            <Dialog open={!!activeWorkbookTitle} onOpenChange={() => setActiveWorkbookTitle(null)}>
                <DialogContent className="max-w-3xl max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle>{activeWorkbookTitle}</DialogTitle>
                    </DialogHeader>

                    <div className="mt-2 max-h-[65vh] overflow-y-auto">
                        {activeWorkbookContent ? (
                            <WorkbookDisplay workbook={activeWorkbookContent} />
                        ) : (
                            <p className="text-sm text-muted-foreground">Loading workbook...</p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
            {/* 🎥 Video Recording Dialog */}
            <Dialog open={isRecording || !!recordedBlob} onOpenChange={() => {
                if (isRecording) handleStopRecording();
                setRecordedBlob(null);
                setVideoURL(null);
            }}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>🎥 {activeVideoTitle || "Recording..."}</DialogTitle>
                    </DialogHeader>

                    {isRecording && (
                        <div className="text-center space-y-4">
                            <p className="text-sm text-muted-foreground">Recording... Press stop when done.</p>
                            <Button variant="destructive" onClick={handleStopRecording}>⏹ Stop Recording</Button>
                        </div>
                    )}

                    {!isRecording && recordedBlob && (
                        <div className="flex flex-col items-center space-y-4">
                            <video
                                src={videoURL || ""}
                                controls
                                className="w-full rounded-lg border border-gray-300 shadow-md"
                            />
                            <div className="flex gap-3">
                                <Button onClick={handleSaveRecording}>💾 Save Video</Button>
                                <Button variant="secondary" onClick={() => {
                                    setRecordedBlob(null);
                                    setVideoURL(null);
                                }}>
                                    🔁 Record Again
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div >
    );
};

export default MyCourse;