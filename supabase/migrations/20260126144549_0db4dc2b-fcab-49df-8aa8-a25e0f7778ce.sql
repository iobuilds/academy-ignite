-- Add mobile_number to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mobile_number text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_mobile_verified boolean DEFAULT false;

-- Create OTP codes table
CREATE TABLE public.otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile_number text NOT NULL,
  code text NOT NULL,
  purpose text NOT NULL DEFAULT 'registration', -- 'registration' or 'password_reset'
  expires_at timestamp with time zone NOT NULL,
  verified boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on otp_codes
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Anyone can insert OTP (for registration before auth)
CREATE POLICY "Anyone can insert OTP codes" ON public.otp_codes
FOR INSERT WITH CHECK (true);

-- Anyone can select their own OTP by mobile number
CREATE POLICY "Anyone can view OTP by mobile" ON public.otp_codes
FOR SELECT USING (true);

-- Anyone can update OTP verification status
CREATE POLICY "Anyone can update OTP" ON public.otp_codes
FOR UPDATE USING (true);

-- Create app_settings table for admin configuration
CREATE TABLE public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on app_settings
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings
CREATE POLICY "Anyone can read settings" ON public.app_settings
FOR SELECT USING (true);

-- Only admins can insert/update/delete settings
CREATE POLICY "Admins can insert settings" ON public.app_settings
FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update settings" ON public.app_settings
FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete settings" ON public.app_settings
FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Insert default admin number setting
INSERT INTO public.app_settings (key, value) VALUES ('admin_mobile_number', '') ON CONFLICT (key) DO NOTHING;

-- Create trigger for updated_at on app_settings
CREATE TRIGGER update_app_settings_updated_at
BEFORE UPDATE ON public.app_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to clean expired OTPs
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.otp_codes WHERE expires_at < now();
END;
$$;