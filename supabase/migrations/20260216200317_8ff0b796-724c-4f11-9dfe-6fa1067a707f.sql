
-- Add read receipt column
ALTER TABLE public.chat_messages ADD COLUMN is_read BOOLEAN NOT NULL DEFAULT false;

-- Allow users to update is_read on messages sent TO them (not by them)
CREATE POLICY "Customers can mark messages as read"
ON public.chat_messages FOR UPDATE
USING (
  sender_id != auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = chat_messages.order_id
    AND orders.customer_id = auth.uid()
    AND orders.status IN ('accepted', 'picked_up', 'on_the_way')
  )
)
WITH CHECK (
  sender_id != auth.uid()
);

CREATE POLICY "Drivers can mark messages as read"
ON public.chat_messages FOR UPDATE
USING (
  sender_id != auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = chat_messages.order_id
    AND orders.driver_id = auth.uid()
    AND orders.status IN ('accepted', 'picked_up', 'on_the_way')
  )
)
WITH CHECK (
  sender_id != auth.uid()
);
