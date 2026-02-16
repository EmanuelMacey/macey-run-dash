
-- Allow drivers to see pending unassigned orders so they can accept them
CREATE POLICY "Drivers can read pending orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  status = 'pending'::order_status
  AND driver_id IS NULL
  AND has_role(auth.uid(), 'driver'::app_role)
);

-- Allow drivers to accept pending orders (update driver_id and status)
CREATE POLICY "Drivers can accept pending orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (
  status = 'pending'::order_status
  AND driver_id IS NULL
  AND has_role(auth.uid(), 'driver'::app_role)
)
WITH CHECK (
  driver_id = auth.uid()
  AND has_role(auth.uid(), 'driver'::app_role)
);
