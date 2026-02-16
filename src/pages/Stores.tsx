import { useState } from "react";
import { Link } from "react-router-dom";
import { useStores } from "@/hooks/useStores";
import { useCart } from "@/hooks/useCart";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ShoppingCart, ArrowLeft, Store as StoreIcon, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import type { Store } from "@/types/store";

const StoreCard = ({ store }: { store: Store }) => (
  <Link
    to={`/stores/${store.id}`}
    className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 transition-all group"
  >
    {store.cover_image ? (
      <div className="h-36 overflow-hidden">
        <img src={store.cover_image} alt={store.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      </div>
    ) : (
      <div className="h-36 bg-muted flex items-center justify-center">
        <StoreIcon className="h-10 w-10 text-muted-foreground" />
      </div>
    )}
    <div className="p-4">
      <div className="flex items-start gap-3">
        {store.logo ? (
          <img src={store.logo} alt="" className="w-10 h-10 rounded-lg object-cover border border-border flex-shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <StoreIcon className="h-5 w-5 text-primary" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-display font-bold text-card-foreground truncate">{store.name}</h3>
          {store.address && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3" /> {store.address}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3">
        <Badge variant={store.is_open ? "default" : "secondary"} className="text-xs">
          {store.is_open ? "Open" : "Closed"}
        </Badge>
        {store.is_featured && <Badge variant="outline" className="text-xs border-accent text-accent">Featured</Badge>}
        {store.delivery_fee != null && (
          <span className="text-xs text-muted-foreground ml-auto">${store.delivery_fee} delivery</span>
        )}
      </div>
    </div>
  </Link>
);

const Stores = () => {
  const [search, setSearch] = useState("");
  const { data: stores, isLoading } = useStores(search || undefined);
  const { itemCount } = useCart();

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-secondary border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 flex items-center justify-between h-14">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img src={logo} alt="MaceyRunners" className="h-7 w-auto" />
            <span className="font-display font-bold text-secondary-foreground">MaceyRunners</span>
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

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <h1 className="font-display text-2xl font-bold text-foreground mb-1">Stores</h1>
        <p className="text-muted-foreground text-sm mb-5">Browse stores and order what you need</p>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search stores…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-border">
                <Skeleton className="h-36 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : stores && stores.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <StoreIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No stores found</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Stores;
