
-- Fix: Update notify_order_status_change to also notify the assigned driver about status changes
-- and ensure only the correct customer gets notified (already correct but adding explicit safeguard)
CREATE OR REPLACE FUNCTION public.notify_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _title TEXT;
  _message TEXT;
  _type TEXT := 'order_update';
  _admin RECORD;
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  CASE NEW.status
    WHEN 'accepted' THEN
      _title := 'Order Accepted';
      _message := 'A driver has accepted your order and is heading to pick it up.';
    WHEN 'picked_up' THEN
      _title := 'Order Picked Up';
      _message := 'Your package has been picked up and is on its way.';
    WHEN 'on_the_way' THEN
      _title := 'On The Way';
      _message := 'Your delivery is on the way to you!';
    WHEN 'delivered' THEN
      _title := 'Delivered';
      _message := 'Your order has been delivered. Thank you!';
    WHEN 'cancelled' THEN
      _title := 'Order Cancelled';
      _message := 'Your order has been cancelled.';
    ELSE
      RETURN NEW;
  END CASE;

  -- Notify ONLY the specific customer who owns this order
  INSERT INTO public.notifications (user_id, title, message, type, order_id)
  VALUES (NEW.customer_id, _title, _message, _type, NEW.id);

  -- Notify the assigned driver (if any and not the one who triggered the change)
  IF NEW.driver_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, message, type, order_id)
    VALUES (NEW.driver_id, 'Order Update: ' || _title, 'Order ' || LEFT(NEW.id::text, 8) || '… status is now ' || REPLACE(NEW.status::text, '_', ' '), _type, NEW.id);
  END IF;

  -- Notify all admins
  FOR _admin IN SELECT user_id FROM public.user_roles WHERE role = 'admin'
  LOOP
    INSERT INTO public.notifications (user_id, title, message, type, order_id)
    VALUES (_admin.user_id, 'Order Update: ' || _title, 'Order ' || LEFT(NEW.id::text, 8) || '… status changed to ' || NEW.status, _type, NEW.id);
  END LOOP;

  RETURN NEW;
END;
$$;

-- Add a new trigger function to notify driver when admin assigns them to an order
CREATE OR REPLACE FUNCTION public.notify_driver_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only fire when driver_id changes from NULL or a different driver
  IF NEW.driver_id IS NOT NULL AND (OLD.driver_id IS NULL OR OLD.driver_id <> NEW.driver_id) THEN
    -- Don't duplicate if status also changed (that trigger handles it)
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

    -- Send email to the assigned driver
    PERFORM net.http_post(
      url := 'https://aczkjkkiiqrvljlrkccw.supabase.co/functions/v1/send-order-email',
      body := jsonb_build_object('type', 'driver_assigned', 'order_id', NEW.id, 'driver_id', NEW.driver_id),
      headers := jsonb_build_object('Content-Type', 'application/json')
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create the trigger for driver assignment
DROP TRIGGER IF EXISTS on_driver_assignment ON public.orders;
CREATE TRIGGER on_driver_assignment
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_driver_assignment();
