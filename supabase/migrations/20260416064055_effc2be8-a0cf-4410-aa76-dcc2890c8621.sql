
-- Trigger function to email admins when driver online status changes
CREATE OR REPLACE FUNCTION public.notify_driver_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.is_online IS DISTINCT FROM NEW.is_online THEN
    PERFORM net.http_post(
      url := 'https://aczkjkkiiqrvljlrkccw.supabase.co/functions/v1/send-order-email',
      body := jsonb_build_object(
        'type', 'driver_status_change',
        'driver_id', NEW.user_id,
        'is_online', NEW.is_online
      ),
      headers := public.internal_edge_headers()
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER on_driver_status_change
AFTER UPDATE ON public.drivers
FOR EACH ROW
EXECUTE FUNCTION public.notify_driver_status_change();
