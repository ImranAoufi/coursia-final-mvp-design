import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function CourseView() {
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Hole Kursdaten aus SessionStorage (vom letzten Schritt)
        const data = sessionStorage.getItem("coursia_preview");
        if (data) {
            setCourse(JSON.parse(data));
        }
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-gray-500">
                <Loader2 className="animate-spin mr-2" /> Loading Course...
            </div>
        );
    }

    if (!course) {
        return <div className="text-center text-gray-400 mt-10">No course loaded.</div>;
    }

    const courseData = course.course || course.preview || course;

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted px-4 py-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-xl bg-card"
            >
                {/* Banner */}
                <div className="relative w-full h-64 bg-gradient-to-r from-primary/70 to-accent/70">
                    {courseData.banner_path && (
                        <img
                            src={`http://127.0.0.1:8000/${courseData.banner_path}`}
                            alt="Course banner"
                            className="w-full h-64 object-cover"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
                    <div className="absolute bottom-6 left-6 text-white">
                        <h1 className="text-3xl font-bold">{courseData.course_title}</h1>
                        <p className="text-white/80 mt-2">{courseData.course_description}</p>
                    </div>
                </div>

                {/* Logo */}
                {courseData.logo_path && (
                    <div className="flex justify-center -mt-12">
                        <img
                            src={`http://127.0.0.1:8000/${courseData.logo_path}`}
                            alt="Course logo"
                            className="w-24 h-24 rounded-xl border-4 border-background shadow-lg bg-white"
                        />
                    </div>
                )}

                {/* Lessons */}
                <div className="p-8 space-y-6">
                    <h2 className="text-2xl font-semibold text-foreground mb-4">Lessons</h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        {courseData.lessons?.map((lesson: any, idx: number) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white/5 rounded-xl border border-border p-5 hover:bg-white/10 transition"
                            >
                                <h3 className="text-lg font-semibold text-primary">
                                    {lesson.lesson_title}
                                </h3>
                                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                                    {lesson.video_titles?.map((v: string, vi: number) => (
                                        <li key={vi}>🎬 {v}</li>
                                    ))}
                                </ul>

                                <div className="flex gap-3 mt-3">
                                    {lesson.quiz && (
                                        <span className="text-green-500 flex items-center text-sm">
                                            <CheckCircle2 className="w-4 h-4 mr-1" /> Quiz
                                        </span>
                                    )}
                                    {lesson.workbook && (
                                        <span className="text-blue-400 flex items-center text-sm">
                                            <CheckCircle2 className="w-4 h-4 mr-1" /> Workbook
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-center gap-4 pb-10">
                    <Button
                        variant="gradient"
                        disabled={loading}
                        onClick={async () => {
                            setLoading(true);
                            try {
                                const res = await fetch("http://127.0.0.1:8000/api/generate-full-course", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ course: courseData }),
                                });

                                if (!res.ok) throw new Error("Fehler beim Generieren");
                                const data = await res.json();

                                sessionStorage.setItem("coursia_full", JSON.stringify(data));
                                alert("✅ Full Course erfolgreich generiert!");
                            } catch (err) {
                                console.error(err);
                                alert("❌ Fehler beim Generieren des Full Courses");
                            } finally {
                                setLoading(false);
                            }
                        }}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin mr-2" /> Generating...
                            </>
                        ) : (
                            "Generate Full Course"
                        )}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}