-- Create a table for course registrations
CREATE TABLE public.registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  course TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (for registration form)
CREATE POLICY "Anyone can submit registration" 
ON public.registrations 
FOR INSERT 
WITH CHECK (true);

-- Only allow reading for authenticated admin users (future use)
CREATE POLICY "Authenticated users can view registrations" 
ON public.registrations 
FOR SELECT 
TO authenticated
USING (true);