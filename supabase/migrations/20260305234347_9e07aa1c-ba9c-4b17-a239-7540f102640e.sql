-- Drop and recreate updated_at triggers that already exist
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
DROP TRIGGER IF EXISTS update_drivers_updated_at ON public.drivers;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_marketplace_stores_updated_at ON public.marketplace_stores;
DROP TRIGGER IF EXISTS update_marketplace_products_updated_at ON public.marketplace_products;

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at
  BEFORE UPDATE ON public.drivers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketplace_stores_updated_at
  BEFORE UPDATE ON public.marketplace_stores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketplace_products_updated_at
  BEFORE UPDATE ON public.marketplace_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();