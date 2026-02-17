import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, ArrowLeft, Plus, Minus, ShoppingBag, Star, Clock, ChevronRight } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import CartSheet from "@/components/marketplace/CartSheet";
import FoodOrderTracker from "@/components/customer/FoodOrderTracker";

import churchsImg from "@/assets/stores/churches-chicken.png";
import eggballImg from "@/assets/stores/exclusive-eggball.jpeg";
import firesideImg from "@/assets/stores/fireside-grill.jpg";
import gangbaoImg from "@/assets/stores/gangbao.jpg";
import goldenPagodaImg from "@/assets/stores/golden-pagoda.png";
import kfcImg from "@/assets/stores/kfc.jpg";
import pizzahutImg from "@/assets/stores/pizzahut.png";
import popeyesImg from "@/assets/stores/popeyes.jpg";
import starbucksImg from "@/assets/stores/starbucks.jpg";
import whiteCastleImg from "@/assets/stores/white-castle.jpg";

const storeImageMap: Record<string, string> = {
  "Church's Chicken": churchsImg,
  "Exclusive Eggball": eggballImg,
  "Fireside Grill & Chill": firesideImg,
  "Gangbao": gangbaoImg,
  "Golden Pagoda": goldenPagodaImg,
  "KFC": kfcImg,
  "Pizza Hut": pizzahutImg,
  "Popeyes": popeyesImg,
  "Starbucks": starbucksImg,
  "White Castle Fish Shop": whiteCastleImg,
};

