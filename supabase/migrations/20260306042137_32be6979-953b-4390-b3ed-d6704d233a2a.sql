-- The old permissive policies were dropped and admin policies already exist.
-- Let's verify by dropping and recreating to ensure correct definition.
DROP POLICY IF EXISTS "Admins can upload store images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update store images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete store images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload banner images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update banner images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete banner images" ON storage.objects;

CREATE POLICY "Admins can upload store images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'store-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update store images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'store-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete store images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'store-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can upload banner images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'banner-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update banner images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'banner-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete banner images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'banner-images' AND public.has_role(auth.uid(), 'admin'));