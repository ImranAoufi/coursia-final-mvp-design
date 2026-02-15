import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function generateFallbackDescription(courseTitle: string, courseDescription: string, audienceLevel: string, category: string, outcome: string, lessonsCount: number): string {
  const level = audienceLevel || "Intermediate";
  const cat = category || "Personal Development";
  const lessons = lessonsCount || 4;
  const outcomeText = outcome || "master the subject";

  const hooks = [
    `Ready to transform your understanding of ${courseTitle.toLowerCase()}?`,
    `What separates those who succeed from those who don't? Knowledge — and ${courseTitle} delivers exactly that.`,
    `Imagine confidently applying ${courseTitle.toLowerCase()} skills in real-world scenarios.`,
    `The journey to ${outcomeText.toLowerCase()} starts with a single step — this course is that step.`,
  ];
  
  const hash = courseTitle.split('').reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
  const hook = hooks[Math.abs(hash) % hooks.length];

  return `${hook} This carefully structured ${lessons}-lesson ${cat.toLowerCase()} course takes you from foundational concepts to practical mastery, designed specifically for ${level.toLowerCase()}-level learners who want results. ${courseDescription ? courseDescription + ' ' : ''}Through hands-on exercises and expert-crafted content, you'll develop the confidence and competence to ${outcomeText.toLowerCase()}. Every lesson builds on the last, creating a clear pathway to expertise that you can apply immediately. Don't let this opportunity pass — enroll now and start your transformation today.`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { courseTitle, courseDescription, audienceLevel, category, outcome, lessonsCount } = await req.json();
    
    console.log("Generating marketing description for:", courseTitle);
    
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    if (lovableApiKey) {
      try {
        const prompt = `You are a world-class copywriter for online course marketplaces. Write a compelling, premium sales description for this course that will make buyers eager to enroll.

Course Details:
- Title: ${courseTitle}
- Description: ${courseDescription || 'Not provided'}
- Skill Level: ${audienceLevel || 'Intermediate'}
- Category: ${category || 'Personal Development'}
- What students will achieve: ${outcome || 'Master the subject'}
- Number of lessons: ${lessonsCount || 4}

Requirements:
1. Start with an attention-grabbing hook (1 sentence)
2. Explain the transformation/outcome students will experience
3. Highlight what makes this course unique
4. Include 3-4 key benefits with emotional appeal
5. End with urgency or a compelling call to action

Style Guidelines:
- Professional yet approachable tone
- Use power words that evoke emotion
- Keep it between 150-200 words
- No bullet points - use flowing prose
- Make it feel exclusive and premium

Write ONLY the marketing description, no headers or labels.`;

        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.8,
            max_tokens: 500,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const marketingDescription = data.choices?.[0]?.message?.content?.trim();
          
          if (marketingDescription) {
            console.log("Successfully generated AI marketing description");
            return new Response(
              JSON.stringify({ marketing_description: marketingDescription }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
        
        console.warn("AI response not usable, using fallback. Status:", response.status);
      } catch (aiErr) {
        console.warn("AI call failed, using fallback:", aiErr.message);
      }
    }

    // Fallback: generate a quality description locally
    console.log("Using fallback marketing description");
    const fallbackDescription = generateFallbackDescription(
      courseTitle, courseDescription || '', audienceLevel || '', category || '', outcome || '', lessonsCount || 4
    );

    return new Response(
      JSON.stringify({ marketing_description: fallbackDescription }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating marketing description:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
