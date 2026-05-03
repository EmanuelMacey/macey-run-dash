ALTER TABLE public.finance_logs ADD COLUMN IF NOT EXISTS source_order_id uuid UNIQUE;
CREATE INDEX IF NOT EXISTS idx_finance_logs_source_order ON public.finance_logs(source_order_id);