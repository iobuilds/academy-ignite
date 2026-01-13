-- Add registration_open field to courses
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS registration_open boolean NOT NULL DEFAULT true;

-- Add payment_slip_url to registrations for bank transfer slip uploads
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS payment_slip_url text;

-- Create payment_slips storage bucket for bank transfer receipts
INSERT INTO storage.buckets (id, name, public) VALUES ('payment_slips', 'payment_slips', false) 
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload payment slips
CREATE POLICY "Users can upload their own payment slips"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'payment_slips' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow admins to view all payment slips
CREATE POLICY "Admins can view all payment slips"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment_slips' AND EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Allow users to view their own payment slips
CREATE POLICY "Users can view their own payment slips"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment_slips' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Update existing courses to have registration_open = true
UPDATE public.courses SET registration_open = true WHERE registration_open IS NULL;

-- Allow admins to update courses (for toggling registration)
CREATE POLICY "Admins can update courses"
ON public.courses FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Allow admins to update registrations
CREATE POLICY "Admins can update registrations"
ON public.registrations FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));