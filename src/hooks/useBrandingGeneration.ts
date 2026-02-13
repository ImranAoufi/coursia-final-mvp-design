import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateFallbackBranding } from "@/lib/generateFallbackBranding";
import { uploadBrandingToStorage, isBase64DataUrl } from "@/lib/uploadBrandingImage";

interface BrandingResult {
  logo_url: string | null;
  banner_url: string | null;
  source: "lovable_ai" | "fallback" | "error";
  error?: string;
}

interface GenerateBrandingOptions {
  course_title: string;
  course_description?: string;
  style?: "modern" | "minimal" | "vibrant" | "professional";
}

export function useBrandingGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);

  const generateBranding = useCallback(async (options: GenerateBrandingOptions): Promise<BrandingResult> => {
    setIsGenerating(true);
    setProgress("Generating premium logo & banner...");

    try {
      const { data, error } = await supabase.functions.invoke("generate-branding", {
        body: {
          course_title: options.course_title,
          course_description: options.course_description || "",
          style: options.style || "modern",
        },
      });

      if (error) {
        console.error("Branding generation error:", error);
        // Fall back to SVG gradient branding
        return useFallbackBranding(options.course_title, options.course_description);
      }

      const result = data as BrandingResult;

      if (result.source === "error" || (!result.logo_url && !result.banner_url)) {
        console.warn("AI branding failed, using fallback:", result.error);
        // Fall back to SVG gradient branding
        return useFallbackBranding(options.course_title, options.course_description);
      }

      // Success with AI - upload to storage for fast loading
      let finalResult = result;
      
      // If images are base64, upload them to storage
      if (isBase64DataUrl(result.logo_url) || isBase64DataUrl(result.banner_url)) {
        setProgress("Saving branding to storage...");
        const stored = await uploadBrandingToStorage(result.logo_url, result.banner_url);
        finalResult = {
          ...result,
          logo_url: stored.logo_url,
          banner_url: stored.banner_url,
        };
      }
      
      const parts = [];
      if (finalResult.logo_url) parts.push("logo");
      if (finalResult.banner_url) parts.push("banner");
      
      toast.success(`Generated ${parts.join(" & ")}`, {
        description: "Using AI generation",
      });

      return finalResult;
    } catch (err) {
      console.error("Branding generation exception:", err);
      // Fall back to SVG gradient branding
      return useFallbackBranding(options.course_title, options.course_description);
    } finally {
      setIsGenerating(false);
      setProgress(null);
    }
  }, []);

  return {
    generateBranding,
    isGenerating,
    progress,
  };
}

async function useFallbackBranding(courseTitle: string, courseDescription?: string): Promise<BrandingResult> {
  try {
    const fallback = generateFallbackBranding(courseTitle, courseDescription || "");
    
    // Try to upload SVG fallbacks to storage, but use data URLs directly if upload fails
    let logoUrl = fallback.logo_url;
    let bannerUrl = fallback.banner_url;
    
    try {
      const stored = await uploadBrandingToStorage(fallback.logo_url, fallback.banner_url);
      logoUrl = stored.logo_url || fallback.logo_url;
      bannerUrl = stored.banner_url || fallback.banner_url;
    } catch (uploadErr) {
      console.warn("Storage upload failed, using data URLs directly:", uploadErr);
      // Keep the SVG data URLs as-is - they work fine inline
    }
    
    toast.success("Generated branding", {
      description: "Using themed gradient design",
    });
    
    return {
      logo_url: logoUrl,
      banner_url: bannerUrl,
      source: "fallback",
    };
  } catch (fallbackErr) {
    console.error("Fallback branding also failed:", fallbackErr);
    toast.error("Failed to generate branding");
    return {
      logo_url: null,
      banner_url: null,
      source: "error",
      error: "Could not generate branding",
    };
  }
}
