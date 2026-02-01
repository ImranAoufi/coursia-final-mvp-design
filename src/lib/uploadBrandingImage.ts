/**
 * Uploads branding images (from base64 or data URLs) to Supabase Storage
 * and returns permanent public URLs for fast loading.
 */

import { supabase } from "@/integrations/supabase/client";

interface UploadResult {
  url: string | null;
  error: string | null;
}

/**
 * Converts a base64 data URL to a Blob
 */
function dataURLtoBlob(dataURL: string): Blob {
  // Handle both "data:image/png;base64,..." and raw base64
  const parts = dataURL.split(',');
  const mime = parts[0]?.match(/:(.*?);/)?.[1] || 'image/png';
  const base64 = parts.length > 1 ? parts[1] : parts[0];
  
  const binary = atob(base64);
  const array = new Uint8Array(binary.length);
  
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  
  return new Blob([array], { type: mime });
}

/**
 * Checks if a URL is a base64 data URL (which needs to be uploaded)
 */
export function isBase64DataUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.startsWith('data:');
}

/**
 * Uploads a base64 image to Supabase Storage and returns the public URL
 */
export async function uploadBrandingImage(
  dataUrl: string,
  type: 'logo' | 'banner',
  courseId?: string
): Promise<UploadResult> {
  try {
    // If it's already a regular URL (not base64), return it as-is
    if (!isBase64DataUrl(dataUrl)) {
      return { url: dataUrl, error: null };
    }

    // Generate a unique filename
    const id = courseId || crypto.randomUUID();
    const timestamp = Date.now();
    const extension = dataUrl.includes('image/svg') ? 'svg' : 
                     dataUrl.includes('image/png') ? 'png' : 'jpg';
    const filename = `${id}/${type}-${timestamp}.${extension}`;

    // Convert data URL to blob
    const blob = dataURLtoBlob(dataUrl);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('course-branding')
      .upload(filename, blob, {
        contentType: blob.type,
        upsert: true,
      });

    if (error) {
      console.error(`Failed to upload ${type}:`, error);
      return { url: null, error: error.message };
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('course-branding')
      .getPublicUrl(data.path);

    console.log(`✅ Uploaded ${type} to storage:`, urlData.publicUrl);
    
    return { url: urlData.publicUrl, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    console.error(`Upload ${type} exception:`, err);
    return { url: null, error: message };
  }
}

/**
 * Uploads both logo and banner to storage (if they're base64)
 * Returns permanent URLs that load much faster than base64
 */
export async function uploadBrandingToStorage(
  logoUrl: string | null,
  bannerUrl: string | null,
  courseId?: string
): Promise<{ logo_url: string | null; banner_url: string | null }> {
  const [logoResult, bannerResult] = await Promise.all([
    logoUrl ? uploadBrandingImage(logoUrl, 'logo', courseId) : Promise.resolve({ url: null, error: null }),
    bannerUrl ? uploadBrandingImage(bannerUrl, 'banner', courseId) : Promise.resolve({ url: null, error: null }),
  ]);

  return {
    logo_url: logoResult.url || logoUrl,
    banner_url: bannerResult.url || bannerUrl,
  };
}
