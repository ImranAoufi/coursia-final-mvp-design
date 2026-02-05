-- Create courses table to persist all course data
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  -- Core course data
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Personal Development',
  
  -- Wizard data
  outcome TEXT,
  target_audience TEXT,
  audience_level TEXT DEFAULT 'Intermediate',
  course_size TEXT DEFAULT 'standard',
  materials TEXT,
  links TEXT,
  
  -- Branding
  logo_url TEXT,
  banner_url TEXT,
  color_palette JSONB,
  
  -- Marketing
  marketing_hook TEXT,
  custom_price DECIMAL(10,2) DEFAULT 49.00,
  
  -- Course content
  lessons JSONB,
  
  -- Status
  status TEXT DEFAULT 'draft',
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Users can view their own courses
CREATE POLICY "Users can view their own courses"
ON public.courses FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own courses
CREATE POLICY "Users can create their own courses"
ON public.courses FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own courses
CREATE POLICY "Users can update their own courses"
ON public.courses FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own courses
CREATE POLICY "Users can delete their own courses"
ON public.courses FOR DELETE
USING (auth.uid() = user_id);

-- Published courses are publicly viewable (for marketplace)
CREATE POLICY "Published courses are publicly viewable"
ON public.courses FOR SELECT
USING (status = 'published');

-- Trigger for updated_at
CREATE TRIGGER update_courses_updated_at
BEFORE UPDATE ON public.courses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();