
-- The existing "Drivers can update assigned orders" policy is restrictive.
-- Drop and recreate as permissive with proper WITH CHECK for status transitions.
DROP POLICY IF EXISTS "Drivers can update assigned orders" ON public.orders;

CREATE POLICY "Drivers can update assigned orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (driver_id = auth.uid())
WITH CHECK (driver_id = auth.uid());
