import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, Package, MapPin, ShoppingBag } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { unlockAudio } from "@/lib/notifications";
import logo from "@/assets/logo.png";
import NewOrderDialog from "@/components/customer/NewOrderDialog";
import NotificationBell from "@/components/customer/NotificationBell";
import OrdersList from "@/components/customer/OrdersList";
import MarketplaceBrowser from "@/components/customer/MarketplaceBrowser";

const CustomerDashboard = () => {
  const { signOut } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen bg-background" onClick={unlockAudio}>
      <header className="bg-secondary border-b border-border">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <img src={logo} alt="MaceyRunners" className="h-8 w-auto" />
            <span className="font-display font-bold text-lg text-secondary-foreground">MaceyRunners</span>
          </div>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <Button variant="ghost" onClick={signOut} className="text-secondary-foreground/70 hover:text-secondary-foreground">
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <Tabs defaultValue="order" className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-6">
            <TabsTrigger value="order" className="gap-2">
              <Package className="h-4 w-4" /> Services
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="gap-2">
              <ShoppingBag className="h-4 w-4" /> Order Food
            </TabsTrigger>
          </TabsList>

          <TabsContent value="order">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Welcome back!</h1>
            <p className="text-muted-foreground mb-8">What do you need delivered today?</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <NewOrderDialog onOrderCreated={() => setRefreshKey((k) => k + 1)}>
                <button className="bg-card border border-border rounded-2xl p-5 hover:border-primary/50 transition-colors text-left group">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-card-foreground mb-1">Delivery</h3>
                  <p className="text-muted-foreground text-xs mb-2">Send a package A → B</p>
                  <p className="font-display text-xl font-bold text-primary">
                    $1,000 <span className="text-xs font-normal text-muted-foreground">GYD</span>
                  </p>
                </button>
              </NewOrderDialog>

              <NewOrderDialog onOrderCreated={() => setRefreshKey((k) => k + 1)}>
                <button className="bg-card border border-border rounded-2xl p-5 hover:border-accent/50 transition-colors text-left group">
                  <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mb-3">
                    <MapPin className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-card-foreground mb-1">Errand</h3>
                  <p className="text-muted-foreground text-xs mb-2">We'll run it for you</p>
                  <p className="font-display text-xl font-bold text-accent">
                    $1,500 <span className="text-xs font-normal text-muted-foreground">GYD</span>
                  </p>
                </button>
              </NewOrderDialog>
            </div>

            <OrdersList refreshKey={refreshKey} />
          </TabsContent>

          <TabsContent value="marketplace">
            <MarketplaceBrowser />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CustomerDashboard;
