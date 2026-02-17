import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, Package, MapPin, ShoppingBag, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { unlockAudio } from "@/lib/notifications";
import logo from "@/assets/logo.png";
import NewOrderDialog from "@/components/customer/NewOrderDialog";
import NotificationBell from "@/components/customer/NotificationBell";
import OrdersList from "@/components/customer/OrdersList";
import MarketplaceBrowser from "@/components/customer/MarketplaceBrowser";
import CustomerProfile from "@/components/customer/CustomerProfile";
import ThemeToggle from "@/components/ThemeToggle";

const CustomerDashboard = () => {
  const { signOut } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen mesh-bg" onClick={unlockAudio}>
      {/* Decorative particles */}
      <div className="particle w-3 h-3 bg-primary/20 top-20 left-[10%]" style={{ animationDelay: '0s' }} />
      <div className="particle w-2 h-2 bg-accent/20 top-40 right-[15%]" style={{ animationDelay: '2s' }} />
      <div className="particle w-4 h-4 bg-primary/10 bottom-32 left-[20%]" style={{ animationDelay: '4s' }} />

      <header className="bg-navy dark:bg-secondary/95 backdrop-blur-xl border-b border-navy/20 dark:border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <img src={logo} alt="MaceyRunners" className="h-8 w-auto" />
            <span className="font-display font-bold text-lg text-navy-foreground dark:text-white">MaceyRunners</span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <NotificationBell />
            <Button variant="ghost" onClick={signOut} className="text-navy-foreground/70 hover:text-navy-foreground dark:text-white/70 dark:hover:text-white">
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl relative">
        <Tabs defaultValue="order" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-6 h-12 rounded-2xl bg-card/80 dark:bg-white/5 backdrop-blur-sm p-1 border border-navy/10 dark:border-white/10">
            <TabsTrigger value="order" className="gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md font-semibold transition-all">
              <Package className="h-4 w-4" /> Services
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md font-semibold transition-all">
              <ShoppingBag className="h-4 w-4" /> Order Food
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md font-semibold transition-all">
              <User className="h-4 w-4" /> Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="order" className="animate-fade-in">
            <h1 className="font-display text-3xl font-bold text-navy dark:text-white mb-2">Welcome back! 👋</h1>
            <p className="text-muted-foreground mb-8">What do you need delivered today?</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <NewOrderDialog onOrderCreated={() => setRefreshKey((k) => k + 1)}>
                <button className="bg-card/90 backdrop-blur-sm border border-border/50 rounded-2xl p-5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 text-left group glow-card">
                  <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-primary/20">
                    <Package className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-card-foreground mb-1">Delivery</h3>
                  <p className="text-muted-foreground text-xs mb-2">Send a package A → B</p>
                  <p className="font-display text-xl font-bold text-primary">
                    $1,000 <span className="text-xs font-normal text-muted-foreground">GYD</span>
                  </p>
                </button>
              </NewOrderDialog>

              <NewOrderDialog onOrderCreated={() => setRefreshKey((k) => k + 1)}>
                <button className="bg-card/90 backdrop-blur-sm border border-border/50 rounded-2xl p-5 hover:border-accent/50 hover:shadow-xl hover:shadow-accent/5 transition-all duration-300 text-left group glow-card">
                  <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-accent/20">
                    <MapPin className="h-5 w-5 text-accent-foreground" />
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

          <TabsContent value="marketplace" className="animate-fade-in">
            <MarketplaceBrowser />
          </TabsContent>

          <TabsContent value="profile" className="animate-fade-in">
            <CustomerProfile />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CustomerDashboard;
