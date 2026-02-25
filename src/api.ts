import { supabase } from "@/integrations/supabase/client";

// ✅ All API calls now go through Supabase edge functions — no localhost dependency

export async function testBackend() {
  return { status: "ok", message: "Using Supabase edge functions" };
}

export async function generateFromBackend(topic: string) {
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
    console.error("generatePreviewCourse error:", err);
    throw err;
  }
}

export async function sendOutcomeToBackend(outcome: string) {
  // No-op: outcome is stored in wizard state and sent with full generation
  console.log("📝 Outcome stored locally:", outcome);
  return { status: "ok" };
}

export async function sendAudienceToBackend(audience: string, audienceLevel: string) {
  // No-op: audience is stored in wizard state and sent with full generation
  console.log("📝 Audience stored locally:", audience, audienceLevel);
  return { status: "ok" };
}

export async function uploadMaterialsToBackend(files: File[]) {
  // Upload files to Supabase storage instead
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
    console.log("📤 Generating full course via edge function...");
    
    const wizardData = JSON.parse(sessionStorage.getItem("coursia_wizard_data") || "{}");
    const previewData = JSON.parse(sessionStorage.getItem("coursia_preview") || "{}");
    
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
    
    // Store result
    sessionStorage.setItem("coursia_full_course", JSON.stringify(data));
    
    return data;
  } catch (err) {
    console.error("💥 Full course generation failed:", err);
    throw err;
  }
}

export async function pollJobStatus(jobId: string, onProgress?: (status: string) => void) {
  // With edge functions, generation is synchronous — no polling needed
  // But we keep this for compatibility
  if (onProgress) onProgress("done");
  const result = JSON.parse(sessionStorage.getItem("coursia_full_course") || "{}");
  return result;
}
