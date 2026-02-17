
-- Create a function that notifies all online drivers when a new order is created
CREATE OR REPLACE FUNCTION public.notify_drivers_new_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _driver RECORD;
BEGIN
  -- Only trigger for new pending orders
  IF NEW.status = 'pending' THEN
    FOR _driver IN 
      SELECT d.user_id 
      FROM public.drivers d 
      WHERE d.is_online = true AND d.is_approved = true
    LOOP
      INSERT INTO public.notifications (user_id, title, message, type, order_id)
      VALUES (
        _driver.user_id, 
        'New Order Available! 🚀', 
        'A new ' || NEW.order_type || ' order is waiting — $' || NEW.price || ' GYD', 
        'new_order', 
        NEW.id
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$function$;

-- Create the trigger
CREATE TRIGGER notify_drivers_on_new_order
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.notify_drivers_new_order();
