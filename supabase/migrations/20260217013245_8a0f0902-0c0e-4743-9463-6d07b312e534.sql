
-- Add location fields to profiles for customer pin location
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS default_address TEXT,
ADD COLUMN IF NOT EXISTS default_lat DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS default_lng DOUBLE PRECISION;

-- Allow drivers to read customer profiles for orders they're assigned to
CREATE POLICY "Drivers can read customer profiles for assigned orders"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.driver_id = auth.uid()
    AND orders.customer_id = profiles.user_id
    AND orders.status IN ('accepted', 'picked_up', 'on_the_way')
  )
);
