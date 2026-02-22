
-- Loyalty points table
CREATE TABLE public.loyalty_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_redeemed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own loyalty" ON public.loyalty_points FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own loyalty" ON public.loyalty_points FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all loyalty" ON public.loyalty_points FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Loyalty transactions log
CREATE TABLE public.loyalty_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  order_id UUID REFERENCES public.orders(id),
  points INTEGER NOT NULL,
  type TEXT NOT NULL DEFAULT 'earn', -- 'earn' or 'redeem'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own transactions" ON public.loyalty_transactions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all transactions" ON public.loyalty_transactions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Add scheduled_for column to orders
ALTER TABLE public.orders ADD COLUMN scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Auto-create loyalty record for new users (trigger)
CREATE OR REPLACE FUNCTION public.create_loyalty_for_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.loyalty_points (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_loyalty
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_loyalty_for_new_user();

-- Function: award points when order is delivered (10 pts per $1000 GYD)
CREATE OR REPLACE FUNCTION public.award_loyalty_points()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  _points INTEGER;
BEGIN
  IF NEW.status = 'delivered' AND OLD.status <> 'delivered' THEN
    _points := GREATEST(1, FLOOR(NEW.price / 100));
    
    INSERT INTO public.loyalty_points (user_id, points, total_earned)
    VALUES (NEW.customer_id, _points, _points)
    ON CONFLICT (user_id) DO UPDATE
    SET points = loyalty_points.points + _points,
        total_earned = loyalty_points.total_earned + _points,
        updated_at = now();
    
    INSERT INTO public.loyalty_transactions (user_id, order_id, points, type, description)
    VALUES (NEW.customer_id, NEW.id, _points, 'earn', 'Points earned from order delivery');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_order_delivered_award_points
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.award_loyalty_points();

-- Enable realtime for loyalty_points
ALTER PUBLICATION supabase_realtime ADD TABLE public.loyalty_points;
