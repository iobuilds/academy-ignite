-- Add image columns to courses table
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS card_image_url TEXT,
ADD COLUMN IF NOT EXISTS hero_image_url TEXT;

-- Create storage bucket for course images
INSERT INTO storage.buckets (id, name, public)
VALUES ('course_images', 'course_images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view course images (public bucket)
CREATE POLICY "Anyone can view course images"
ON storage.objects FOR SELECT
USING (bucket_id = 'course_images');

-- Allow admins to upload course images
CREATE POLICY "Admins can upload course images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'course_images' 
  AND EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Allow admins to update course images
CREATE POLICY "Admins can update course images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'course_images' 
  AND EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Allow admins to delete course images
CREATE POLICY "Admins can delete course images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'course_images' 
  AND EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);