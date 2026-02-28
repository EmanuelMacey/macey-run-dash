
-- Add linked product/store columns for promo banners to navigate customers
ALTER TABLE public.promotional_banners 
ADD COLUMN linked_product_id uuid REFERENCES public.marketplace_products(id) ON DELETE SET NULL,
ADD COLUMN linked_store_id uuid REFERENCES public.marketplace_stores(id) ON DELETE SET NULL;
