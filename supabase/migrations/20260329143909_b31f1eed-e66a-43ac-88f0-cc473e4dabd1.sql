-- Drop functions (CASCADE will drop dependent triggers)
DROP FUNCTION IF EXISTS public.award_loyalty_points() CASCADE;
DROP FUNCTION IF EXISTS public.redeem_loyalty_points(integer, integer) CASCADE;
DROP FUNCTION IF EXISTS public.create_loyalty_for_new_user() CASCADE;

-- Drop tables
DROP TABLE IF EXISTS public.loyalty_transactions CASCADE;
DROP TABLE IF EXISTS public.loyalty_points CASCADE;