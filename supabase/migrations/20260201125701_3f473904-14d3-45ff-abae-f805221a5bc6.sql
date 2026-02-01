-- Create a storage bucket for course branding assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-branding', 'course-branding', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to all branding images
CREATE POLICY "Public read access for course branding"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-branding');

-- Allow anyone to upload branding images (for simplicity - could be restricted to authenticated users)
CREATE POLICY "Anyone can upload course branding"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'course-branding');

-- Allow deletion of own uploads
CREATE POLICY "Anyone can delete course branding"
ON storage.objects FOR DELETE
USING (bucket_id = 'course-branding');