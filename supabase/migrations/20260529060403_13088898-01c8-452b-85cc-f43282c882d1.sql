
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS weight_category text NOT NULL DEFAULT 'under_40lbs' CHECK (weight_category IN ('under_40lbs','over_40lbs')),
  ADD COLUMN IF NOT EXISTS is_fragile boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_hazardous boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_easy_break boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS required_vehicle text NOT NULL DEFAULT 'bike' CHECK (required_vehicle IN ('bike','car'));

CREATE OR REPLACE FUNCTION public.compute_required_vehicle()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.weight_category = 'over_40lbs'
     OR NEW.is_fragile = true
     OR NEW.is_hazardous = true
     OR NEW.is_easy_break = true THEN
    NEW.required_vehicle := 'car';
  ELSE
    NEW.required_vehicle := 'bike';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_compute_required_vehicle ON public.orders;
CREATE TRIGGER trg_compute_required_vehicle
BEFORE INSERT OR UPDATE OF weight_category, is_fragile, is_hazardous, is_easy_break
ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.compute_required_vehicle();
