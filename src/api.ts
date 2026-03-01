import { supabase } from "@/integrations/supabase/client";
import { API_BASE, isLocalBackend } from "@/cofig";
import { generateFallbackCourse } from "@/lib/fallbackCourseGenerator";

// ✅ Dual-mode: Uses localhost FastAPI when available, otherwise Supabase edge functions

export async function testBackend() {
  if (isLocalBackend()) {
    const res = await fetch(`${API_BASE}/api/test`);
    return res.json();
  }
  return { status: "ok", message: "Using Supabase edge functions" };
}

export async function generateFromBackend(topic: string) {
  if (isLocalBackend()) {
    const res = await fetch(`${API_BASE}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
    });
    return res.json();
  }
  return { status: "ok", topic };
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
  format?: "Micro" | "Standard" | "Masterclass";
}

export async function generatePreviewCourse(payload: PreviewRequest) {
  try {
    if (isLocalBackend()) {
      const res = await fetch(`${API_BASE}/api/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Local API error: ${res.status}`);
      const data = await res.json();
      return { preview: data };
    }

    // Cloud mode: use edge function
    const { data, error } = await supabase.functions.invoke("generate-course", {
      body: {
        outcome: payload.prompt,
        audience: payload.audience || "",
        audience_level: payload.level || "Intermediate",
        course_size: payload.format === "Micro" ? "micro" : payload.format === "Masterclass" ? "masterclass" : "standard",
        materials: "",
        links: "",
      }
    });

    if (error) throw error;
    return { preview: data };
  } catch (err) {
    console.warn("⚠️ Cloud generation failed, using free fallback:", err);
    const size = payload.format === "Micro" ? "micro" : payload.format === "Masterclass" ? "masterclass" : "standard";
    const fallback = generateFallbackCourse(
      payload.prompt,
      payload.audience,
      payload.level,
      size,
    );
    return { preview: fallback };
  }
}

export async function sendOutcomeToBackend(outcome: string) {
  if (isLocalBackend()) {
    const res = await fetch(`${API_BASE}/api/outcome`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outcome }),
    });
    return res.json();
  }
  console.log("📝 Outcome stored locally:", outcome);
  return { status: "ok" };
}

export async function sendAudienceToBackend(audience: string, audienceLevel: string) {
  if (isLocalBackend()) {
    const res = await fetch(`${API_BASE}/api/audience`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audience, audience_level: audienceLevel }),
    });
    return res.json();
  }
  console.log("📝 Audience stored locally:", audience, audienceLevel);
  return { status: "ok" };
}

export async function uploadMaterialsToBackend(files: File[]) {
  if (isLocalBackend()) {
    const formData = new FormData();
    files.forEach(f => formData.append("files", f));
    const res = await fetch(`${API_BASE}/api/upload-materials`, {
      method: "POST",
      body: formData,
    });
    return res.json();
  }

  // Cloud mode: upload to Supabase storage
  const uploaded: string[] = [];
  for (const file of files) {
    const filePath = `uploads/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("course-branding").upload(filePath, file);
    if (!error) {
      uploaded.push(filePath);
    } else {
      console.error("Upload error:", error);
    }
  }
  return { materials: uploaded.map(f => ({ filename: f })) };
}

export async function generateFullCourse(courseData?: any) {
  try {
    console.log("📤 Generating full course...");

    const wizardData = JSON.parse(sessionStorage.getItem("coursia_wizard_data") || "{}");
    const previewData = JSON.parse(sessionStorage.getItem("coursia_preview") || "{}");

    if (isLocalBackend()) {
      const res = await fetch(`${API_BASE}/api/generate-full`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outcome: wizardData.outcome || previewData.topic || "Course",
          audience: wizardData.audience || "",
          audience_level: wizardData.audienceLevel || "Intermediate",
          course_size: wizardData.courseSize || "standard",
          materials: wizardData.materials || "",
          links: wizardData.links || "",
          ...courseData,
        }),
      });
      if (!res.ok) throw new Error(`Local API error: ${res.status}`);
      const data = await res.json();
      sessionStorage.setItem("coursia_full_course", JSON.stringify(data));
      return data;
    }

    // Cloud mode: use edge function
    const { data, error } = await supabase.functions.invoke("generate-course", {
      body: {
        outcome: wizardData.outcome || previewData.topic || "Course",
        audience: wizardData.audience || "",
        audience_level: wizardData.audienceLevel || "Intermediate",
        course_size: wizardData.courseSize || "standard",
        materials: wizardData.materials || "",
        links: wizardData.links || "",
      }
    });

    if (error) throw error;
    sessionStorage.setItem("coursia_full_course", JSON.stringify(data));
    return data;
  } catch (err) {
    console.warn("⚠️ Full course cloud generation failed, using free fallback:", err);
    const outcome = JSON.parse(sessionStorage.getItem("coursia_wizard_data") || "{}");
    const fallback = generateFallbackCourse(
      outcome.outcome || "Course",
      outcome.audience,
      outcome.audienceLevel,
      outcome.courseSize,
    );
    sessionStorage.setItem("coursia_full_course", JSON.stringify(fallback));
    return fallback;
  }
}

export async function pollJobStatus(jobId: string, onProgress?: (status: string) => void) {
  if (isLocalBackend()) {
    // Poll the local FastAPI backend
    let attempts = 0;
    while (attempts < 120) {
      const res = await fetch(`${API_BASE}/api/job-status/${jobId}`);
      const data = await res.json();
      if (onProgress) onProgress(data.status || "processing");
      if (data.status === "done" || data.status === "completed") return data;
      if (data.status === "error" || data.status === "failed") throw new Error(data.error || "Job failed");
      await new Promise(r => setTimeout(r, 2000));
      attempts++;
    }
    throw new Error("Job timed out");
  }

  // Cloud mode: synchronous, no polling needed
  if (onProgress) onProgress("done");
  const result = JSON.parse(sessionStorage.getItem("coursia_full_course") || "{}");
  return result;
}
