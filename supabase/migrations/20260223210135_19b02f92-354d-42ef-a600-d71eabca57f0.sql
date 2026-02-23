
-- Fix store image uploads: add storage policies for store-images bucket
DROP POLICY IF EXISTS "Authenticated users can upload store images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update store images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete store images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view store images" ON storage.objects;

CREATE POLICY "Public can view store images"
ON storage.objects FOR SELECT
USING (bucket_id = 'store-images');

CREATE POLICY "Authenticated users can upload store images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'store-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update store images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'store-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete store images"
ON storage.objects FOR DELETE
USING (bucket_id = 'store-images' AND auth.role() = 'authenticated');

-- Update handle_new_user to send email notification to admins
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _admin RECORD;
  _name TEXT;
BEGIN
  _name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);

  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');
  
  -- Notify all admins about new account (in-app)
  FOR _admin IN SELECT user_id FROM public.user_roles WHERE role = 'admin'
  LOOP
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (_admin.user_id, 'New Account Created 👤', 'A new user has signed up: ' || _name, 'account');
  END LOOP;
  
  -- Send email to admins about new signup
  PERFORM net.http_post(
    url := 'https://aczkjkkiiqrvljlrkccw.supabase.co/functions/v1/send-order-email',
    body := jsonb_build_object('type', 'new_signup', 'user_email', NEW.email, 'user_name', _name),
    headers := jsonb_build_object('Content-Type', 'application/json')
  );
  
  RETURN NEW;
END;
$function$;
