import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BrandingResult {
  logo_url: string | null;
  banner_url: string | null;
  source: "lovable_ai" | "fallback_backend" | "error";
  error?: string;
}

interface GenerateBrandingOptions {
  course_title: string;
  course_description?: string;
  style?: "modern" | "minimal" | "vibrant" | "professional";
  fallback_backend_url?: string;
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
          fallback_backend_url: options.fallback_backend_url,
        },
      });

      if (error) {
        console.error("Branding generation error:", error);
        toast.error("Failed to generate branding", {
          description: error.message || "Please try again",
        });
        return {
          logo_url: null,
          banner_url: null,
          source: "error",
          error: error.message,
        };
      }

      const result = data as BrandingResult;

      if (result.source === "error") {
        toast.error("Branding generation failed", {
          description: result.error || "Please try again later",
        });
      } else if (result.logo_url || result.banner_url) {
        const parts = [];
        if (result.logo_url) parts.push("logo");
        if (result.banner_url) parts.push("banner");
        
        toast.success(`Generated ${parts.join(" & ")}`, {
          description: `Using ${result.source === "lovable_ai" ? "AI generation" : "fallback backend"}`,
        });
      }

      return result;
    } catch (err) {
      console.error("Branding generation exception:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast.error("Failed to generate branding", { description: errorMessage });
      
      return {
        logo_url: null,
        banner_url: null,
        source: "error",
        error: errorMessage,
      };
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
