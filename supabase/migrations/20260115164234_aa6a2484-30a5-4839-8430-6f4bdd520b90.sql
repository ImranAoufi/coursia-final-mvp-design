-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create workbook_responses table for storing user answers to reflection prompts
CREATE TABLE public.workbook_responses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    course_id TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    prompt_index INTEGER NOT NULL,
    prompt_text TEXT NOT NULL,
    response TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, course_id, lesson_id, prompt_index)
);

-- Enable Row Level Security
ALTER TABLE public.workbook_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own workbook responses" 
ON public.workbook_responses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workbook responses" 
ON public.workbook_responses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workbook responses" 
ON public.workbook_responses 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workbook responses" 
ON public.workbook_responses 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_workbook_responses_updated_at
BEFORE UPDATE ON public.workbook_responses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();