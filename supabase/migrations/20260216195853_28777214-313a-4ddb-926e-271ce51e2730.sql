
-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Customers can read messages on their own orders
CREATE POLICY "Customers can read own order messages"
ON public.chat_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = chat_messages.order_id
    AND orders.customer_id = auth.uid()
    AND orders.status IN ('accepted', 'picked_up', 'on_the_way')
  )
);

-- Drivers can read messages on their assigned orders
CREATE POLICY "Drivers can read assigned order messages"
ON public.chat_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = chat_messages.order_id
    AND orders.driver_id = auth.uid()
    AND orders.status IN ('accepted', 'picked_up', 'on_the_way')
  )
);

-- Customers can send messages on their own active orders
CREATE POLICY "Customers can send messages on own orders"
ON public.chat_messages FOR INSERT
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = chat_messages.order_id
    AND orders.customer_id = auth.uid()
    AND orders.status IN ('accepted', 'picked_up', 'on_the_way')
  )
);

-- Drivers can send messages on their assigned active orders
CREATE POLICY "Drivers can send messages on assigned orders"
ON public.chat_messages FOR INSERT
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = chat_messages.order_id
    AND orders.driver_id = auth.uid()
    AND orders.status IN ('accepted', 'picked_up', 'on_the_way')
  )
);

-- Admins can manage all messages
CREATE POLICY "Admins can manage all messages"
ON public.chat_messages FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Index for fast lookups
CREATE INDEX idx_chat_messages_order_id ON public.chat_messages(order_id, created_at);
