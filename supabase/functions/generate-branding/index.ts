import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface GenerateBrandingRequest {
  course_title: string;
  course_description?: string;
  style?: "modern" | "minimal" | "vibrant" | "professional";
  fallback_backend_url?: string;
}

interface BrandingResponse {
  logo_url: string | null;
  banner_url: string | null;
  source: "lovable_ai" | "fallback_backend" | "error";
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
      style = "modern",
      fallback_backend_url 
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
      console.warn("LOVABLE_API_KEY not configured, trying fallback backend");
      return await tryFallbackBackend(fallback_backend_url, course_title, course_description);
    }

    console.log(`🎨 Generating branding for: "${course_title}"`);

    // Generate logo and banner in parallel
    const [logoResult, bannerResult] = await Promise.allSettled([
      generateLogo(LOVABLE_API_KEY, course_title, course_description, style),
      generateBanner(LOVABLE_API_KEY, course_title, course_description, style),
    ]);

    const logo_url = logoResult.status === "fulfilled" ? logoResult.value : null;
    const banner_url = bannerResult.status === "fulfilled" ? bannerResult.value : null;

    // If both failed, try fallback backend
    if (!logo_url && !banner_url && fallback_backend_url) {
      console.log("Both image generations failed, trying fallback backend");
      return await tryFallbackBackend(fallback_backend_url, course_title, course_description);
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
- Professional color palette (2-3 colors max)
- Clean, modern aesthetic like Apple or Notion branding
- No text in the logo, just an iconic symbol
- White or transparent background
- Ultra high resolution

Create a logo that instantly communicates the essence of this course.`;

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

async function tryFallbackBackend(
  backendUrl: string | undefined, 
  courseTitle: string,
  courseDescription: string
): Promise<Response> {
  if (!backendUrl) {
    return new Response(
      JSON.stringify({
        logo_url: null,
        banner_url: null,
        source: "error",
        error: "No fallback backend configured and primary generation failed",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }

  try {
    console.log(`🔄 Trying fallback backend: ${backendUrl}`);
    
    const response = await fetch(`${backendUrl}/api/generate-branding`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        course_title: courseTitle,
        course_description: courseDescription,
      }),
    });

    if (!response.ok) {
      throw new Error(`Fallback backend error: ${response.status}`);
    }

    const data = await response.json();
    
    return new Response(
      JSON.stringify({
        logo_url: data.logo_url || null,
        banner_url: data.banner_url || null,
        source: "fallback_backend",
      } as BrandingResponse),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Fallback backend failed:", error);
    return new Response(
      JSON.stringify({
        logo_url: null,
        banner_url: null,
        source: "error",
        error: "Both primary and fallback image generation failed",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}
