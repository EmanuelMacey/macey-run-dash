
-- Trigger to send email notifications on new orders and status changes
CREATE OR REPLACE FUNCTION public.send_email_on_order_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- New order
  IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
    PERFORM net.http_post(
      url := 'https://aczkjkkiiqrvljlrkccw.supabase.co/functions/v1/send-order-email',
      body := jsonb_build_object('type', 'new_order', 'order_id', NEW.id),
      headers := jsonb_build_object('Content-Type', 'application/json')
    );
  END IF;

  -- Status change
  IF TG_OP = 'UPDATE' AND OLD.status <> NEW.status THEN
    PERFORM net.http_post(
      url := 'https://aczkjkkiiqrvljlrkccw.supabase.co/functions/v1/send-order-email',
      body := jsonb_build_object('type', 'order_update', 'order_id', NEW.id),
      headers := jsonb_build_object('Content-Type', 'application/json')
    );
  END IF;

  RETURN NEW;
END;
$function$;

CREATE TRIGGER send_email_on_order_event
AFTER INSERT OR UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.send_email_on_order_event();

-- Trigger to create notification retry records for important notifications
CREATE OR REPLACE FUNCTION public.create_notification_retry()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only retry for order-related notifications
  IF NEW.type IN ('new_order', 'order_update') THEN
    INSERT INTO public.notification_retries (notification_id, user_id, retry_count, max_retries, next_retry_at)
    VALUES (NEW.id, NEW.user_id, 0, 5, now() + interval '2 minutes');
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER create_notification_retry_on_insert
AFTER INSERT ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.create_notification_retry();
