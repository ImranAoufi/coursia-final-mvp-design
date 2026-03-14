export interface PreviewCoursePayload {
    prompt: string;
    num_lessons?: number;
    videos_per_lesson?: number;
    include_quiz: boolean;
    include_workbook: boolean;
    transformation?: string;
    audience?: string;
    level?: string;
    format?: "Micro" | "Standard" | "Masterclass"; // ✅ richtig typisiert
}

export async function generatePreviewCourse(payload: PreviewCoursePayload) {
    const response = await fetch("http://127.0.0.1:8000/api/preview-course", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
    }

    return response.json();
}