
-- 1) Tipping + surge columns on orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS tip_amount integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS surge_multiplier numeric(4,2) NOT NULL DEFAULT 1.00,
  ADD COLUMN IF NOT EXISTS surge_reason text;

-- 2) Surge settings (single-row, admin-controlled)
CREATE TABLE IF NOT EXISTS public.surge_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active boolean NOT NULL DEFAULT false,
  multiplier numeric(4,2) NOT NULL DEFAULT 1.00,
  reason text,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.surge_settings TO anon, authenticated;
GRANT ALL ON public.surge_settings TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.surge_settings TO authenticated;

ALTER TABLE public.surge_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read surge settings" ON public.surge_settings;
CREATE POLICY "Anyone can read surge settings" ON public.surge_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage surge settings" ON public.surge_settings;
CREATE POLICY "Admins manage surge settings" ON public.surge_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER surge_settings_updated_at
  BEFORE UPDATE ON public.surge_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed single row if empty
INSERT INTO public.surge_settings (is_active, multiplier, reason)
SELECT false, 1.00, null
WHERE NOT EXISTS (SELECT 1 FROM public.surge_settings);

-- 3) Fix driver_applications: explicit admin-only SELECT, deny others
DROP POLICY IF EXISTS "Admins can view driver applications" ON public.driver_applications;
CREATE POLICY "Admins can view driver applications" ON public.driver_applications
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Restrict the public INSERT policy to anon+authenticated only (no SELECT exposure)
DROP POLICY IF EXISTS "Anyone can submit driver applications" ON public.driver_applications;
CREATE POLICY "Anyone can submit driver applications" ON public.driver_applications
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Revoke any default SELECT grant from anon to defense-in-depth
REVOKE SELECT ON public.driver_applications FROM anon;
