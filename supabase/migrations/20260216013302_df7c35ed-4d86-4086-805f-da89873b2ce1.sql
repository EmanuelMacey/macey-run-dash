
-- Create trigger function for order status notifications
CREATE OR REPLACE FUNCTION public.notify_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _title TEXT;
  _message TEXT;
  _type TEXT := 'order_update';
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

  INSERT INTO public.notifications (user_id, title, message, type, order_id)
  VALUES (NEW.customer_id, _title, _message, _type, NEW.id);

  RETURN NEW;
END;
$function$;

-- Attach trigger
DROP TRIGGER IF EXISTS trg_order_status_notification ON public.orders;
CREATE TRIGGER trg_order_status_notification
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.notify_order_status_change();
