/**
 * Client-side fallback course generator.
 * Produces a complete course structure without any API calls.
 * Used when edge functions / AI credits are unavailable.
 */

const MODULE_TITLES = [
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
  "Final Project & Review",
];

interface FallbackLesson {
  lesson_title: string;
  lesson_description: string;
  video_titles: string[];
  script: string;
  quiz: {
    questions: {
      question: string;
      options: string[];
      correct: number;
    }[];
  };
  workbook: {
    prompts: string[];
  };
}

export interface FallbackCourse {
  course_title: string;
  course_description: string;
  category: string;
  lessons: FallbackLesson[];
}

export function generateFallbackCourse(
  outcome: string,
  audience?: string,
  level?: string,
  size?: string,
): FallbackCourse {
  const numLessons = size === "micro" ? 4 : size === "masterclass" ? 13 : 8;
  const title = outcome.length > 60 ? outcome.substring(0, 57) + "..." : outcome;

  const lessons: FallbackLesson[] = [];

  for (let i = 0; i < numLessons; i++) {
    const modTitle = MODULE_TITLES[i % MODULE_TITLES.length];
    lessons.push({
      lesson_title: `Module ${i + 1}: ${modTitle}`,
      lesson_description: `Learn the key concepts and practical applications for ${modTitle.toLowerCase()}.`,
      video_titles: [
        `Introduction to ${modTitle}`,
        `Deep Dive: ${modTitle}`,
      ],
      script: `Welcome to Module ${i + 1} — ${modTitle}.\n\nIn this lesson we explore important concepts related to "${outcome}". Whether you're just starting out or deepening your understanding, this module gives you practical tools you can apply right away.\n\nLet's begin with the fundamentals. Mastering any skill requires both knowledge and consistent practice. Throughout this lesson I'll share examples and exercises to help you build confidence.\n\nRemember, the goal isn't perfection — it's progress. Take notes, pause when you need to, and revisit sections that feel challenging.\n\nBy the end of this module you'll have a clear framework you can start using immediately. Let's dive in!`,
      quiz: {
        questions: [
          {
            question: `What is the main focus of Module ${i + 1}?`,
            options: [
              "Theory only",
              "Practical application",
              "Both theory and practice",
              "None of the above",
            ],
            correct: 2,
          },
          {
            question: "What approach does this course recommend?",
            options: [
              "Perfection",
              "Progress over perfection",
              "Speed",
              "Memorization",
            ],
            correct: 1,
          },
        ],
      },
      workbook: {
        prompts: [
          `Reflect on your current understanding of this topic. What do you already know?`,
          `List 3 specific ways you can apply what you learned in this module.`,
          `What is one challenge you anticipate, and how will you overcome it?`,
        ],
      },
    });
  }

  return {
    course_title: title,
    course_description: `A comprehensive course designed to help ${audience || "learners"} achieve: ${outcome}. Suitable for ${level || "intermediate"} level.`,
    category: "Personal Development",
    lessons,
  };
}
