
-- Partner API Keys
CREATE TABLE public.partner_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  key_prefix text NOT NULL UNIQUE,
  key_hash text NOT NULL UNIQUE,
  scopes text[] NOT NULL DEFAULT ARRAY['quote','create_delivery','read_delivery','cancel_delivery']::text[],
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage partner api keys"
ON public.partner_api_keys FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'admin'))
WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_partner_api_keys_updated
BEFORE UPDATE ON public.partner_api_keys
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Partner Webhooks
CREATE TABLE public.partner_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id uuid NOT NULL REFERENCES public.partner_api_keys(id) ON DELETE CASCADE,
  url text NOT NULL,
  secret text NOT NULL,
  events text[] NOT NULL DEFAULT ARRAY['order.created','order.accepted','order.picked_up','order.on_the_way','order.delivered','order.cancelled']::text[],
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage partner webhooks"
ON public.partner_webhooks FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'admin'))
WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_partner_webhooks_updated
BEFORE UPDATE ON public.partner_webhooks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Webhook Deliveries
CREATE TABLE public.partner_webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id uuid NOT NULL REFERENCES public.partner_webhooks(id) ON DELETE CASCADE,
  order_id uuid,
  event text NOT NULL,
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  next_retry_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_pwd_status ON public.partner_webhook_deliveries(status, next_retry_at);

ALTER TABLE public.partner_webhook_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage webhook deliveries"
ON public.partner_webhook_deliveries FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'admin'))
WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Tag orders that come from the partner API
ALTER TABLE public.orders
  ADD COLUMN partner_api_key_id uuid REFERENCES public.partner_api_keys(id) ON DELETE SET NULL;

CREATE INDEX idx_orders_partner_api_key ON public.orders(partner_api_key_id);

-- Trigger: enqueue webhook deliveries on order status changes for partner orders
CREATE OR REPLACE FUNCTION public.enqueue_partner_webhooks()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _event text;
  _hook RECORD;
BEGIN
  IF NEW.partner_api_key_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    _event := 'order.created';
  ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    _event := 'order.' || NEW.status::text;
  ELSE
    RETURN NEW;
  END IF;

  FOR _hook IN
    SELECT * FROM public.partner_webhooks
    WHERE api_key_id = NEW.partner_api_key_id
      AND is_active = true
      AND _event = ANY(events)
  LOOP
    INSERT INTO public.partner_webhook_deliveries (webhook_id, order_id, event, payload, next_retry_at)
    VALUES (
      _hook.id, NEW.id, _event,
      jsonb_build_object(
        'event', _event,
        'order_id', NEW.id,
        'status', NEW.status,
        'order_type', NEW.order_type,
        'price', NEW.price,
        'pickup_address', NEW.pickup_address,
        'dropoff_address', NEW.dropoff_address,
        'created_at', NEW.created_at,
        'updated_at', NEW.updated_at
      ),
      now()
    );
  END LOOP;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_partner_webhooks_insert
AFTER INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.enqueue_partner_webhooks();

CREATE TRIGGER trg_partner_webhooks_update
AFTER UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.enqueue_partner_webhooks();
