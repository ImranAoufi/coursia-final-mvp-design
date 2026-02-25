const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface GenerateCourseRequest {
  outcome: string;
  audience?: string;
  audience_level?: string;
  course_size?: string;
  materials?: string;
  links?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json() as GenerateCourseRequest;
    const { outcome, audience, audience_level, course_size, materials, links } = body;

    if (!outcome || outcome.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "No outcome provided" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const numLessons = course_size === "micro" ? 4 : course_size === "masterclass" ? 13 : 8;

    const prompt = `You are an expert online course creator. Design a comprehensive course based on this information:

- Course Goal/Outcome: ${outcome}
- Target Audience: ${audience || "General learners"} (Level: ${audience_level || "Intermediate"})
- Course Size: ${course_size || "standard"} (${numLessons} lessons)
- Creator's Knowledge/Materials: ${materials || "Not provided"}
- Reference Links: ${links || "None"}

Create a complete course structure. Return ONLY valid JSON in this exact format:
{
  "course_title": "Engaging Course Title",
  "course_description": "2-3 sentence description",
  "category": "Category Name",
  "lessons": [
    {
      "lesson_title": "Lesson Title",
      "lesson_description": "Brief description of what students will learn",
      "video_titles": ["Video 1 Title", "Video 2 Title"],
      "script": "A detailed teleprompter script (300-500 words) for the lesson video. Write as if speaking directly to the student. Include examples and actionable advice.",
      "quiz": {
        "questions": [
          {
            "question": "Quiz question text?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct": 0
          },
          {
            "question": "Another question?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct": 2
          }
        ]
      },
      "workbook": {
        "prompts": [
          "Reflection prompt or exercise 1",
          "Reflection prompt or exercise 2",
          "Action step or practice exercise"
        ]
      }
    }
  ]
}

Generate exactly ${numLessons} lessons. Each lesson must have:
- A compelling title
- A brief description
- 2 video titles
- A detailed script (300-500 words, written conversationally)
- 2-3 quiz questions with 4 options each
- 2-3 workbook prompts

Make the content engaging, practical, and professional.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an expert course creator. Always respond with valid JSON only. No markdown, no backticks." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 16000,
      }),
    });

    if (!response.ok) {
      console.error("AI Gateway error:", await response.text());
      const fallback = generateFallbackCourse(outcome, audience, audience_level, course_size, numLessons);
      return new Response(
        JSON.stringify(fallback),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || "";

    let courseData: any;
    try {
      const jsonMatch = content.match(/\{[\s\S]*"lessons"[\s\S]*\}/);
      courseData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      console.error("Failed to parse AI response");
      courseData = generateFallbackCourse(outcome, audience, audience_level, course_size, numLessons);
    }

    if (!courseData?.lessons?.length) {
      courseData = generateFallbackCourse(outcome, audience, audience_level, course_size, numLessons);
    }

    return new Response(
      JSON.stringify(courseData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in generate-course:", error);
    return new Response(
      JSON.stringify({ error: msg }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

function generateFallbackCourse(outcome: string, audience?: string, level?: string, size?: string, numLessons = 8) {
  const title = outcome.length > 60 ? outcome.substring(0, 57) + "..." : outcome;
  const lessons = [];

  for (let i = 0; i < numLessons; i++) {
    lessons.push({
      lesson_title: `Module ${i + 1}: ${getModuleTitle(i, numLessons)}`,
      lesson_description: `Learn the key concepts and practical applications for this module.`,
      video_titles: [`Introduction to Module ${i + 1}`, `Deep Dive: Module ${i + 1}`],
      script: `Welcome to Module ${i + 1}. In this lesson, we're going to explore important concepts related to ${outcome}. Whether you're just starting out or looking to deepen your understanding, this module will give you practical tools and insights you can apply right away.\n\nLet's begin by understanding the fundamentals. The key idea here is that mastering this skill requires both knowledge and practice. Throughout this lesson, I'll share examples and exercises to help you build confidence.\n\nRemember, the goal isn't perfection — it's progress. Take notes, pause when you need to, and don't hesitate to revisit sections that feel challenging. By the end of this module, you'll have a clear framework you can start using immediately.\n\nLet's dive in!`,
      quiz: {
        questions: [
          {
            question: `What is the main focus of Module ${i + 1}?`,
            options: ["Theory only", "Practical application", "Both theory and practice", "None of the above"],
            correct: 2
          },
          {
            question: "What approach does this course recommend?",
            options: ["Perfection", "Progress over perfection", "Speed", "Memorization"],
            correct: 1
          }
        ]
      },
      workbook: {
        prompts: [
          `Reflect on your current understanding of this topic. What do you already know?`,
          `List 3 specific ways you can apply what you learned in this module.`,
          `What is one challenge you anticipate, and how will you overcome it?`
        ]
      }
    });
  }

  return {
    course_title: title,
    course_description: `A comprehensive course designed to help ${audience || "learners"} achieve: ${outcome}. Suitable for ${level || "intermediate"} level.`,
    category: "Personal Development",
    lessons
  };
}

function getModuleTitle(index: number, total: number): string {
  const titles = [
    "Foundation & Overview",
    "Core Concepts",
    "Building Your Framework",
    "Practical Techniques",
    "Advanced Strategies",
    "Real-World Application",
    "Common Challenges & Solutions",
    "Optimization & Refinement",
    "Scaling Your Skills",
    "Integration & Mastery",
    "Case Studies & Examples",
    "Future Growth & Next Steps",
    "Final Project & Review"
  ];
  return titles[index % titles.length];
}
