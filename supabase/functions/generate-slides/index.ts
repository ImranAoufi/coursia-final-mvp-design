// Edge function for slide generation

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SlideContent {
  SlideTitle: string;
  KeyPoints: string[];
  IconDescription: string;
  ColorAccent: string;
}

interface GenerateSlidesRequest {
  lesson_id: string;
  script_text: string;
  title?: string;
  preferred_style?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lesson_id, script_text, title = "", preferred_style = "apple" } = await req.json() as GenerateSlidesRequest;

    if (!script_text || script_text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "No script text provided", slides: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured", slides: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const prompt = `You are a professional slide designer for online courses.
Convert this lesson script into structured slides with:

- Apple-level minimalism
- Whiteboard clean aesthetic  
- Flat icons
- Short titles (max 6 words)
- 3-6 bullet points per slide (each max 10 words)
- Very high clarity
- Use engaging, professional language

Create between 5-10 slides that cover the key points of the script.

Return ONLY valid JSON in this exact format:
{
  "slides": [
    {
      "SlideTitle": "Clear Title Here",
      "KeyPoints": ["Point 1", "Point 2", "Point 3"],
      "IconDescription": "briefcase icon",
      "ColorAccent": "#4A90E2"
    }
  ]
}

Lesson Title: ${title || "Untitled Lesson"}
Script:
${script_text.substring(0, 8000)}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a professional slide designer. Always respond with valid JSON only." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate slides", details: errorText, slides: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || "";
    
    // Parse the JSON from the response
    let slidesData: { slides: SlideContent[] } = { slides: [] };
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*"slides"[\s\S]*\}/);
      if (jsonMatch) {
        slidesData = JSON.parse(jsonMatch[0]);
      } else {
        // Try direct parse
        slidesData = JSON.parse(content);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Generate fallback slides from script
      slidesData = generateFallbackSlides(script_text, title);
    }

    // Ensure we have slides
    if (!slidesData.slides || slidesData.slides.length === 0) {
      slidesData = generateFallbackSlides(script_text, title);
    }

    return new Response(
      JSON.stringify({
        status: "ok",
        lesson_id,
        slides: slidesData.slides,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in generate-slides:", error);
    return new Response(
      JSON.stringify({ error: errorMessage, slides: [] }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

function generateFallbackSlides(scriptText: string, title: string): { slides: SlideContent[] } {
  // Split script into paragraphs and create slides
  const paragraphs = scriptText.split(/\n\n+/).filter(p => p.trim().length > 20);
  const slides: SlideContent[] = [];

  // Title slide
  slides.push({
    SlideTitle: title || "Course Overview",
    KeyPoints: ["Welcome to this lesson", "Let's explore the key concepts", "Ready to learn!"],
    IconDescription: "book icon",
    ColorAccent: "#4A90E2"
  });

  // Content slides from paragraphs
  const colors = ["#4A90E2", "#7C3AED", "#10B981", "#F59E0B", "#EF4444"];
  for (let i = 0; i < Math.min(paragraphs.length, 6); i++) {
    const para = paragraphs[i];
    const sentences = para.split(/[.!?]+/).filter(s => s.trim().length > 10).slice(0, 4);
    
    slides.push({
      SlideTitle: `Key Point ${i + 1}`,
      KeyPoints: sentences.map(s => s.trim().substring(0, 60)),
      IconDescription: "lightbulb icon",
      ColorAccent: colors[i % colors.length]
    });
  }

  // Summary slide
  slides.push({
    SlideTitle: "Summary",
    KeyPoints: ["Review the key concepts", "Practice what you learned", "Ready for the next lesson"],
    IconDescription: "checkmark icon",
    ColorAccent: "#10B981"
  });

  return { slides };
}
