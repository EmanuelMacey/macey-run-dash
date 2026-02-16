import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import logo from "@/assets/logo.png";
import CartSheet from "@/components/marketplace/CartSheet";

const Marketplace = () => {
  const [search, setSearch] = useState("");
  const { itemCount } = useCart();

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ["marketplace-stores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketplace_stores")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const filtered = stores.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  const categories = [...new Set(stores.map((s) => s.category))];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-secondary border-b border-border">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="MaceyRunners" className="w-9 h-9 rounded-lg object-cover" />
            <span className="font-display font-bold text-lg text-secondary-foreground">MaceyRunners</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-secondary-foreground/70 hover:text-secondary-foreground transition-colors hidden sm:block">
              Sign In
            </Link>
            <CartSheet>
              <button className="relative p-2 text-secondary-foreground/70 hover:text-secondary-foreground transition-colors">
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {itemCount}
                  </span>
                )}
              </button>
            </CartSheet>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-secondary py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-3xl md:text-5xl font-bold text-secondary-foreground mb-3">
            Order from your favourite restaurants
          </h1>
          <p className="text-secondary-foreground/60 mb-8 max-w-lg mx-auto">
            Fast delivery from the best local spots, straight to your door.
          </p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search restaurants or cuisines..."
              className="pl-12 h-12 rounded-full bg-background border-border text-foreground text-base"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSearch("")}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              search === "" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSearch(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                search === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Store Grid */}
      <main className="container mx-auto px-4 pb-16">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card rounded-2xl overflow-hidden animate-pulse">
                <div className="h-40 bg-muted" />
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
            {filtered.map((store) => (
              <Link
                key={store.id}
                to={`/store/${store.id}`}
                className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="h-40 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <span className="text-5xl">
                    {store.category === "Fast Food" ? "🍗" :
                     store.category === "Pizza" ? "🍕" :
                     store.category === "Coffee & Cafe" ? "☕" :
                     store.category === "Chinese Restaurant" ? "🥡" :
                     store.category === "Grill & Seafood" ? "🔥" : "🍽️"}
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-display font-bold text-lg text-card-foreground group-hover:text-primary transition-colors">
                      {store.name}
                    </h3>
                    <Badge variant={store.is_open ? "default" : "secondary"} className="text-xs shrink-0 ml-2">
                      {store.is_open ? "Open" : "Closed"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{store.category}</p>
                  <div className="flex items-center gap-1 text-muted-foreground text-xs">
                    <MapPin className="h-3 w-3" />
                    <span>Georgetown, Guyana</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Marketplace;
