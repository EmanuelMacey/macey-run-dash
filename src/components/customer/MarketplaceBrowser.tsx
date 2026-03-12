import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, ArrowLeft, Plus, Minus, ShoppingBag, Star, Clock } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import CartSheet from "@/components/marketplace/CartSheet";
import FoodOrderTracker from "@/components/customer/FoodOrderTracker";

import churchsImg from "@/assets/stores/churches-chicken.png";
import eggballImg from "@/assets/stores/exclusive-eggball.jpeg";
import firesideImg from "@/assets/stores/fireside-grill.jpg";
import gangbaoImg from "@/assets/stores/gangbao.jpg";
import goldenPagodaImg from "@/assets/stores/golden-pagoda.png";
import kfcImg from "@/assets/stores/kfc.jpg";
import kamboatImg from "@/assets/stores/kamboat.png";
import pizzahutImg from "@/assets/stores/pizzahut.png";
import popeyesImg from "@/assets/stores/popeyes.jpg";
import starbucksImg from "@/assets/stores/starbucks.jpg";
import whiteCastleImg from "@/assets/stores/white-castle.jpg";

const storeImageMap: Record<string, string> = {
  "Church's Chicken": churchsImg,
  "Exclusive Eggball": eggballImg,
  "Fireside Grill and Chill": firesideImg,
  "Gangbao": gangbaoImg,
  "Golden Pagoda": goldenPagodaImg,
  "KFC": kfcImg,
  "Kamboat Restaurant": kamboatImg,
  "Pizza Hut": pizzahutImg,
  "Popeyes": popeyesImg,
  "Starbucks": starbucksImg,
  "White Castle": whiteCastleImg,
};

interface MarketplaceBrowserProps {
  initialStoreId?: string | null;
  initialProductId?: string | null;
  onStoreOpened?: () => void;
}

