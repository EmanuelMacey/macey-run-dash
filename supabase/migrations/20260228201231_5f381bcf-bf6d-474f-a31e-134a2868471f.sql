
-- Add avatar_url to drivers table
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS avatar_url text;

-- Create storage bucket for driver avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('driver-avatars', 'driver-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for driver avatars
CREATE POLICY "Anyone can view driver avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'driver-avatars');

CREATE POLICY "Drivers can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'driver-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Drivers can update own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'driver-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Drivers can delete own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'driver-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
