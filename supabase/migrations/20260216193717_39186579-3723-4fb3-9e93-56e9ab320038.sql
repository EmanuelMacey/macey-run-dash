CREATE POLICY "Customers can read assigned driver location"
ON public.drivers
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.driver_id = drivers.user_id
    AND orders.customer_id = auth.uid()
    AND orders.status IN ('accepted', 'picked_up', 'on_the_way')
  )
);