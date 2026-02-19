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

const StorePage = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const { addItem, items, updateQuantity, itemCount, total } = useCart();

  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: ["marketplace-store", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketplace_stores")
        .select("*")
        .eq("id", storeId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!storeId,
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["marketplace-products", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketplace_products")
        .select("*")
        .eq("store_id", storeId!)
        .eq("is_available", true)
        .order("category")
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!storeId,
  });

  const categories = useMemo(() => {
    const cats = [...new Set(products.map((p) => p.category || "Other"))];
    return cats;
  }, [products]);

  const getCartQuantity = (productId: string) => {
    const item = items.find((i) => i.id === productId);
    return item?.quantity || 0;
  };

  const formatPrice = (price: number) => `$${price.toLocaleString()}`;

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
          <Link to="/marketplace">
            <Button className="rounded-full">Back to Marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-bg pb-24 relative overflow-hidden">
      {/* Particles */}
      <div className="particle w-3 h-3 bg-primary/15 top-28 left-[8%]" style={{ animationDelay: '0s' }} />
      <div className="particle w-2 h-2 bg-accent/10 top-60 right-[10%]" style={{ animationDelay: '2s' }} />

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

      {/* Store Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-10 md:py-16 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center text-3xl md:text-4xl shadow-xl">
              {store.category === "Fast Food" ? "🍗" :
               store.category === "Pizza" ? "🍕" :
               store.category === "Coffee & Cafe" ? "☕" :
               store.category === "Chinese Restaurant" ? "🥡" :
               store.category === "Grill & Seafood" ? "🔥" : "🍽️"}
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">{store.name}</h1>
              <p className="text-muted-foreground text-sm mt-1">{store.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={store.is_open ? "default" : "secondary"} className="rounded-full">
                  {store.is_open ? "Open Now" : "Closed"}
                </Badge>
                <span className="text-xs text-muted-foreground">{store.category}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Category nav */}
      <div className="sticky top-14 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
            {categories.map((cat) => (
              <a
                key={cat}
                href={`#cat-${cat.replace(/\s+/g, "-")}`}
                className="whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium bg-card/80 backdrop-blur-sm border border-border/50 text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
              >
                {cat}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Products */}
      <main className="container mx-auto px-4 py-6 relative z-10">
        {productsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 bg-card/80 rounded-xl animate-pulse border border-border/50" />
            ))}
          </div>
        ) : (
          categories.map((cat) => (
            <section key={cat} id={`cat-${cat.replace(/\s+/g, "-")}`} className="mb-8">
              <h2 className="font-display text-lg font-bold text-foreground mb-4 sticky top-[7.5rem] bg-background/80 backdrop-blur-xl py-2 z-30">
                {cat}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {products
                  .filter((p) => (p.category || "Other") === cat)
                  .map((product) => {
                    const qty = getCartQuantity(product.id);
                    return (
                      <div
                        key={product.id}
                        className="flex items-center justify-between bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-4 hover:border-primary/20 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex-1 min-w-0 mr-3">
                          <h3 className="font-medium text-card-foreground text-sm truncate">{product.name}</h3>
                          <p className="text-primary font-display font-bold text-sm mt-1">
                            {formatPrice(product.price)} <span className="text-xs font-normal text-muted-foreground">GYD</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {qty > 0 ? (
                            <>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={() => updateQuantity(product.id, qty - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center font-bold text-sm text-foreground">{qty}</span>
                              <Button
                                size="icon"
                                className="h-8 w-8 rounded-full gradient-primary"
                                onClick={() => addItem({ id: product.id, name: product.name, price: product.price, store_id: store.id, store_name: store.name })}
                              >
                                <Plus className="h-3 w-3 text-primary-foreground" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="icon"
                              className="h-8 w-8 rounded-full gradient-primary"
                              onClick={() => addItem({ id: product.id, name: product.name, price: product.price, store_id: store.id, store_name: store.name })}
                            >
                              <Plus className="h-3 w-3 text-primary-foreground" />
                            </Button>
                          )}
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
              <Button className="w-full h-12 rounded-full text-base font-bold gradient-primary text-primary-foreground shadow-lg shadow-primary/20">
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
