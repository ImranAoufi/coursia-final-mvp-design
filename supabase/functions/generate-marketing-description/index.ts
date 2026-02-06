import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { courseTitle, courseDescription, audienceLevel, category, outcome, lessonsCount } = await req.json();
    
    console.log("Generating marketing description for:", courseTitle);
    
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

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

    const response = await fetch('https://api.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const marketingDescription = data.choices?.[0]?.message?.content?.trim();
    
    if (!marketingDescription) {
      throw new Error('No content generated');
    }

    console.log("Successfully generated marketing description");

    return new Response(
      JSON.stringify({ marketing_description: marketingDescription }),
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
