
CREATE OR REPLACE FUNCTION public.customer_add_tip(p_order_id uuid, p_amount integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _customer_id uuid;
  _driver_id uuid;
  _status order_status;
  _old_tip integer;
  _price integer;
BEGIN
  IF p_amount IS NULL OR p_amount < 0 OR p_amount > 50000 THEN
    RAISE EXCEPTION 'Invalid tip amount';
  END IF;

  SELECT customer_id, driver_id, status, COALESCE(tip_amount, 0), price
    INTO _customer_id, _driver_id, _status, _old_tip, _price
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  IF _customer_id <> auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF _status <> 'delivered' THEN
    RAISE EXCEPTION 'Tips can only be added to delivered orders';
  END IF;

  UPDATE public.orders
  SET tip_amount = p_amount,
      price = _price - _old_tip + p_amount,
      updated_at = now()
  WHERE id = p_order_id;

  IF _driver_id IS NOT NULL AND p_amount > _old_tip THEN
    INSERT INTO public.notifications (user_id, title, message, type, order_id)
    VALUES (
      _driver_id,
      'You got a tip! 💚',
      'A customer added a $' || p_amount || ' GYD tip to your delivery. Thank you for great service!',
      'order_update',
      p_order_id
    );
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.customer_add_tip(uuid, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.customer_add_tip(uuid, integer) TO authenticated;
