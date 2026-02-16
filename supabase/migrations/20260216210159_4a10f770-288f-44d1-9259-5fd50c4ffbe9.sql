
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

  -- Notify the customer
  INSERT INTO public.notifications (user_id, title, message, type, order_id)
  VALUES (NEW.customer_id, _title, _message, _type, NEW.id);

  -- Notify all admins
  FOR _admin IN SELECT user_id FROM public.user_roles WHERE role = 'admin'
  LOOP
    INSERT INTO public.notifications (user_id, title, message, type, order_id)
    VALUES (_admin.user_id, 'Order Update: ' || _title, 'Order ' || LEFT(NEW.id::text, 8) || '… status changed to ' || NEW.status, _type, NEW.id);
  END LOOP;

  RETURN NEW;
END;
$$;
