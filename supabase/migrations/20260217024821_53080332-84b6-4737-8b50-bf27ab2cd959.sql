
-- Drop all existing SELECT policies on orders and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Customers can read own orders" ON public.orders;
DROP POLICY IF EXISTS "Drivers can read assigned orders" ON public.orders;
DROP POLICY IF EXISTS "Drivers can read pending orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
DROP POLICY IF EXISTS "Customers can create orders" ON public.orders;
DROP POLICY IF EXISTS "Customers can update own pending orders" ON public.orders;
DROP POLICY IF EXISTS "Drivers can accept pending orders" ON public.orders;
DROP POLICY IF EXISTS "Drivers can update assigned orders" ON public.orders;

-- Recreate all as PERMISSIVE
CREATE POLICY "Customers can read own orders"
ON public.orders FOR SELECT TO authenticated
USING (customer_id = auth.uid());

CREATE POLICY "Drivers can read assigned orders"
ON public.orders FOR SELECT TO authenticated
USING (driver_id = auth.uid());

CREATE POLICY "Drivers can read pending orders"
ON public.orders FOR SELECT TO authenticated
USING (status = 'pending' AND driver_id IS NULL AND has_role(auth.uid(), 'driver'));

CREATE POLICY "Admins can manage all orders"
ON public.orders FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Customers can create orders"
ON public.orders FOR INSERT TO authenticated
WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customers can update own pending orders"
ON public.orders FOR UPDATE TO authenticated
USING (customer_id = auth.uid() AND status = 'pending')
WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Drivers can accept pending orders"
ON public.orders FOR UPDATE TO authenticated
USING (status = 'pending' AND driver_id IS NULL AND has_role(auth.uid(), 'driver'))
WITH CHECK (driver_id = auth.uid() AND has_role(auth.uid(), 'driver'));

CREATE POLICY "Drivers can update assigned orders"
ON public.orders FOR UPDATE TO authenticated
USING (driver_id = auth.uid())
WITH CHECK (driver_id = auth.uid());
