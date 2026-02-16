import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useStore } from "@/hooks/useStores";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Search, ShoppingCart, Plus, Minus, Store as StoreIcon, Package } from "lucide-react";
import type { Product } from "@/types/store";

const ProductCard = ({ product }: { product: Product }) => {
  const { items, addItem, updateQuantity, removeItem } = useCart();
  const cartItem = items.find((i) => i.product.id === product.id);
  const qty = cartItem?.quantity ?? 0;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
      {product.cover_image || product.logo ? (
        <div className="h-32 overflow-hidden">
          <img
            src={product.cover_image || product.logo || ""}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="h-32 bg-muted flex items-center justify-center">
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      <div className="p-3 flex-1 flex flex-col">
        <h4 className="font-display font-semibold text-sm text-card-foreground truncate">{product.name}</h4>
        {product.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{product.description}</p>
        )}
        <div className="flex items-center gap-2 mt-1">
          {!product.in_stock && <Badge variant="secondary" className="text-[10px]">Out of stock</Badge>}
          {product.unit && <span className="text-[10px] text-muted-foreground">per {product.unit}</span>}
        </div>
        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="font-display font-bold text-primary">${product.price}</span>
          {product.in_stock !== false ? (
            qty > 0 ? (
              <div className="flex items-center gap-1">
                <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(product.id, qty - 1)}>
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-sm font-semibold w-6 text-center">{qty}</span>
                <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(product.id, qty + 1)}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => addItem(product)}>
                <Plus className="h-3 w-3 mr-1" /> Add
              </Button>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
};

const StoreDetail = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const { data: store, isLoading: storeLoading } = useStore(storeId!);
  const [search, setSearch] = useState("");
  const { data: products, isLoading: productsLoading } = useProducts(storeId!, search || undefined);
  const { itemCount } = useCart();

  if (storeLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="h-48 w-full" />
        <div className="container mx-auto px-4 py-6 space-y-3">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Store not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-secondary border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 flex items-center justify-between h-14">
          <Link to="/stores" className="flex items-center gap-2 text-secondary-foreground/70 hover:text-secondary-foreground">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">Stores</span>
          </Link>
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon" className="text-secondary-foreground/70">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Store banner */}
      {store.cover_image && (
        <div className="h-44 overflow-hidden">
          <img src={store.cover_image} alt={store.name} className="w-full h-full object-cover" />
        </div>
      )}

      <main className="container mx-auto px-4 py-5 max-w-4xl">
        <div className="flex items-start gap-4 mb-5">
          {store.logo ? (
            <img src={store.logo} alt="" className="w-14 h-14 rounded-xl object-cover border border-border" />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <StoreIcon className="h-7 w-7 text-primary" />
            </div>
          )}
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">{store.name}</h1>
            {store.description && <p className="text-sm text-muted-foreground mt-1">{store.description}</p>}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={store.is_open ? "default" : "secondary"}>{store.is_open ? "Open" : "Closed"}</Badge>
              {store.delivery_fee != null && (
                <span className="text-xs text-muted-foreground">${store.delivery_fee} delivery</span>
              )}
            </div>
          </div>
        </div>

        {/* Search products */}
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>

        {/* Products grid */}
        {productsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border overflow-hidden">
                <Skeleton className="h-32 w-full" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No products found</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default StoreDetail;
