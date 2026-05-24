ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS idempotency_key text;
CREATE UNIQUE INDEX IF NOT EXISTS orders_partner_idem_uidx
  ON public.orders(partner_api_key_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

INSERT INTO public.partner_api_keys (name, key_prefix, key_hash, scopes, is_active, created_by)
VALUES (
  'Public Sandbox',
  'mr_test_sb_',
  '04382b868e98fa55e66ce22e45b34a90da4e0425e25b220dfe8f2a1e87fe6108',
  ARRAY['quote','create_delivery','read_delivery','cancel_delivery'],
  true,
  'b17c5318-6f6f-4cbd-9265-22e2916d0b56'
)
ON CONFLICT DO NOTHING;