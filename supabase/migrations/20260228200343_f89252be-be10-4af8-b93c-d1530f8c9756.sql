
-- Add image_url column to promotional_banners
ALTER TABLE public.promotional_banners ADD COLUMN IF NOT EXISTS image_url text;

-- Create storage bucket for banner images
INSERT INTO storage.buckets (id, name, public) VALUES ('banner-images', 'banner-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload banner images
CREATE POLICY "Admins can upload banner images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'banner-images' AND auth.role() = 'authenticated');

-- Allow public read access
CREATE POLICY "Banner images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'banner-images');

-- Allow authenticated users to delete banner images
CREATE POLICY "Admins can delete banner images"
ON storage.objects FOR DELETE
USING (bucket_id = 'banner-images' AND auth.role() = 'authenticated');
