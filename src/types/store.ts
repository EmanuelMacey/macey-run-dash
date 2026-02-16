export interface Store {
  id: string;
  name: string;
  description: string | null;
  logo: string | null;
  cover_image: string | null;
  category_id: string | null;
  is_open: boolean;
  created_at: string;
  updated_at: string;
  address: string | null;
  phone: string | null;
  delivery_fee: number | null;
  is_featured: boolean;
  opening_hours: string | null;
}

export interface Product {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  logo: string | null;
  cover_image: string | null;
  category: string | null;
  is_open: boolean;
  created_at: string;
  updated_at: string;
  address: string | null;
  phone: string | null;
  delivery_fee: number | null;
  is_featured: boolean;
  opening_hours: string | null;
  price: number;
  unit: string | null;
  in_stock: boolean;
  stock_quantity: number | null;
  tags: string[] | null;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
