/**
 * Normalizes course data from various sources (AI edge function, fallback generator, local backend)
 * into a consistent format that MyCourse page can render.
 */

interface NormalizedVideo {
  title: string;
  script_file?: string;
  script_content?: string;
}

interface NormalizedLesson {
  lesson_title: string;
  lesson_description?: string;
  videos: NormalizedVideo[];
  quiz_file?: string;
  quiz_data?: { questions: { question: string; options: string[]; correct: number }[] };
  workbook_file?: string;
  workbook_data?: { prompts: string[] };
  script_content?: string;
}

export interface NormalizedCourse {
  course_title: string;
  course_description?: string;
  category?: string;
  marketing_hook?: string;
  logo_url?: string;
  banner_url?: string;
  lessons: NormalizedLesson[];
  zip?: string;
}

export function normalizeCourse(raw: any): NormalizedCourse {
  if (!raw) return { course_title: "Untitled Course", lessons: [] };

  const lessons: NormalizedLesson[] = (raw.lessons || []).map((l: any, i: number) => {
    // Build videos array from either `videos` or `video_titles`
    let videos: NormalizedVideo[] = [];
    if (Array.isArray(l.videos) && l.videos.length > 0) {
      videos = l.videos.map((v: any, vi: number) => {
        if (typeof v === "string") return { title: `Video ${vi + 1}`, script_file: v };
        return { title: v.title || `Video ${vi + 1}`, script_file: v.script_file, script_content: v.script_content };
      });
    } else if (Array.isArray(l.video_titles)) {
      videos = l.video_titles.map((t: string, vi: number) => ({ title: t || `Video ${vi + 1}` }));
    }

    // Handle quiz: inline object or file path
    let quiz_file = l.quiz_file;
    let quiz_data = undefined;
    if (l.quiz && typeof l.quiz === "object" && l.quiz.questions) {
      quiz_data = l.quiz;
      if (!quiz_file) quiz_file = "__inline__"; // marker so UI knows quiz exists
    }

    // Handle workbook: inline object or file path
    let workbook_file = l.workbook_file;
    let workbook_data = undefined;
    if (l.workbook && typeof l.workbook === "object" && l.workbook.prompts) {
      workbook_data = l.workbook;
      if (!workbook_file) workbook_file = "__inline__";
    }

    // Script content (inline from AI/fallback)
    const script_content = l.script || l.script_content;

    return {
      lesson_title: l.lesson_title || l.title || `Lesson ${i + 1}`,
      lesson_description: l.lesson_description,
      videos,
      quiz_file,
      quiz_data,
      workbook_file,
      workbook_data,
      script_content,
    };
  });

  return {
    course_title: raw.course_title || raw.title || "Untitled Course",
    course_description: raw.course_description || raw.description,
    category: raw.category,
    marketing_hook: raw.marketing_hook,
    logo_url: raw.logo_url,
    banner_url: raw.banner_url,
    lessons,
    zip: raw.zip,
  };
}
