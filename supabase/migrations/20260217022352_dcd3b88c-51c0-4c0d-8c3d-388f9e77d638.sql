
-- Add credit_balance to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS credit_balance integer NOT NULL DEFAULT 0;

-- Create referrals table
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_id uuid NOT NULL,
  referral_code text NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- pending, credited
  credit_amount integer NOT NULL DEFAULT 500,
  created_at timestamptz NOT NULL DEFAULT now(),
  credited_at timestamptz
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Users can see their own referrals (as referrer)
CREATE POLICY "Users can read own referrals" ON public.referrals
  FOR SELECT USING (referrer_id = auth.uid());

-- System inserts referrals via trigger, but allow insert for signup flow
CREATE POLICY "Users can create referral record" ON public.referrals
  FOR INSERT WITH CHECK (referred_id = auth.uid());

-- Admins can manage all
CREATE POLICY "Admins can manage referrals" ON public.referrals
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Add unique referral_code column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code text UNIQUE;

-- Generate referral codes for existing profiles
UPDATE public.profiles SET referral_code = upper(substr(md5(random()::text), 1, 8)) WHERE referral_code IS NULL;

-- Function to auto-generate referral code on new profile
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := upper(substr(md5(random()::text || NEW.user_id::text), 1, 8));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_referral_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_referral_code();

-- Function to credit referrer when referred user's first order is delivered
CREATE OR REPLACE FUNCTION public.credit_referrer_on_first_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _referral RECORD;
  _order_count integer;
BEGIN
  -- Only trigger when status changes to 'delivered'
  IF NEW.status <> 'delivered' OR OLD.status = 'delivered' THEN
    RETURN NEW;
  END IF;

  -- Check if this is the customer's first delivered order
  SELECT count(*) INTO _order_count
  FROM public.orders
  WHERE customer_id = NEW.customer_id AND status = 'delivered' AND id <> NEW.id;

  IF _order_count > 0 THEN
    RETURN NEW;
  END IF;

  -- Find pending referral for this customer
  SELECT * INTO _referral
  FROM public.referrals
  WHERE referred_id = NEW.customer_id AND status = 'pending'
  LIMIT 1;

  IF _referral IS NULL THEN
    RETURN NEW;
  END IF;

  -- Credit the referrer
  UPDATE public.profiles
  SET credit_balance = credit_balance + _referral.credit_amount
  WHERE user_id = _referral.referrer_id;

  -- Mark referral as credited
  UPDATE public.referrals
  SET status = 'credited', credited_at = now()
  WHERE id = _referral.id;

  -- Notify referrer
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    _referral.referrer_id,
    'Referral Reward! 🎉',
    'Your friend completed their first order! $' || _referral.credit_amount || ' GYD has been added to your credit balance.',
    'referral'
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER credit_referrer_trigger
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.credit_referrer_on_first_order();
