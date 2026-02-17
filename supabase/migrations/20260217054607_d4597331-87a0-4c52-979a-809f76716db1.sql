
-- Add sequential order number
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START WITH 1;

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_number integer;

-- Set default for new orders
ALTER TABLE public.orders ALTER COLUMN order_number SET DEFAULT nextval('public.order_number_seq');

-- Backfill existing orders
UPDATE public.orders SET order_number = nextval('public.order_number_seq') WHERE order_number IS NULL;

-- Create storage bucket for store images
INSERT INTO storage.buckets (id, name, public) VALUES ('store-images', 'store-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for errand attachments  
INSERT INTO storage.buckets (id, name, public) VALUES ('errand-attachments', 'errand-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for store images
CREATE POLICY "Anyone can view store images" ON storage.objects FOR SELECT USING (bucket_id = 'store-images');
CREATE POLICY "Admins can upload store images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'store-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update store images" ON storage.objects FOR UPDATE USING (bucket_id = 'store-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete store images" ON storage.objects FOR DELETE USING (bucket_id = 'store-images' AND public.has_role(auth.uid(), 'admin'));

-- Storage policies for errand attachments
CREATE POLICY "Users can view own errand attachments" ON storage.objects FOR SELECT USING (bucket_id = 'errand-attachments');
CREATE POLICY "Authenticated can upload errand attachments" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'errand-attachments' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete own errand attachments" ON storage.objects FOR DELETE USING (bucket_id = 'errand-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
