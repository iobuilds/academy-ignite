-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add verified status to registrations table
ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS payment_verified BOOLEAN NOT NULL DEFAULT false;

-- Create a courses table to store course metadata
CREATE TABLE public.courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  duration TEXT NOT NULL,
  age_group TEXT NOT NULL,
  highlights TEXT[] DEFAULT '{}',
  curriculum JSONB DEFAULT '[]',
  schedule JSONB DEFAULT '{}',
  faq JSONB DEFAULT '[]',
  start_date TIMESTAMP WITH TIME ZONE,
  is_upcoming BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Anyone can view courses
CREATE POLICY "Anyone can view courses"
ON public.courses
FOR SELECT
USING (true);

-- Create trigger for updating timestamps on courses
CREATE TRIGGER update_courses_updated_at
BEFORE UPDATE ON public.courses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();