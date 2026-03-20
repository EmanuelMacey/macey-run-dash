import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, ShoppingBag, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/hooks/useCart";
import CartSheet from "@/components/marketplace/CartSheet";
import logo from "@/assets/logo.png";

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

const StorePage = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const { addItem, items, updateQuantity, itemCount, total } = useCart();

  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: ["marketplace-store", storeId],
    queryFn: async () => {
      const { data, error } = await supabase.from("marketplace_stores").select("*").eq("id", storeId!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!storeId,
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["marketplace-products", storeId],
    queryFn: async () => {
      const { data, error } = await supabase.from("marketplace_products").select("*").eq("store_id", storeId!).eq("is_available", true).order("category").order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!storeId,
  });

  const categories = useMemo(() => [...new Set(products.map((p) => p.category || "Other"))], [products]);
  const getCartQuantity = (productId: string) => items.find((i) => i.id === productId)?.quantity || 0;
  const formatPrice = (price: number) => `$${price.toLocaleString()}`;
  const getStoreImage = (name: string, imageUrl?: string | null) => imageUrl || storeImageMap[name] || null;

  if (storeLoading) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Store not found</p>
          <Link to="/marketplace"><Button className="rounded-full">Back to Marketplace</Button></Link>
        </div>
      </div>
    );
  }

  const bannerImage = getStoreImage(store.name, store.image_url);

  return (
    <div className="min-h-screen mesh-bg pb-24 relative overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-navy/70 dark:bg-secondary/70 backdrop-blur-2xl border-b border-navy/10 dark:border-white/10">
        <div className="container mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link to="/marketplace" className="text-navy-foreground/70 dark:text-white/70 hover:text-primary transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="MaceyRunners" className="w-7 h-7 rounded-lg object-cover ring-1 ring-primary/20" />
            </Link>
          </div>
          <CartSheet>
            <button className="relative p-2 text-navy-foreground/70 dark:text-white/70 hover:text-primary transition-colors">
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 gradient-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </button>
          </CartSheet>
        </div>
      </header>

      {/* Store Banner with image */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
        {bannerImage ? (
          <div className="h-48 md:h-64 overflow-hidden">
            <img src={bannerImage} alt={store.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
          </div>
        ) : (
          <div className="h-32 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        )}
        <div className="container mx-auto px-4 relative z-10 -mt-12">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">{store.name}</h1>
          <p className="text-muted-foreground text-sm mt-1">{store.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={store.is_open ? "default" : "secondary"} className="rounded-full">
              {store.is_open ? "Open Now" : "Closed"}
            </Badge>
            <span className="text-xs text-muted-foreground">{store.category}</span>
          </div>
        </div>
      </motion.div>

      {/* Category nav */}
      <div className="sticky top-14 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 mt-4">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
            {categories.map((cat) => (
              <a key={cat} href={`#cat-${cat.replace(/\s+/g, "-")}`}
                className="whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium bg-card/80 border border-border/50 text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:border-accent transition-colors">
                {cat}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Products - visual grid */}
      <main className="container mx-auto px-4 py-6 relative z-10">
        {productsLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card/80 rounded-2xl overflow-hidden animate-pulse border border-border/50">
                <div className="h-32 bg-muted" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-muted rounded w-2/3" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          categories.map((cat) => (
            <section key={cat} id={`cat-${cat.replace(/\s+/g, "-")}`} className="mb-8">
              <h2 className="font-display text-lg font-bold text-foreground mb-4 sticky top-[7.5rem] bg-background/80 backdrop-blur-xl py-2 z-30">
                {cat}
              </h2>
              <div className="space-y-2">
                {products.filter((p) => (p.category || "Other") === cat).map((product) => {
                  const qty = getCartQuantity(product.id);
                  return (
                    <div key={product.id} className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-3 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display font-bold text-sm text-card-foreground">{product.name}</h3>
                          {product.description && (
                            <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{product.description}</p>
                          )}
                          <p className="text-accent font-display font-bold text-sm mt-1.5">
                            GYD{formatPrice(product.price)}
                          </p>
                        </div>
                        <div className="shrink-0">
                          {qty > 0 ? (
                            <div className="flex items-center gap-1">
                              <Button variant="outline" size="icon" className="h-7 w-7 rounded-full" onClick={() => updateQuantity(product.id, qty - 1)}>
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-6 text-center font-bold text-xs text-foreground">{qty}</span>
                              <Button size="icon" className="h-7 w-7 rounded-full gradient-primary" onClick={() => addItem({ id: product.id, name: product.name, price: product.price, store_id: store.id, store_name: store.name })}>
                                <Plus className="h-3 w-3 text-primary-foreground" />
                              </Button>
                            </div>
                          ) : (
                            <Button size="icon" className="h-8 w-8 rounded-full gradient-primary" onClick={() => addItem({ id: product.id, name: product.name, price: product.price, store_id: store.id, store_name: store.name })}>
                              <Plus className="h-3 w-3 text-primary-foreground" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </main>

      {/* Sticky cart bar */}
      {itemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border/50 p-4">
          <div className="container mx-auto max-w-2xl">
            <CartSheet>
              <Button className="w-full h-12 rounded-full text-base font-bold bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg shadow-accent/20">
                <ShoppingBag className="h-5 w-5 mr-2" />
                View Cart ({itemCount}) — {formatPrice(total)} GYD
              </Button>
            </CartSheet>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorePage;
