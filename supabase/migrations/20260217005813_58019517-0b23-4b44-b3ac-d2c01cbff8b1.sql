
-- Create order_items table for food order item breakdowns
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Customers can read items for their own orders
CREATE POLICY "Customers can read own order items"
ON public.order_items FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.orders
  WHERE orders.id = order_items.order_id
  AND orders.customer_id = auth.uid()
));

-- Customers can insert items for their own orders
CREATE POLICY "Customers can insert own order items"
ON public.order_items FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.orders
  WHERE orders.id = order_items.order_id
  AND orders.customer_id = auth.uid()
));

-- Drivers can read items for orders they are assigned to or pending orders
CREATE POLICY "Drivers can read assigned order items"
ON public.order_items FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.orders
  WHERE orders.id = order_items.order_id
  AND (orders.driver_id = auth.uid() OR (orders.status = 'pending' AND orders.driver_id IS NULL))
  AND has_role(auth.uid(), 'driver')
));

-- Admins can manage all order items
CREATE POLICY "Admins can manage all order items"
ON public.order_items FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Index for fast lookups
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
