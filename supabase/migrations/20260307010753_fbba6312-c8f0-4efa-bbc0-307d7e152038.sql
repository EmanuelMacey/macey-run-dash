
-- Drop the permissive UPDATE policy that allows arbitrary balance manipulation
DROP POLICY IF EXISTS "Users can update own loyalty" ON public.loyalty_points;

-- Create a secure redemption function
CREATE OR REPLACE FUNCTION public.redeem_loyalty_points(p_tier_points integer, p_discount_amount integer)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  cur_points integer;
  cur_total_redeemed integer;
  promo text;
BEGIN
  -- Validate tier
  IF p_tier_points NOT IN (50, 100, 200) THEN
    RAISE EXCEPTION 'Invalid redemption tier';
  END IF;

  -- Validate discount matches tier
  IF (p_tier_points = 50 AND p_discount_amount <> 500)
    OR (p_tier_points = 100 AND p_discount_amount <> 1000)
    OR (p_tier_points = 200 AND p_discount_amount <> 2500) THEN
    RAISE EXCEPTION 'Invalid discount for tier';
  END IF;

  -- Lock and fetch current balance
  SELECT points, total_redeemed INTO cur_points, cur_total_redeemed
  FROM public.loyalty_points
  WHERE user_id = auth.uid()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Loyalty record not found';
  END IF;

  IF cur_points < p_tier_points THEN
    RAISE EXCEPTION 'Insufficient points';
  END IF;

  -- Deduct points
  UPDATE public.loyalty_points
  SET points = points - p_tier_points,
      total_redeemed = total_redeemed + p_tier_points,
      updated_at = now()
  WHERE user_id = auth.uid();

  -- Log transaction
  INSERT INTO public.loyalty_transactions (user_id, points, type, description)
  VALUES (auth.uid(), -p_tier_points, 'redeem', 'Redeemed for $' || p_discount_amount || ' GYD off');

  -- Generate promo code
  promo := 'LOYAL' || upper(substr(md5(random()::text || auth.uid()::text), 1, 6));

  INSERT INTO public.promo_codes (code, discount_amount, is_active, max_uses, current_uses)
  VALUES (promo, p_discount_amount, true, 1, 0);

  RETURN promo;
END;
$$;
