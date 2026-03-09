-- Drop the overly permissive driver update policy
DROP POLICY IF EXISTS "Drivers can update assigned orders" ON public.orders;

-- Create a SECURITY DEFINER function that validates driver order updates
CREATE OR REPLACE FUNCTION public.driver_update_order_status(
  p_order_id uuid,
  p_new_status order_status
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _current_status order_status;
  _driver_id uuid;
BEGIN
  SELECT status, driver_id INTO _current_status, _driver_id
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  IF _driver_id IS NULL OR _driver_id <> auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF p_new_status = 'cancelled' THEN
    IF _current_status NOT IN ('accepted', 'picked_up') THEN
      RAISE EXCEPTION 'Cannot cancel from status %', _current_status;
    END IF;
  ELSIF _current_status = 'accepted' AND p_new_status = 'picked_up' THEN
    NULL;
  ELSIF _current_status = 'picked_up' AND p_new_status = 'on_the_way' THEN
    NULL;
  ELSIF _current_status = 'on_the_way' AND p_new_status = 'delivered' THEN
    NULL;
  ELSE
    RAISE EXCEPTION 'Invalid status transition from % to %', _current_status, p_new_status;
  END IF;

  UPDATE public.orders
  SET status = p_new_status, updated_at = now()
  WHERE id = p_order_id;
END;
$$;

-- Recreate a restrictive policy: drivers can only update status on assigned orders
-- The WITH CHECK ensures drivers cannot change price, payment, customer, or order type
CREATE POLICY "Drivers can update assigned orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (driver_id = auth.uid())
WITH CHECK (
  driver_id = auth.uid()
  AND customer_id = (SELECT o.customer_id FROM public.orders o WHERE o.id = orders.id)
  AND price = (SELECT o.price FROM public.orders o WHERE o.id = orders.id)
  AND payment_method = (SELECT o.payment_method FROM public.orders o WHERE o.id = orders.id)
  AND payment_status = (SELECT o.payment_status FROM public.orders o WHERE o.id = orders.id)
  AND order_type = (SELECT o.order_type FROM public.orders o WHERE o.id = orders.id)
);