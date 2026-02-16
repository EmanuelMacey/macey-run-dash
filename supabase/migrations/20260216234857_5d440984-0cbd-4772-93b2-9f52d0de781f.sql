
-- Create marketplace_stores table
CREATE TABLE public.marketplace_stores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Restaurant',
  description TEXT,
  image_url TEXT,
  is_open BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create marketplace_products table
CREATE TABLE public.marketplace_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.marketplace_stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.marketplace_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_products ENABLE ROW LEVEL SECURITY;

-- Public read access for stores
CREATE POLICY "Anyone can view stores"
ON public.marketplace_stores FOR SELECT
USING (true);

-- Public read access for products
CREATE POLICY "Anyone can view products"
ON public.marketplace_products FOR SELECT
USING (true);

-- Admin insert/update/delete for stores
CREATE POLICY "Admins can manage stores"
ON public.marketplace_stores FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Admin insert/update/delete for products
CREATE POLICY "Admins can manage products"
ON public.marketplace_products FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Index for fast product lookup by store
CREATE INDEX idx_marketplace_products_store_id ON public.marketplace_products(store_id);

-- Trigger for updated_at
CREATE TRIGGER update_marketplace_stores_updated_at
BEFORE UPDATE ON public.marketplace_stores
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketplace_products_updated_at
BEFORE UPDATE ON public.marketplace_products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
