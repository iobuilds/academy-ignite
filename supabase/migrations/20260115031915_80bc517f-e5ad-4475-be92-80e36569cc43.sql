-- Add INSERT policy for admins on courses table
CREATE POLICY "Admins can insert courses"
ON public.courses
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid()
  AND user_roles.role = 'admin'
));

-- Add DELETE policy for admins on courses table
CREATE POLICY "Admins can delete courses"
ON public.courses
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid()
  AND user_roles.role = 'admin'
));