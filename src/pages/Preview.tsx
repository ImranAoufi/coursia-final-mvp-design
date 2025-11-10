// FILE: src/pages/Preview.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import CompletionMeter from "@/components/CompletionMeter";
import { generateFullCourse, pollJobStatus } from "@/api";

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

    // Read preview JSON from sessionStorage (set by the Wizard when preview was generated)
    useEffect(() => {
        const raw = sessionStorage.getItem("coursia_preview") || sessionStorage.getItem("Coursera Preview");
        if (raw) {
            try {
                const parsed = JSON.parse(raw);

                // 🧠 Falls die Struktur { course: { ... } } ist → genau das Objekt extrahieren
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
                }
                // Falls es schon direkt das korrekte Format hat
                else if (parsed.preview) {
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
            console.log("🚀 Generate Full Course clicked!");
            const previewData = JSON.parse(sessionStorage.getItem("coursia_preview") || "{}");

            const result = await generateFullCourse(previewData);

            if (!result?.jobId) {
                console.error("No jobId returned from backend:", result);
                alert("Generation started but no job ID received. Check backend response.");
                return;
            }

            // Speichere das jobId in sessionStorage oder leite direkt weiter
            sessionStorage.setItem("coursia_job_id", result.jobId);

            // Weiterleiten zu MyCourse + jobId übergeben
            navigate("/my-course", { state: { jobId: result.jobId } });
        } catch (err) {
            console.error("❌ Error starting full course generation:", err);
            alert("There was a problem generating the full course. Check console.");
        }
    };
    if (!preview) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6">
                <div className="max-w-3xl w-full text-center space-y-6">
                    <Logo className="mx-auto h-14" />
                    <h1 className="text-3xl font-bold">Course Preview</h1>
                    <p className="text-muted-foreground">No preview found. Go back to the wizard to generate a new preview.</p>
                    <div className="flex justify-center">
                        <Button variant="gradient" onClick={() => navigate('/wizard')}>
                            Back to Wizard
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background py-10 px-4">
            <div className="max-w-7xl mx-auto">
                <CompletionMeter currentStep={1} totalSteps={4} />

                <div className="mt-24 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="col-span-2 space-y-6">
                        <Card className="p-6">
                            <CardHeader>
                                <CardTitle className="text-2xl">Preview: {preview.topic ?? 'Your course'}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {preview.lessons && preview.lessons.length > 0 ? (
                                        preview.lessons.map((lesson, idx) => (
                                            <div key={idx} className="p-4 rounded-2xl border border-glass-border bg-white/5">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div>
                                                        <div className="text-lg font-semibold">{lesson.lesson_title}</div>
                                                        <div className="text-sm text-muted-foreground">Lesson {idx + 1}</div>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">Videos: {lesson.video_titles.length}</div>
                                                </div>

                                                <ul className="list-disc pl-5 space-y-1">
                                                    {lesson.video_titles.map((v, i) => (
                                                        <li key={i} className="text-sm">{v}</li>
                                                    ))}
                                                </ul>

                                                <div className="mt-3 flex gap-3 items-center">
                                                    {lesson.quiz && <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs">Includes quiz</div>}
                                                    {lesson.workbook && <div className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs">Includes workbook</div>}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-muted-foreground">No lessons generated.</div>
                                    )}
                                </div>

                                <div className="mt-6 flex gap-3">
                                    <Button variant="ghost" onClick={() => navigate('/wizard')}>Edit inputs</Button>
                                    <Button
                                        onClick={handleGenerateFullCourse}
                                        variant="gradient"
                                        size="lg"
                                    >
                                        Generate Full Course
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="p-6">
                            <CardHeader>
                                <CardTitle className="text-lg">What you saw in the preview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    This preview is a lightweight outline: lesson titles, video titles and whether quizzes/workbooks are included.
                                    The full generation (scripts, slides, rendered video, brand pack) runs after you choose a plan.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <aside className="space-y-6">
                        <Card className="p-6 sticky top-28">
                            <CardHeader>
                                <CardTitle className="text-lg">Quick summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-muted-foreground">
                                    <div>Topic: <strong>{preview.topic ?? '—'}</strong></div>
                                    <div className="mt-2">Lessons: <strong>{preview.lessons?.length ?? 0}</strong></div>
                                    <div className="mt-2">
                                        Estimated videos:{" "}
                                        <strong>
                                            {Array.isArray(preview.lessons)
                                                ? preview.lessons.reduce(
                                                    (sum, l) => sum + (Array.isArray(l.video_titles) ? l.video_titles.length : 0),
                                                    0
                                                )
                                                : 0}
                                        </strong>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="p-6">
                            <CardHeader>
                                <CardTitle className="text-lg">Next steps</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="text-sm space-y-2 text-muted-foreground">
                                    <li>Adjust lesson names or counts in the wizard.</li>
                                    <li>Choose a plan and unlock full generation.</li>
                                    <li>After generation you can edit scripts with the chat assistant.</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default Preview;


/* ------------------------------------------------------------------ */
/* INTEGRATION NOTES (copy into your project files)                   */
/* 1) Add route to App.tsx:                                           */
/*    <Route path="/preview" element={<Preview />} />                 */
/*                                                                      */
/* 2) Update the Index.tsx handlePreview to store preview and navigate: */
/*    import { useNavigate } from 'react-router-dom'                    */
/*    const navigate = useNavigate();                                  */
/*    async function handlePreview() {                                 */
/*      const preview = await generatePreviewCourse(payload);          */
/*      // store preview in session so Preview page can read it       */
/*      sessionStorage.setItem('coursia_preview', JSON.stringify({    */
/*         topic: payload.prompt,                                     */
/*         lessons: JSON.parse(preview.preview) || preview            */
/*      }));                                                           */
/*      navigate('/preview');                                          */
/*    }                                                                 */
/*                                                                      */
/* 3) Keep all UI components consistent with the rest of the app.      */
/* 4) Restart dev server if necessary: npm run dev                     */
/* ------------------------------------------------------------------ */
