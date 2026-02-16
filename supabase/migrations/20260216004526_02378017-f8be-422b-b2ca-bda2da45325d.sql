
-- Drop the restrictive customer update policy
DROP POLICY IF EXISTS "Customers can update own pending orders" ON public.orders;

-- Recreate as permissive so it works with the other policies
CREATE POLICY "Customers can update own pending orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (customer_id = auth.uid() AND status = 'pending'::order_status)
WITH CHECK (customer_id = auth.uid());
