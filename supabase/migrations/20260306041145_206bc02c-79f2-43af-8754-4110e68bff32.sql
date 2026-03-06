-- Helper to build auth headers for internal edge function calls using service role key from vault
CREATE OR REPLACE FUNCTION public.internal_edge_headers()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer ' || COALESCE(
      (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1),
      ''
    )
  )
$$;

-- Update send_email_on_order_event to pass auth headers
CREATE OR REPLACE FUNCTION public.send_email_on_order_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
    PERFORM net.http_post(
      url := 'https://aczkjkkiiqrvljlrkccw.supabase.co/functions/v1/send-order-email',
      body := jsonb_build_object('type', 'new_order', 'order_id', NEW.id),
      headers := public.internal_edge_headers()
    );
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.status <> NEW.status THEN
    PERFORM net.http_post(
      url := 'https://aczkjkkiiqrvljlrkccw.supabase.co/functions/v1/send-order-email',
      body := jsonb_build_object('type', 'order_update', 'order_id', NEW.id),
      headers := public.internal_edge_headers()
    );
  END IF;
  RETURN NEW;
END;
$function$;

-- Update notify_driver_assignment to pass auth headers
CREATE OR REPLACE FUNCTION public.notify_driver_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.driver_id IS NOT NULL AND (OLD.driver_id IS NULL OR OLD.driver_id <> NEW.driver_id) THEN
    IF OLD.status = NEW.status THEN
      INSERT INTO public.notifications (user_id, title, message, type, order_id)
      VALUES (
        NEW.driver_id,
        'Order Assigned to You! 🚀',
        'You have been assigned a ' || NEW.order_type || ' order — $' || NEW.price || ' GYD. Check your dashboard.',
        'order_update',
        NEW.id
      );
    END IF;
    PERFORM net.http_post(
      url := 'https://aczkjkkiiqrvljlrkccw.supabase.co/functions/v1/send-order-email',
      body := jsonb_build_object('type', 'driver_assigned', 'order_id', NEW.id, 'driver_id', NEW.driver_id),
      headers := public.internal_edge_headers()
    );
  END IF;
  RETURN NEW;
END;
$function$;

-- Update handle_new_user to pass auth headers
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
  FOR _admin IN SELECT user_id FROM public.user_roles WHERE role = 'admin'
  LOOP
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (_admin.user_id, 'New Account Created 👤', 'A new user has signed up: ' || _name, 'account');
  END LOOP;
  PERFORM net.http_post(
    url := 'https://aczkjkkiiqrvljlrkccw.supabase.co/functions/v1/send-order-email',
    body := jsonb_build_object('type', 'new_signup', 'user_email', NEW.email, 'user_name', _name),
    headers := public.internal_edge_headers()
  );
  RETURN NEW;
END;
$function$;

-- Update send_push_on_notification to pass auth headers
CREATE OR REPLACE FUNCTION public.send_push_on_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM net.http_post(
    url := 'https://aczkjkkiiqrvljlrkccw.supabase.co/functions/v1/send-push-notification',
    body := jsonb_build_object(
      'user_id', NEW.user_id,
      'title', NEW.title,
      'message', NEW.message,
      'order_id', NEW.order_id
    ),
    headers := public.internal_edge_headers()
  );
  RETURN NEW;
END;
$function$;

-- Recreate all missing triggers on public tables
DROP TRIGGER IF EXISTS trg_notify_drivers_new_order ON public.orders;
CREATE TRIGGER trg_notify_drivers_new_order
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.notify_drivers_new_order();

DROP TRIGGER IF EXISTS trg_send_email_on_order_insert ON public.orders;
CREATE TRIGGER trg_send_email_on_order_insert
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.send_email_on_order_event();

DROP TRIGGER IF EXISTS trg_notify_order_status_change ON public.orders;
CREATE TRIGGER trg_notify_order_status_change
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.notify_order_status_change();

DROP TRIGGER IF EXISTS trg_notify_driver_assignment ON public.orders;
CREATE TRIGGER trg_notify_driver_assignment
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.notify_driver_assignment();

DROP TRIGGER IF EXISTS trg_send_email_on_order_update ON public.orders;
CREATE TRIGGER trg_send_email_on_order_update
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.send_email_on_order_event();

DROP TRIGGER IF EXISTS trg_auto_generate_invoice ON public.orders;
CREATE TRIGGER trg_auto_generate_invoice
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.auto_generate_invoice();

DROP TRIGGER IF EXISTS trg_award_loyalty_points ON public.orders;
CREATE TRIGGER trg_award_loyalty_points
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.award_loyalty_points();

DROP TRIGGER IF EXISTS trg_credit_referrer ON public.orders;
CREATE TRIGGER trg_credit_referrer
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.credit_referrer_on_first_order();

DROP TRIGGER IF EXISTS trg_send_push_on_notification ON public.notifications;
CREATE TRIGGER trg_send_push_on_notification
  AFTER INSERT ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.send_push_on_notification();

DROP TRIGGER IF EXISTS trg_create_notification_retry ON public.notifications;
CREATE TRIGGER trg_create_notification_retry
  AFTER INSERT ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.create_notification_retry();

DROP TRIGGER IF EXISTS trg_generate_referral_code ON public.profiles;
CREATE TRIGGER trg_generate_referral_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.generate_referral_code();

DROP TRIGGER IF EXISTS trg_update_drivers_updated_at ON public.drivers;
CREATE TRIGGER trg_update_drivers_updated_at
  BEFORE UPDATE ON public.drivers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_update_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_update_orders_updated_at ON public.orders;
CREATE TRIGGER trg_update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();