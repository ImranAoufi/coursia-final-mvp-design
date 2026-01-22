-- Create table to track course generation progress
CREATE TABLE public.course_generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  progress_percent INTEGER DEFAULT 0,
  current_step TEXT DEFAULT 'Initializing...',
  result_data JSONB,
  error TEXT,
  job_type TEXT DEFAULT 'preview' CHECK (job_type IN ('preview', 'full_course')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.course_generation_jobs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read/insert/update jobs (for now, since auth may not be required)
CREATE POLICY "Anyone can view jobs" ON public.course_generation_jobs FOR SELECT USING (true);
CREATE POLICY "Anyone can create jobs" ON public.course_generation_jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update jobs" ON public.course_generation_jobs FOR UPDATE USING (true);

-- Enable Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.course_generation_jobs;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_job_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_jobs_updated_at
BEFORE UPDATE ON public.course_generation_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_job_updated_at();