const MarketplaceBrowser = () => {
  const [search, setSearch] = useState("");
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const { addItem, items, updateQuantity, itemCount, total } = useCart();

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ["marketplace-stores"],
    queryFn: async () => {
      const { data, error } = await supabase.from("marketplace_stores").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

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

  const filtered = stores.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(stores.map((s) => s.category))];
  const productCategories = [...new Set(products.map((p) => p.category || "Other"))];
  const getCartQuantity = (productId: string) => items.find((i) => i.id === productId)?.quantity || 0;
  const formatPrice = (price: number) => `$${price.toLocaleString()}`;
  const getStoreImage = (name: string) => storeImageMap[name] || null;

  // Store detail view
  if (selectedStore) {
    return (
      <div className="pb-20">
        {/* Store header with back */}
        <div className="sticky top-14 z-40 bg-card/95 backdrop-blur-xl border-b border-border/40 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSelectedStoreId(null)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h2 className="font-display font-bold text-sm text-foreground truncate mx-4">{selectedStore.name}</h2>
          <CartSheet>
            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </button>
          </CartSheet>
        </div>

        {/* Store banner */}
        <div className="relative">
          <div className="h-44 bg-gradient-to-br from-primary/10 via-accent/5 to-background flex items-center justify-center overflow-hidden">
            {getStoreImage(selectedStore.name) ? (
              <img src={getStoreImage(selectedStore.name)!} alt={selectedStore.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-6xl">🍽️</span>
            )}
          </div>
          <div className="px-4 py-4">
            <h2 className="font-display text-xl font-bold text-foreground">{selectedStore.name}</h2>
            <p className="text-muted-foreground text-xs mt-0.5">{selectedStore.description}</p>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1 text-xs">
                <Star className="h-3.5 w-3.5 text-accent fill-accent" />
                <span className="font-semibold text-foreground">4.8</span>
                <span className="text-muted-foreground">(200+)</span>
              </div>
              <span className="text-border">•</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> 15-25 min</span>
              <span className="text-border">•</span>
              <Badge variant={selectedStore.is_open ? "default" : "secondary"} className="text-[10px] h-5 rounded-full">
                {selectedStore.is_open ? "Open" : "Closed"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 mb-2 scrollbar-hide">
          {productCategories.map((cat) => (
            <a key={cat} href={`#cat-${cat.replace(/\s+/g, "-")}`}
              className="whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
              {cat}
            </a>
          ))}
        </div>

        {/* Products grouped */}
        <div className="px-4">
          {productCategories.map((cat) => (
            <section key={cat} id={`cat-${cat.replace(/\s+/g, "-")}`} className="mb-6">
              <h3 className="font-display text-sm font-bold text-foreground mb-3">{cat}</h3>
              <div className="space-y-2">
                {products.filter((p) => (p.category || "Other") === cat).map((product) => {
                  const qty = getCartQuantity(product.id);
                  return (
                    <div key={product.id} className="flex items-center justify-between bg-card border border-border rounded-xl p-3 hover:border-primary/20 transition-all">
                      <div className="flex-1 min-w-0 mr-3">
                        <h4 className="font-medium text-card-foreground text-sm truncate">{product.name}</h4>
                        {product.description && <p className="text-muted-foreground text-xs truncate">{product.description}</p>}
                        <p className="text-primary font-display font-bold text-sm mt-0.5">
                          {formatPrice(product.price)} <span className="text-xs font-normal text-muted-foreground">GYD</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {qty > 0 ? (
                          <>
                            <Button variant="outline" size="icon" className="h-7 w-7 rounded-full" onClick={() => updateQuantity(product.id, qty - 1)}>
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center font-bold text-xs text-foreground">{qty}</span>
                            <Button size="icon" className="h-7 w-7 rounded-full gradient-primary text-primary-foreground" onClick={() => addItem({ id: product.id, name: product.name, price: product.price, store_id: selectedStore.id, store_name: selectedStore.name })}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          </>
                        ) : (
                          <Button size="icon" className="h-8 w-8 rounded-full gradient-primary text-primary-foreground" onClick={() => addItem({ id: product.id, name: product.name, price: product.price, store_id: selectedStore.id, store_name: selectedStore.name })}>
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {/* Sticky cart bar */}
        {itemCount > 0 && (
          <div className="fixed bottom-16 left-0 right-0 z-50 px-4 pb-2">
            <CartSheet>
              <Button className="w-full h-12 rounded-full text-sm font-bold gradient-primary text-primary-foreground shadow-xl shadow-primary/20">
                <ShoppingBag className="h-4 w-4 mr-2" />
                View Cart ({itemCount}) — {formatPrice(total)} GYD
              </Button>
            </CartSheet>
          </div>
        )}
      </div>
    );
  }

  // ========== HOME / STORE LIST VIEW (Instacart-style) ==========
  return (
    <div className="pb-4">
      <FoodOrderTracker />

      {/* Hero greeting */}
      <div className="px-4 pt-5 pb-3">
        <h1 className="font-display text-xl font-bold text-foreground">What do you want to eat? 🍔</h1>
      </div>

      {/* Search bar */}
      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search restaurants or cuisines..."
            className="pl-10 h-11 rounded-full bg-muted border-transparent text-sm focus:border-primary" />
        </div>
      </div>

      {/* Category chips — horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-4 scrollbar-hide">
        <button onClick={() => setSelectedCategory("")}
          className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition-all ${
            selectedCategory === ""
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}>
          All
        </button>
        {categories.map((cat) => (
          <button key={cat} onClick={() => setSelectedCategory(selectedCategory === cat ? "" : cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              selectedCategory === cat
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Store grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 px-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card rounded-2xl overflow-hidden animate-pulse">
              <div className="h-36 bg-muted" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-3 bg-muted rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 px-4">
          <p className="text-muted-foreground text-sm">No restaurants found</p>
        </div>
      ) : (
        <div className="px-4 space-y-3">
          {filtered.map((store) => (
            <button key={store.id} onClick={() => setSelectedStoreId(store.id)}
              className="w-full group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 text-left">
              {/* Store image — large like Instacart */}
              <div className="relative h-36 bg-muted overflow-hidden">
                {getStoreImage(store.name) ? (
                  <img src={getStoreImage(store.name)!} alt={store.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
                    <span className="text-5xl">🍽️</span>
                  </div>
                )}
                {!store.is_open && (
                  <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center">
                    <span className="font-semibold text-sm text-muted-foreground">Currently Closed</span>
                  </div>
                )}
                {/* Delivery time badge */}
                <div className="absolute bottom-2 left-2 bg-card/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1 text-xs shadow-sm">
                  <Clock className="h-3 w-3 text-primary" />
                  <span className="font-semibold text-foreground">15-25 min</span>
                </div>
              </div>
              <div className="p-3 flex items-center justify-between">
                <div className="min-w-0">
                  <h3 className="font-display font-bold text-sm text-card-foreground group-hover:text-primary transition-colors truncate">
                    {store.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 text-accent fill-accent" />
                      <span className="text-xs font-semibold text-foreground">4.8</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{store.category}</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Sticky cart bar on home */}
      {itemCount > 0 && (
        <div className="fixed bottom-16 left-0 right-0 z-50 px-4 pb-2">
          <CartSheet>
            <Button className="w-full h-12 rounded-full text-sm font-bold gradient-primary text-primary-foreground shadow-xl shadow-primary/20">
              <ShoppingBag className="h-4 w-4 mr-2" />
              View Cart ({itemCount}) — {formatPrice(total)} GYD
            </Button>
          </CartSheet>
        </div>
      )}
    </div>
  );
};

export default MarketplaceBrowser;
