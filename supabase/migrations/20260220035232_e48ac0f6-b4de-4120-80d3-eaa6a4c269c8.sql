
-- Testimonials table for admin management
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  rating INTEGER NOT NULL DEFAULT 5,
  text TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active testimonials" ON public.testimonials FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage testimonials" ON public.testimonials FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON public.testimonials
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with default testimonials
INSERT INTO public.testimonials (name, location, rating, text, display_order) VALUES
('Shania R.', 'Georgetown', 5, 'MaceyRunners delivered my lunch in under 15 minutes! The runner was super friendly and kept me updated the whole time.', 1),
('Kevin M.', 'East Coast Demerara', 5, 'I use them for pharmacy runs every week. So convenient — I don''t have to leave the house anymore. Highly recommend!', 2),
('Priya D.', 'Kitty, Georgetown', 4, 'Great service for grocery shopping. They picked up everything on my list and delivered it fresh. Will definitely use again.', 3),
('Marcus T.', 'Berbice', 5, 'Needed important documents couriered across town urgently. MaceyRunners came through fast — lifesaver!', 4);

-- Invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id),
  customer_id UUID NOT NULL,
  invoice_number SERIAL,
  amount INTEGER NOT NULL DEFAULT 0,
  tax_amount INTEGER NOT NULL DEFAULT 0,
  total_amount INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'generated',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own invoices" ON public.invoices FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "Admins can manage all invoices" ON public.invoices FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Notification retry tracking
CREATE TABLE public.notification_retries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id UUID NOT NULL,
  user_id UUID NOT NULL,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 5,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_retries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own retries" ON public.notification_retries FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own retries" ON public.notification_retries FOR UPDATE USING (user_id = auth.uid());

-- Update handle_new_user to notify admins of new accounts
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
  
  -- Notify all admins about new account
  FOR _admin IN SELECT user_id FROM public.user_roles WHERE role = 'admin'
  LOOP
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (_admin.user_id, 'New Account Created 👤', 'A new user has signed up: ' || _name, 'account');
  END LOOP;
  
  RETURN NEW;
END;
$function$;

-- Auto-generate invoice when order is delivered
CREATE OR REPLACE FUNCTION public.auto_generate_invoice()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status = 'delivered' AND OLD.status <> 'delivered' THEN
    INSERT INTO public.invoices (order_id, customer_id, amount, tax_amount, total_amount, status)
    VALUES (NEW.id, NEW.customer_id, NEW.price, 0, NEW.price, 'generated');
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER auto_generate_invoice_on_delivery
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.auto_generate_invoice();
