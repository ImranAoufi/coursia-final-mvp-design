import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface GenerateBrandingRequest {
  course_title: string;
  course_description?: string;
  style?: "modern" | "minimal" | "vibrant" | "professional";
}

interface BrandingResponse {
  logo_url: string | null;
  banner_url: string | null;
  source: "lovable_ai" | "error";
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { 
      course_title, 
      course_description = "", 
      style = "modern"
    } = await req.json() as GenerateBrandingRequest;

    if (!course_title || course_title.trim().length === 0) {
      return new Response(
        JSON.stringify({ 
          error: "No course title provided", 
          logo_url: null, 
          banner_url: null,
          source: "error" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({
          logo_url: null,
          banner_url: null,
          source: "error",
          error: "AI generation not configured",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log(`🎨 Generating branding for: "${course_title}"`);

    // Generate logo and banner in parallel
    const [logoResult, bannerResult] = await Promise.allSettled([
      generateLogo(LOVABLE_API_KEY, course_title, course_description, style),
      generateBanner(LOVABLE_API_KEY, course_title, course_description, style),
    ]);

    const logo_url = logoResult.status === "fulfilled" ? logoResult.value : null;
    const banner_url = bannerResult.status === "fulfilled" ? bannerResult.value : null;

    // If both failed, return error with specific reason
    if (!logo_url && !banner_url) {
      const logoError = logoResult.status === "rejected" ? logoResult.reason?.message : null;
      const bannerError = bannerResult.status === "rejected" ? bannerResult.reason?.message : null;
      const errorMessage = logoError || bannerError || "Failed to generate branding images";
      
      console.error("Both image generations failed:", errorMessage);
      return new Response(
        JSON.stringify({
          logo_url: null,
          banner_url: null,
          source: "error",
          error: errorMessage,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Log any errors
    if (logoResult.status === "rejected") {
      console.error("Logo generation failed:", logoResult.reason);
    }
    if (bannerResult.status === "rejected") {
      console.error("Banner generation failed:", bannerResult.reason);
    }

    console.log(`✅ Branding generated - Logo: ${!!logo_url}, Banner: ${!!banner_url}`);

    return new Response(
      JSON.stringify({
        logo_url,
        banner_url,
        source: "lovable_ai",
      } as BrandingResponse),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in generate-branding:", error);
    return new Response(
      JSON.stringify({ 
        error: errorMessage, 
        logo_url: null, 
        banner_url: null,
        source: "error" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

async function generateLogo(
  apiKey: string, 
  courseTitle: string, 
  courseDescription: string,
  style: string
): Promise<string | null> {
  // Extract key topic keywords for color and theme matching
  const topicKeywords = extractTopicKeywords(courseTitle, courseDescription);
  const colorPalette = getTopicColorPalette(topicKeywords);
  
  const styleGuides: Record<string, string> = {
    modern: "clean geometric shapes, sophisticated gradients, tech-forward aesthetic",
    minimal: "single powerful symbol, negative space mastery, Scandinavian elegance",
    vibrant: "bold contrasting colors, dynamic energy, attention-grabbing impact",
    professional: "timeless elegance, corporate sophistication, trust-building design",
  };

  const prompt = `Design a COURSE BADGE LOGO for an online course titled "${courseTitle}".

CRITICAL: This is educational course branding, NOT a generic app icon.

Topic: ${courseDescription || courseTitle}
Visual Style: ${styleGuides[style] || styleGuides.modern}
Color Direction: ${colorPalette.description}

DESIGN REQUIREMENTS:
1. SHAPE: Circular or rounded badge format (like university crests, Masterclass badges, or certification emblems)
2. ICON: A single, topic-specific symbol that IMMEDIATELY communicates "${topicKeywords.primary}" - viewers should know the subject in 1 second
3. COLORS: Use ${colorPalette.primary} as the dominant color with ${colorPalette.accent} accents - these colors psychologically represent ${topicKeywords.primary}
4. PREMIUM FEEL: Subtle inner glow, refined shadows, metallic or glass effects that suggest "premium education"
5. PSYCHOLOGY: The design should evoke feelings of expertise, transformation, and exclusive knowledge

AVOID:
- Generic abstract shapes
- Overly complex illustrations
- Text or letters
- Stock icon look
- Flat, lifeless colors

REFERENCE STYLE: Think Masterclass course thumbnails meets university seal - prestigious, topic-clear, aspirational.

Create a 1:1 square image. Ultra high resolution.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-image",
      messages: [{ role: "user", content: prompt }],
      modalities: ["image", "text"],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Logo generation API error:", response.status, errorText);
    
    if (response.status === 429) {
      throw new Error("Rate limit exceeded - please try again later");
    }
    if (response.status === 402) {
      throw new Error("AI credits depleted - please add funds to your workspace");
    }
    throw new Error(`Logo API error: ${response.status}`);
  }

  const data = await response.json();
  const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  
  if (!imageUrl) {
    console.warn("No image URL in logo response");
    return null;
  }

  return imageUrl;
}

async function generateBanner(
  apiKey: string, 
  courseTitle: string, 
  courseDescription: string,
  style: string
): Promise<string | null> {
  const topicKeywords = extractTopicKeywords(courseTitle, courseDescription);
  const colorPalette = getTopicColorPalette(topicKeywords);
  
  const styleGuides: Record<string, string> = {
    modern: "cinematic depth, layered lighting, futuristic undertones",
    minimal: "elegant negative space, single focal element, breathing room",
    vibrant: "rich saturated gradients, dynamic energy, bold contrast",
    professional: "executive boardroom quality, refined textures, trustworthy gravitas",
  };

  const prompt = `Create a COURSE HERO BANNER for an online course: "${courseTitle}".

CRITICAL: This is a course sales banner designed to CONVERT viewers into buyers.

Topic: ${courseDescription || courseTitle}
Visual Style: ${styleGuides[style] || styleGuides.modern}
Color Direction: ${colorPalette.description}

DESIGN REQUIREMENTS:
1. ASPECT RATIO: Wide 16:9 cinematic format
2. COMPOSITION: Visual elements suggesting "${topicKeywords.primary}" - tools, environments, or abstract representations of the skill
3. COLORS: Rich ${colorPalette.primary} tones with ${colorPalette.accent} highlights - psychologically matched to ${topicKeywords.primary}
4. DEPTH: Multiple layers creating 3D depth - foreground blur, sharp mid-ground, atmospheric background
5. LIGHTING: Dramatic, professional lighting that suggests "premium production value"
6. MOOD: Aspirational, transformative - the viewer should feel "I want to become this"

PSYCHOLOGICAL TRIGGERS:
- Sense of possibility and achievement
- Professional mastery and expertise
- Exclusive, premium knowledge
- Transformation and growth

TECHNICAL:
- Dark gradient on left/bottom for text overlay
- NO text, words, or letters in the image
- Cinematic color grading (like Netflix/Masterclass thumbnails)
- Ultra high resolution

AVOID:
- Generic stock photo feel
- Cluttered or busy compositions
- Flat, lifeless lighting
- Obvious AI artifacts

Create an image that makes viewers think "I NEED this course."`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-image",
      messages: [{ role: "user", content: prompt }],
      modalities: ["image", "text"],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Banner generation API error:", response.status, errorText);
    
    if (response.status === 429) {
      throw new Error("Rate limit exceeded - please try again later");
    }
    if (response.status === 402) {
      throw new Error("AI credits depleted - please add funds to your workspace");
    }
    throw new Error(`Banner API error: ${response.status}`);
  }

  const data = await response.json();
  const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  
  if (!imageUrl) {
    console.warn("No image URL in banner response");
    return null;
  }

  return imageUrl;
}

// Helper functions for topic-specific color and keyword extraction
function extractTopicKeywords(title: string, description: string): { primary: string; secondary: string[] } {
  const text = `${title} ${description}`.toLowerCase();
  
  const topicMap: Record<string, { primary: string; secondary: string[] }> = {
    // Tech & Programming
    "javascript": { primary: "JavaScript programming", secondary: ["code", "web", "development"] },
    "python": { primary: "Python programming", secondary: ["code", "data", "automation"] },
    "react": { primary: "React development", secondary: ["frontend", "web", "components"] },
    "ai": { primary: "artificial intelligence", secondary: ["machine learning", "automation", "future"] },
    "machine learning": { primary: "machine learning", secondary: ["AI", "data", "algorithms"] },
    "data": { primary: "data science", secondary: ["analytics", "insights", "visualization"] },
    "web": { primary: "web development", secondary: ["internet", "coding", "digital"] },
    "coding": { primary: "programming", secondary: ["software", "development", "tech"] },
    "programming": { primary: "programming", secondary: ["code", "software", "logic"] },
    
    // Business
    "marketing": { primary: "marketing", secondary: ["growth", "audience", "brand"] },
    "business": { primary: "business strategy", secondary: ["entrepreneurship", "growth", "success"] },
    "finance": { primary: "finance", secondary: ["money", "investing", "wealth"] },
    "investing": { primary: "investing", secondary: ["wealth", "stocks", "growth"] },
    "entrepreneur": { primary: "entrepreneurship", secondary: ["startup", "business", "innovation"] },
    "leadership": { primary: "leadership", secondary: ["management", "influence", "team"] },
    
    // Creative
    "design": { primary: "design", secondary: ["creativity", "visual", "aesthetic"] },
    "photography": { primary: "photography", secondary: ["visual", "camera", "art"] },
    "video": { primary: "video production", secondary: ["film", "editing", "content"] },
    "music": { primary: "music", secondary: ["audio", "sound", "creativity"] },
    "writing": { primary: "writing", secondary: ["content", "storytelling", "communication"] },
    "art": { primary: "art", secondary: ["creativity", "expression", "visual"] },
    
    // Health & Wellness
    "fitness": { primary: "fitness", secondary: ["health", "strength", "body"] },
    "health": { primary: "health", secondary: ["wellness", "vitality", "life"] },
    "yoga": { primary: "yoga", secondary: ["mindfulness", "flexibility", "peace"] },
    "meditation": { primary: "meditation", secondary: ["mindfulness", "calm", "focus"] },
    "nutrition": { primary: "nutrition", secondary: ["diet", "health", "energy"] },
    
    // Personal Development
    "productivity": { primary: "productivity", secondary: ["efficiency", "time", "success"] },
    "psychology": { primary: "psychology", secondary: ["mind", "behavior", "understanding"] },
    "communication": { primary: "communication", secondary: ["speaking", "influence", "connection"] },
    "language": { primary: "language learning", secondary: ["culture", "communication", "fluency"] },
  };
  
  for (const [keyword, topics] of Object.entries(topicMap)) {
    if (text.includes(keyword)) {
      return topics;
    }
  }
  
  // Default based on first significant word
  const words = title.split(/\s+/).filter(w => w.length > 3);
  return { primary: words[0] || "knowledge", secondary: ["learning", "mastery", "skills"] };
}

function getTopicColorPalette(keywords: { primary: string; secondary: string[] }): { primary: string; accent: string; description: string } {
  const topic = keywords.primary.toLowerCase();
  
  const palettes: Record<string, { primary: string; accent: string; description: string }> = {
    // Tech - Blues and Cyans
    "javascript": { primary: "golden yellow (#F7DF1E)", accent: "deep charcoal", description: "energetic yellow with dark contrast - the iconic JS colors" },
    "python": { primary: "royal blue (#3776AB)", accent: "sunny yellow", description: "Python's signature blue-yellow combination" },
    "react": { primary: "cyan (#61DAFB)", accent: "dark navy", description: "React's iconic cyan on dark - modern and tech-forward" },
    "programming": { primary: "electric blue", accent: "neon green", description: "matrix-inspired tech colors suggesting code and innovation" },
    "artificial intelligence": { primary: "deep purple", accent: "electric cyan", description: "futuristic AI colors suggesting intelligence and innovation" },
    "machine learning": { primary: "violet purple", accent: "hot pink", description: "neural network inspired gradients" },
    "data science": { primary: "teal green", accent: "electric blue", description: "analytical colors suggesting insights and discovery" },
    "web development": { primary: "coral orange", accent: "purple", description: "creative web colors suggesting modern digital craft" },
    
    // Business - Golds and Navy
    "marketing": { primary: "hot pink", accent: "electric orange", description: "attention-grabbing marketing colors that pop" },
    "business strategy": { primary: "navy blue", accent: "gold", description: "executive colors suggesting authority and success" },
    "finance": { primary: "forest green", accent: "gold", description: "money and wealth colors suggesting prosperity" },
    "investing": { primary: "emerald green", accent: "gold", description: "growth and wealth colors" },
    "entrepreneurship": { primary: "sunset orange", accent: "deep red", description: "bold startup colors suggesting energy and risk-taking" },
    "leadership": { primary: "royal purple", accent: "gold", description: "colors of authority, wisdom, and influence" },
    
    // Creative - Vibrant and Expressive
    "design": { primary: "magenta pink", accent: "electric purple", description: "creative, expressive designer colors" },
    "photography": { primary: "warm amber", accent: "cool shadow blue", description: "golden hour lighting colors" },
    "video production": { primary: "cinematic red", accent: "film noir black", description: "Hollywood production colors" },
    "music": { primary: "deep purple", accent: "electric pink", description: "creative audio colors suggesting rhythm and expression" },
    "writing": { primary: "ink blue", accent: "parchment cream", description: "literary colors suggesting sophistication" },
    "art": { primary: "vibrant red", accent: "cobalt blue", description: "bold artistic colors suggesting creativity" },
    
    // Health - Greens and Calm Colors
    "fitness": { primary: "energetic red", accent: "power orange", description: "high-energy colors suggesting strength and vitality" },
    "health": { primary: "fresh green", accent: "sky blue", description: "vitality and wellness colors" },
    "yoga": { primary: "lavender purple", accent: "soft peach", description: "calming, spiritual colors" },
    "meditation": { primary: "serene indigo", accent: "soft gold", description: "peaceful, transcendent colors" },
    "nutrition": { primary: "fresh lime green", accent: "berry purple", description: "healthy, natural food colors" },
    
    // Personal Development - Warm and Inspiring
    "productivity": { primary: "electric blue", accent: "energetic orange", description: "focused, high-performance colors" },
    "psychology": { primary: "deep teal", accent: "warm coral", description: "colors of understanding and empathy" },
    "communication": { primary: "confident blue", accent: "warm yellow", description: "approachable yet authoritative" },
    "language learning": { primary: "world blue", accent: "cultural gold", description: "global, cultural connection colors" },
  };
  
  return palettes[topic] || { 
    primary: "sophisticated indigo", 
    accent: "warm gold", 
    description: "premium, luxurious colors suggesting expertise and value" 
  };
}
