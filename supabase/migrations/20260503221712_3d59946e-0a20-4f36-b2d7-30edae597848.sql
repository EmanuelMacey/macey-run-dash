
-- Sequence for trace codes
CREATE SEQUENCE IF NOT EXISTS public.finance_log_seq START 1;

CREATE TABLE public.finance_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trace_code text NOT NULL UNIQUE,
  log_type text NOT NULL DEFAULT 'delivery', -- delivery | errand
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  customer_name text NOT NULL DEFAULT '',
  customer_phone text DEFAULT '',
  pickup_address text DEFAULT '',
  dropoff_address text DEFAULT '',
  distance_km numeric DEFAULT 0,
  gross_amount integer NOT NULL DEFAULT 0,
  platform_fee integer NOT NULL DEFAULT 100,
  driver_payout integer NOT NULL DEFAULT 0,
  net_profit integer NOT NULL DEFAULT 0,
  payment_method text NOT NULL DEFAULT 'cash', -- cash | mmg
  payment_status text NOT NULL DEFAULT 'paid', -- paid | pending | refunded
  driver_name text DEFAULT '',
  notes text DEFAULT '',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.set_finance_trace_code()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.trace_code IS NULL OR NEW.trace_code = '' THEN
    NEW.trace_code := 'FN-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.finance_log_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_finance_trace_code
BEFORE INSERT ON public.finance_logs
FOR EACH ROW EXECUTE FUNCTION public.set_finance_trace_code();

CREATE TRIGGER trg_finance_logs_updated_at
BEFORE UPDATE ON public.finance_logs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.finance_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage finance logs"
ON public.finance_logs
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_finance_logs_date ON public.finance_logs(log_date DESC);
CREATE INDEX idx_finance_logs_type ON public.finance_logs(log_type);
