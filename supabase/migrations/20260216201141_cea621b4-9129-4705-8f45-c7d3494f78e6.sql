
-- Create driver ratings table
CREATE TABLE public.driver_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL,
  driver_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(order_id)
);

-- Enable RLS
ALTER TABLE public.driver_ratings ENABLE ROW LEVEL SECURITY;

-- Customers can rate delivered orders they own (one rating per order)
CREATE POLICY "Customers can create rating for delivered orders"
ON public.driver_ratings FOR INSERT
WITH CHECK (
  customer_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = driver_ratings.order_id
    AND orders.customer_id = auth.uid()
    AND orders.driver_id = driver_ratings.driver_id
    AND orders.status = 'delivered'
  )
);

-- Customers can read their own ratings
CREATE POLICY "Customers can read own ratings"
ON public.driver_ratings FOR SELECT
USING (customer_id = auth.uid());

-- Drivers can read ratings about them
CREATE POLICY "Drivers can read own ratings"
ON public.driver_ratings FOR SELECT
USING (driver_id = auth.uid());

-- Admins can manage all ratings
CREATE POLICY "Admins can manage all ratings"
ON public.driver_ratings FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Index for fast lookups
CREATE INDEX idx_driver_ratings_driver ON public.driver_ratings(driver_id);
CREATE INDEX idx_driver_ratings_order ON public.driver_ratings(order_id);
