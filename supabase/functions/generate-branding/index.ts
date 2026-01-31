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
  const styleGuides: Record<string, string> = {
    modern: "sleek, contemporary design with clean lines and subtle gradients",
    minimal: "ultra-minimalistic, single symbol or letter mark, lots of white space",
    vibrant: "bold colors, dynamic shapes, energetic and eye-catching",
    professional: "corporate elegance, refined typography, trustworthy appearance",
  };

  const prompt = `Create a premium, professional course logo for "${courseTitle}".
  
Course topic: ${courseDescription || courseTitle}
Style: ${styleGuides[style] || styleGuides.modern}

Requirements:
- Square aspect ratio (1:1)
- High-quality, polished design suitable for educational content
- Simple, memorable iconography that represents the course topic
- Rich, sophisticated color palette that matches the course subject matter
- Colors should feel premium and intentional (think luxury brands, high-end apps)
- Clean, modern aesthetic like Apple, Notion, or Masterclass branding
- No text in the logo, just an iconic symbol
- Transparent or complementary background that enhances the design
- Ultra high resolution

Create a stunning logo that instantly communicates expertise and premium quality.`;

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
  const styleGuides: Record<string, string> = {
    modern: "sleek gradient backgrounds, abstract geometric shapes, contemporary feel",
    minimal: "clean solid colors, subtle textures, elegant simplicity",
    vibrant: "rich color gradients, dynamic visual flow, engaging atmosphere",
    professional: "sophisticated color palette, refined textures, business-quality aesthetic",
  };

  const prompt = `Create a premium, wide course banner/hero image for "${courseTitle}".

Course topic: ${courseDescription || courseTitle}
Style: ${styleGuides[style] || styleGuides.modern}

Requirements:
- Wide 16:9 aspect ratio (like a YouTube thumbnail or course hero)
- High-quality, cinematic composition
- Abstract or thematic background that represents the course topic
- Rich depth and visual interest
- Professional color palette that conveys expertise
- Suitable for overlaying text on the left or bottom portion
- Dark gradient or subtle vignette on edges for text legibility
- No text or words in the image
- Premium aesthetic like Masterclass or Coursera banners
- Ultra high resolution

Create a stunning banner that makes people want to enroll in this course.`;

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
