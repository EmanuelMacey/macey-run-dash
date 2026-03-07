import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ShoppingBag, Star, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/hooks/useCart";
import logo from "@/assets/logo.png";
import CartSheet from "@/components/marketplace/CartSheet";

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
  "Fireside Grill and Chill": firesideImg,
  "Gangbao": gangbaoImg,
  "Golden Pagoda": goldenPagodaImg,
  "KFC": kfcImg,
  "Pizza Hut": pizzahutImg,
  "Popeyes": popeyesImg,
  "Starbucks": starbucksImg,
  "White Castle": whiteCastleImg,
};

const Marketplace = () => {
  const [search, setSearch] = useState("");
  const { itemCount } = useCart();

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ["marketplace-stores"],
    queryFn: async () => {
      const { data, error } = await supabase.from("marketplace_stores").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const filtered = stores.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase())
  );

  const categories = [...new Set(stores.map((s) => s.category))];
  const getStoreImage = (name: string) => storeImageMap[name] || null;

  return (
    <div className="min-h-screen mesh-bg relative overflow-hidden">
      {/* Particles */}
      <div className="particle w-3 h-3 bg-primary/15 top-28 left-[8%]" style={{ animationDelay: '0s' }} />
      <div className="particle w-2 h-2 bg-accent/15 top-56 right-[12%]" style={{ animationDelay: '3s' }} />

      <header className="sticky top-0 z-50 bg-navy/70 dark:bg-secondary/70 backdrop-blur-2xl border-b border-navy/10 dark:border-white/10">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="MaceyRunners" className="w-9 h-9 rounded-xl object-cover shadow-sm ring-1 ring-primary/20" />
            <span className="font-display font-bold text-lg text-navy-foreground dark:text-white">MaceyRunners</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-navy-foreground/70 dark:text-white/70 hover:text-primary transition-colors hidden sm:block font-medium">Sign In</Link>
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
        </div>
      </header>

      <section className="py-12 md:py-20 relative overflow-hidden">
        {/* Gradient orb */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 -right-32 w-[400px] h-[400px] bg-primary/15 rounded-full blur-[120px]"
        />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl md:text-5xl font-bold text-foreground mb-3"
          >
            Order from your <span className="gradient-text">favourite</span> restaurants
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground mb-8 max-w-lg mx-auto"
          >
            Fast delivery from the best local spots, straight to your door.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative max-w-xl mx-auto"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search restaurants or cuisines..."
              className="pl-12 h-12 rounded-full bg-card/80 backdrop-blur-sm border-border/50 text-foreground text-base shadow-xl" />
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-6 relative z-10">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button onClick={() => setSearch("")}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all ${search === "" ? "gradient-primary text-primary-foreground shadow-md" : "bg-card/80 backdrop-blur-sm text-muted-foreground hover:bg-card border border-border/50"}`}>
            All
          </button>
          {categories.map((cat) => (
            <button key={cat} onClick={() => setSearch(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all ${search === cat ? "gradient-primary text-primary-foreground shadow-md" : "bg-card/80 backdrop-blur-sm text-muted-foreground hover:bg-card border border-border/50"}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <main className="container mx-auto px-4 pb-16 relative z-10">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card/80 rounded-3xl overflow-hidden animate-pulse border border-border/50">
                <div className="h-44 bg-muted" />
                <div className="p-4 space-y-2">
                  <div className="h-5 bg-muted rounded w-2/3" />
                  <div className="h-4 bg-muted rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No restaurants found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((store, i) => (
              <motion.div
                key={store.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/store/${store.id}`}
                  className="group block bg-card/80 backdrop-blur-sm rounded-3xl overflow-hidden border border-border/50 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300">
                  <div className="relative h-44 bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center overflow-hidden">
                    {getStoreImage(store.name) ? (
                      <img src={getStoreImage(store.name)!} alt={store.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <span className="text-5xl group-hover:scale-110 transition-transform">🍽️</span>
                    )}
                    {!store.is_open && (
                      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-foreground font-semibold text-sm">Currently Closed</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-display font-bold text-lg text-card-foreground group-hover:text-primary transition-colors">
                        {store.name}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{store.category}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 text-warning font-medium">
                        <Star className="h-3 w-3 fill-current" /> 4.8
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> 15-25 min
                      </span>
                      <Badge variant={store.is_open ? "default" : "secondary"} className="text-[10px] rounded-full">
                        {store.is_open ? "Open" : "Closed"}
                      </Badge>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Marketplace;
