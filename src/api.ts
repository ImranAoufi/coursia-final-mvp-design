// 🔧 Basis-URL für dein Backend
const API_URL = "http://127.0.0.1:8000";
const base = import.meta.env.VITE_API_BASE || API_URL;

// ✅ Testverbindung zum Backend
export async function testBackend() {
    const response = await fetch(`${base}/`);
    const data = await response.json();
    return data;
}

// ✅ Beispielroute (optional)
export async function generateFromBackend(topic: string) {
    const response = await fetch(`${base}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
    });
    const data = await response.json();
    return data;
}

export interface PreviewRequest {
    prompt: string;
    num_lessons?: number;
    videos_per_lesson?: number;
    include_quiz: boolean;
    include_workbook: boolean;
    transformation?: string;
    audience?: string;
    level?: string;
    format?: "Micro" | "Standard" | "Masterclass"; // ← neu hinzugefügt, sonst alles gleich
}

// ⛔ Keine Änderung an der Funktion selbst - exakt wie vorher
export async function generatePreviewCourse(payload: PreviewRequest) {
    try {
        const url = `${base}/api/preview-course`;
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(`API error ${res.status}: ${text}`);
        }

        const data = await res.json();
        return data;
    } catch (err) {
        console.error("generatePreviewCourse error:", err);
        throw err;
    }
}


export async function sendOutcomeToBackend(outcome: string) {
    try {
        const res = await fetch("http://localhost:8080/api/preview-course", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                prompt: outcome,
                num_lessons: 5,
                videos_per_lesson: 2,
                include_quiz: true,
                include_workbook: true,
            }),
        });
        const data = await res.json();
        console.log("📤 Outcome successfully sent:", data);
        return data;
    } catch (err) {
        console.error("❌ Error sending outcome to backend:", err);
    }
}

export async function sendAudienceToBackend(audience: string, audienceLevel: string) {
    try {
        const res = await fetch("http://127.0.0.1:8000/api/audience", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ audience, audienceLevel }),
        });
        if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(`API error ${res.status}: ${text}`);
        }
        const data = await res.json();
        console.log("✅ sendAudienceToBackend response:", data);
        return data;
    } catch (err) {
        console.error("❌ sendAudienceToBackend failed:", err);
        throw err;
    }
}

export async function uploadMaterialsToBackend(files: File[]) {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const res = await fetch("http://127.0.0.1:8000/api/materials", {
        method: "POST",
        body: formData,
    });

    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    return res.json();
}

export async function generateFullCourse(courseData?: any) {
    try {
        console.log("📤 Sending full course generation request to backend...");
        const response = await fetch("http://127.0.0.1:8000/api/generate-full-course", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(courseData || {}),
        });

        console.log("📥 Full course response status:", response.status);
        if (!response.ok) {
            const text = await response.text();
            console.error("❌ Error from backend:", text);
            throw new Error(text);
        }

        const data = await response.json();
        console.log("✅ Full course generation response:", data);
        return data;
    } catch (err) {
        console.error("💥 Full course generation failed:", err);
        throw err;
    }
}

export async function pollJobStatus(jobId: string, onProgress?: (status: string) => void) {
    console.log(`⏳ Polling job status for ${jobId}...`);

    while (true) {
        const res = await fetch(`http://127.0.0.1:8000/api/job-status/${jobId}`);
        const data = await res.json();

        if (onProgress) onProgress(data.status);

        // Wenn fertig
        if (data.status === "done" && data.result) {
            console.log("✅ Course generation completed:", data.result);

            // 🔥 Wichtig: Kurs-Daten speichern
            sessionStorage.setItem("coursia_full_course", JSON.stringify(data.result));

            return data.result; // nicht data.result.course
        }

        if (data.status === "failed") {
            console.error("❌ Job failed:", data);
            throw new Error("Course generation failed");
        }

        await new Promise((resolve) => setTimeout(resolve, 3000));
    }
}
