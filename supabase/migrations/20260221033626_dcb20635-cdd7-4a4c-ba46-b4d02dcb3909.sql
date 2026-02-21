-- Allow upsert for push_subscriptions
CREATE POLICY "Users can update own push subscriptions"
ON public.push_subscriptions
FOR UPDATE
USING (user_id = auth.uid());

-- Add unique constraint for upsert to work
ALTER TABLE public.push_subscriptions
ADD CONSTRAINT push_subscriptions_user_endpoint_unique
UNIQUE (user_id, endpoint);