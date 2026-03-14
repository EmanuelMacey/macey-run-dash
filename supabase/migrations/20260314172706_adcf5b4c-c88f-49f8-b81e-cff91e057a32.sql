
-- Payment settings table (admin-editable MMG details)
CREATE TABLE public.payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mmg_number text NOT NULL DEFAULT '+592 721-9769',
  account_name text NOT NULL DEFAULT 'MaceyRunners Delivery Service',
  payment_instructions text NOT NULL DEFAULT 'Open your MMG wallet, send the exact amount to the MMG number above, copy the Transaction ID, return here and submit it to confirm your delivery request.',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage payment settings" ON public.payment_settings FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone authenticated can read payment settings" ON public.payment_settings FOR SELECT TO authenticated USING (true);

INSERT INTO public.payment_settings (mmg_number, account_name) VALUES ('+592 721-9769', 'MaceyRunners Delivery Service');

-- Payment verifications table
CREATE TABLE public.payment_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL,
  transaction_id text NOT NULL,
  mmg_number_used text NOT NULL,
  screenshot_url text,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  verified_by uuid,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(transaction_id)
);

ALTER TABLE public.payment_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage verifications" ON public.payment_verifications FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Customers can view own verifications" ON public.payment_verifications FOR SELECT TO authenticated USING (customer_id = auth.uid());
CREATE POLICY "Customers can create verifications" ON public.payment_verifications FOR INSERT TO authenticated WITH CHECK (customer_id = auth.uid());

-- Update driver RLS: exclude unverified MMG orders
DROP POLICY IF EXISTS "Drivers can read pending orders" ON public.orders;
CREATE POLICY "Drivers can read pending orders" ON public.orders FOR SELECT TO authenticated
  USING (
    status = 'pending'::order_status 
    AND driver_id IS NULL 
    AND has_role(auth.uid(), 'driver'::app_role)
    AND (
      payment_method != 'mmg'::payment_method 
      OR payment_status = 'paid'::payment_status
    )
  );

DROP POLICY IF EXISTS "Drivers can accept pending orders" ON public.orders;
CREATE POLICY "Drivers can accept pending orders" ON public.orders FOR UPDATE TO authenticated
  USING (
    status = 'pending'::order_status 
    AND driver_id IS NULL 
    AND has_role(auth.uid(), 'driver'::app_role)
    AND (
      payment_method != 'mmg'::payment_method 
      OR payment_status = 'paid'::payment_status
    )
  )
  WITH CHECK (
    driver_id = auth.uid() 
    AND has_role(auth.uid(), 'driver'::app_role)
  );

-- Update redeem function for new loyalty tiers: 50=$200, 100=$400, 200=$800
CREATE OR REPLACE FUNCTION public.redeem_loyalty_points(p_tier_points integer, p_discount_amount integer)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  cur_points integer;
  promo text;
BEGIN
  IF p_tier_points NOT IN (50, 100, 200) THEN
    RAISE EXCEPTION 'Invalid redemption tier';
  END IF;

  IF (p_tier_points = 50 AND p_discount_amount <> 200)
    OR (p_tier_points = 100 AND p_discount_amount <> 400)
    OR (p_tier_points = 200 AND p_discount_amount <> 800) THEN
    RAISE EXCEPTION 'Invalid discount for tier';
  END IF;

  SELECT points INTO cur_points
  FROM public.loyalty_points
  WHERE user_id = auth.uid()
  FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'Loyalty record not found'; END IF;
  IF cur_points < p_tier_points THEN RAISE EXCEPTION 'Insufficient points'; END IF;

  UPDATE public.loyalty_points
  SET points = points - p_tier_points, total_redeemed = total_redeemed + p_tier_points, updated_at = now()
  WHERE user_id = auth.uid();

  INSERT INTO public.loyalty_transactions (user_id, points, type, description)
  VALUES (auth.uid(), -p_tier_points, 'redeem', 'Redeemed for $' || p_discount_amount || ' GYD off');

  promo := 'LOYAL' || upper(substr(md5(random()::text || auth.uid()::text), 1, 6));
  INSERT INTO public.promo_codes (code, discount_amount, is_active, max_uses, current_uses)
  VALUES (promo, p_discount_amount, true, 1, 0);

  RETURN promo;
END;
$$;

-- Auto-cancel unverified MMG orders after 20 minutes
CREATE OR REPLACE FUNCTION public.auto_cancel_unverified_mmg_orders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.orders
  SET status = 'cancelled'::order_status, updated_at = now()
  WHERE status = 'pending'::order_status
    AND payment_method = 'mmg'::payment_method
    AND payment_status = 'pending'::payment_status
    AND created_at < now() - interval '20 minutes'
    AND id NOT IN (SELECT order_id FROM public.payment_verifications WHERE status != 'rejected');
END;
$$;
