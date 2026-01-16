-- Add preview_video_url column to courses table
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS preview_video_url TEXT;

-- Create storage bucket for course videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('course_videos', 'course_videos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for course_videos bucket
-- Allow public read access
CREATE POLICY "Course videos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'course_videos');

-- Allow admin users to upload videos
CREATE POLICY "Admins can upload course videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'course_videos' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Allow admin users to update videos
CREATE POLICY "Admins can update course videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'course_videos' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Allow admin users to delete videos
CREATE POLICY "Admins can delete course videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'course_videos' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);