const MarketplaceBrowser = ({ initialStoreId, initialProductId, onStoreOpened }: MarketplaceBrowserProps) => {
  const [search, setSearch] = useState("");
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [highlightProductId, setHighlightProductId] = useState<string | null>(null);
  const { addItem, items, updateQuantity, itemCount, total } = useCart();

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ["marketplace-stores"],
    queryFn: async () => {
      const { data, error } = await supabase.from("marketplace_stores").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (initialStoreId && stores.length > 0) {
      const storeExists = stores.find(s => s.id === initialStoreId);
      if (storeExists) {
        setSelectedStoreId(initialStoreId);
        if (initialProductId) setHighlightProductId(initialProductId);
        onStoreOpened?.();
      }
    }
  }, [initialStoreId, initialProductId, stores, onStoreOpened]);

  useEffect(() => {
    if (highlightProductId) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`product-${highlightProductId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("ring-2", "ring-primary", "ring-offset-2");
          setTimeout(() => {
            el.classList.remove("ring-2", "ring-primary", "ring-offset-2");
            setHighlightProductId(null);
          }, 3000);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [highlightProductId]);

  const selectedStore = stores.find((s) => s.id === selectedStoreId);

  const { data: products = [] } = useQuery({
    queryKey: ["marketplace-products", selectedStoreId],
    queryFn: async () => {
      const { data, error } = await supabase.from("marketplace_products").select("*").eq("store_id", selectedStoreId!).eq("is_available", true).order("category").order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!selectedStoreId,
  });

  const filtered = stores.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase())
  );

  const categories = [...new Set(stores.map((s) => s.category))];
  const productCategories = [...new Set(products.map((p) => p.category || "Other"))];
  const getCartQuantity = (productId: string) => items.find((i) => i.id === productId)?.quantity || 0;
  const formatPrice = (price: number) => `$${price.toLocaleString()}`;
  const getStoreImage = (name: string, imageUrl?: string | null) => imageUrl || storeImageMap[name] || null;

  // Store detail view
  if (selectedStore) {
    return (
      <div className="pb-20">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => { setSelectedStoreId(null); setHighlightProductId(null); }} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
            <ArrowLeft className="h-4 w-4" /> All Stores
          </button>
          <CartSheet>
            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 gradient-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </button>
          </CartSheet>
        </div>

        {/* Store banner */}
        <div className="relative rounded-2xl overflow-hidden mb-6">
          <div className="h-40 bg-gradient-to-br from-primary/20 via-accent/10 to-transparent flex items-center justify-center overflow-hidden">
            {getStoreImage(selectedStore.name, selectedStore.image_url) ? (
              <img src={getStoreImage(selectedStore.name, selectedStore.image_url)!} alt={selectedStore.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-5xl">🍽️</span>
            )}
          </div>
          <div className="p-4">
            <h2 className="font-display text-xl font-bold text-foreground">{selectedStore.name}</h2>
            <p className="text-muted-foreground text-xs mt-0.5">{selectedStore.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={selectedStore.is_open ? "default" : "secondary"} className="text-xs rounded-full">
                {selectedStore.is_open ? "Open" : "Closed"}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> 15-25 min</span>
            </div>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-hide">
          {productCategories.map((cat) => (
            <a key={cat} href={`#cat-${cat.replace(/\s+/g, "-")}`}
              className="whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
              {cat}
            </a>
          ))}
        </div>

        {/* Products - grid with images */}
        {productCategories.map((cat) => (
          <section key={cat} id={`cat-${cat.replace(/\s+/g, "-")}`} className="mb-6">
            <h3 className="font-display text-sm font-bold text-foreground mb-3">{cat}</h3>
            <div className="grid grid-cols-2 gap-3">
              {products.filter((p) => (p.category || "Other") === cat).map((product) => {
                const qty = getCartQuantity(product.id);
                return (
                  <div key={product.id} id={`product-${product.id}`} className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/20 hover:shadow-sm transition-all">
                    {/* Product image */}
                    <div className="relative h-28 bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center overflow-hidden">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl opacity-40">🍽️</span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{cat}</p>
                      <h4 className="font-display font-bold text-sm text-card-foreground truncate mt-0.5">{product.name}</h4>
                      {product.description && (
                        <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{product.description}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-accent font-display font-bold text-sm">
                          GYD{formatPrice(product.price)}
                        </p>
                        <div className="flex items-center gap-1">
                          {qty > 0 ? (
                            <>
                              <Button variant="outline" size="icon" className="h-6 w-6 rounded-full" onClick={() => updateQuantity(product.id, qty - 1)}>
                                <Minus className="h-2.5 w-2.5" />
                              </Button>
                              <span className="w-5 text-center font-bold text-xs text-foreground">{qty}</span>
                              <Button size="icon" className="h-6 w-6 rounded-full gradient-primary text-primary-foreground" onClick={() => addItem({ id: product.id, name: product.name, price: product.price, store_id: selectedStore.id, store_name: selectedStore.name })}>
                                <Plus className="h-2.5 w-2.5" />
                              </Button>
                            </>
                          ) : (
                            <Button size="icon" className="h-7 w-7 rounded-full gradient-primary text-primary-foreground" onClick={() => addItem({ id: product.id, name: product.name, price: product.price, store_id: selectedStore.id, store_name: selectedStore.name })}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {itemCount > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border p-3">
            <div className="container mx-auto max-w-2xl">
              <CartSheet>
                <Button className="w-full h-12 rounded-full text-sm font-bold gradient-primary text-primary-foreground shadow-lg">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  View Cart ({itemCount}) — {formatPrice(total)} GYD
                </Button>
              </CartSheet>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Store list view
  return (
    <div>
      <FoodOrderTracker />

      <h2 className="font-display text-2xl font-bold text-foreground mb-1">Order Food 🍔</h2>
      <p className="text-muted-foreground text-sm mb-4">From your favourite local restaurants</p>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search restaurants or cuisines..."
          className="pl-10 h-11 rounded-full bg-muted/50 border-border text-sm" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        <button onClick={() => setSearch("")}
          className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${search === "" ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
          All
        </button>
        {categories.map((cat) => (
          <button key={cat} onClick={() => setSearch(cat)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${search === cat ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card rounded-2xl overflow-hidden animate-pulse">
              <div className="h-28 bg-muted" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-3 bg-muted rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No restaurants found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((store) => (
            <button key={store.id} onClick={() => setSelectedStoreId(store.id)}
              className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300 text-left">
              <div className="relative h-28 bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center overflow-hidden">
                {getStoreImage(store.name, store.image_url) ? (
                  <img src={getStoreImage(store.name, store.image_url)!} alt={store.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <span className="text-4xl group-hover:scale-110 transition-transform">🍽️</span>
                )}
                {!store.is_open && (
                  <div className="absolute inset-0 bg-secondary/60 flex items-center justify-center">
                    <span className="text-secondary-foreground font-semibold text-xs">Closed</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-display font-bold text-sm text-card-foreground group-hover:text-primary transition-colors truncate">
                  {store.name}
                </h3>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs text-muted-foreground">{store.category}</span>
                  <div className="flex items-center gap-1 text-xs text-warning">
                    <Star className="h-3 w-3 fill-current" />
                    <span className="font-medium">4.8</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>15-25 min</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketplaceBrowser;
