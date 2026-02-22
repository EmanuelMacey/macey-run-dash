import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, Package, MapPin, ShoppingBag, User, FileText, UtensilsCrossed } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { unlockAudio } from "@/lib/notifications";
import logo from "@/assets/logo.png";
import NewOrderDialog from "@/components/customer/NewOrderDialog";
import NotificationBell from "@/components/customer/NotificationBell";
import OrdersList from "@/components/customer/OrdersList";
import MarketplaceBrowser from "@/components/customer/MarketplaceBrowser";
import CustomerProfile from "@/components/customer/CustomerProfile";
import CustomerInvoices from "@/components/customer/CustomerInvoices";
import PromoBanner from "@/components/customer/PromoBanner";
import ThemeToggle from "@/components/ThemeToggle";
import { motion } from "framer-motion";

const CustomerDashboard = () => {
  const { signOut } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState("order");

  return (
    <div className="min-h-screen mesh-bg" onClick={unlockAudio}>
      {/* Decorative particles */}
      <div className="particle w-3 h-3 bg-primary/20 top-20 left-[10%]" style={{ animationDelay: '0s' }} />
      <div className="particle w-2 h-2 bg-accent/20 top-40 right-[15%]" style={{ animationDelay: '2s' }} />
      <div className="particle w-4 h-4 bg-primary/10 bottom-32 left-[20%]" style={{ animationDelay: '4s' }} />

      <header className="bg-secondary dark:bg-secondary/95 backdrop-blur-xl border-b border-border/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <img src={logo} alt="MaceyRunners" className="h-8 w-auto" />
            <span className="font-display font-bold text-lg text-secondary-foreground">MaceyRunners</span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <NotificationBell />
            <Button variant="ghost" onClick={signOut} className="text-secondary-foreground/70 hover:text-secondary-foreground">
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl relative">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-4 mb-6 h-12 rounded-2xl bg-card/80 dark:bg-card/50 backdrop-blur-sm p-1 border border-border/50">
            <TabsTrigger value="order" className="gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md font-semibold transition-all">
              <Package className="h-4 w-4" /> <span className="hidden sm:inline">Services</span>
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md font-semibold transition-all">
              <ShoppingBag className="h-4 w-4" /> <span className="hidden sm:inline">Food</span>
            </TabsTrigger>
            <TabsTrigger value="invoices" className="gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md font-semibold transition-all">
              <FileText className="h-4 w-4" /> <span className="hidden sm:inline">Invoices</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md font-semibold transition-all">
              <User className="h-4 w-4" /> <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="order" className="animate-fade-in">
            <PromoBanner />
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Welcome back! 👋</h1>
            <p className="text-muted-foreground mb-6">What do you need delivered today?</p>

            {/* Food Section Card */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setActiveTab("marketplace")}
              className="w-full mb-6 bg-card/90 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-4 text-left border border-border/50 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all"
            >
              <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <UtensilsCrossed className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-base font-semibold text-card-foreground">Browse Food & Restaurants</h3>
                <p className="text-muted-foreground text-xs">Order from local restaurants for delivery</p>
              </div>
              <span className="text-muted-foreground text-lg">›</span>
            </motion.button>

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

          <TabsContent value="invoices" className="animate-fade-in">
            <CustomerInvoices />
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
