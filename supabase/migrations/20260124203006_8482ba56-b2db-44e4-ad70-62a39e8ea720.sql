-- Create table to store generated slides for lessons
CREATE TABLE public.lesson_slides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  slides JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Enable Row Level Security
ALTER TABLE public.lesson_slides ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own slides" 
ON public.lesson_slides 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own slides" 
ON public.lesson_slides 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own slides" 
ON public.lesson_slides 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own slides" 
ON public.lesson_slides 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_lesson_slides_updated_at
BEFORE UPDATE ON public.lesson_slides
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();