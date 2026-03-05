import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Package, MapPin, ShoppingBag, User, FileText, UtensilsCrossed, Gift, Users, Zap, TrendingUp, Clock, Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { unlockAudio } from "@/lib/notifications";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import NewOrderDialog from "@/components/customer/NewOrderDialog";
import NotificationBell from "@/components/customer/NotificationBell";
import OrdersList from "@/components/customer/OrdersList";
import MarketplaceBrowser from "@/components/customer/MarketplaceBrowser";
import CustomerProfile from "@/components/customer/CustomerProfile";
import CustomerInvoices from "@/components/customer/CustomerInvoices";
import PromoBanner from "@/components/customer/PromoBanner";
import LoyaltyCard from "@/components/customer/LoyaltyCard";
import ThemeToggle from "@/components/ThemeToggle";
import { motion } from "framer-motion";

const GREETINGS = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good Morning", emoji: "☀️" };
  if (hour < 17) return { text: "Good Afternoon", emoji: "🌤️" };
  return { text: "Good Evening", emoji: "🌙" };
};

const TIPS = [
  "💡 Refer a friend and earn $500 GYD credit instantly!",
  "🏃 Need something picked up? Try our Errand service!",
  "⭐ Rate your drivers to help us improve service!",
  "🎯 Earn loyalty points on every delivery order!",
  "🍔 Browse local restaurants and order food delivery!",
];

const CustomerDashboard = () => {
  const { signOut, user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState("order");
  const [targetStoreId, setTargetStoreId] = useState<string | null>(null);
  const [targetProductId, setTargetProductId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [stats, setStats] = useState({ totalOrders: 0, activeOrders: 0, totalSpent: 0 });
  const [tipIndex] = useState(() => Math.floor(Math.random() * TIPS.length));

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, referral_code")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.full_name) setCustomerName(data.full_name.split(" ")[0]);
        if (data?.referral_code) setReferralCode(data.referral_code);
      });

    // Fetch quick stats
    supabase
      .from("orders")
      .select("status, price")
      .eq("customer_id", user.id)
      .then(({ data }) => {
        if (data) {
          const active = data.filter(o => ["pending", "accepted", "picked_up", "on_the_way"].includes(o.status));
          const delivered = data.filter(o => o.status === "delivered");
          setStats({
            totalOrders: delivered.length,
            activeOrders: active.length,
            totalSpent: delivered.reduce((sum, o) => sum + (o.price || 0), 0),
          });
        }
      });
  }, [user, refreshKey]);

  const handlePromoNavigate = (storeId: string, productId?: string) => {
    setTargetStoreId(storeId);
    setTargetProductId(productId || null);
    setActiveTab("marketplace");
  };

  const greeting = GREETINGS();

  return (
    <div className="min-h-screen mesh-bg" onClick={unlockAudio}>
      <div className="particle w-3 h-3 bg-primary/20 top-20 left-[10%]" style={{ animationDelay: '0s' }} />
      <div className="particle w-2 h-2 bg-accent/20 top-40 right-[15%]" style={{ animationDelay: '2s' }} />
      <div className="particle w-4 h-4 bg-primary/10 bottom-32 left-[20%]" style={{ animationDelay: '4s' }} />

      <header className="bg-secondary dark:bg-secondary/95 backdrop-blur-xl border-b border-border/20 sticky top-0 z-50 safe-top">
        <div className="container mx-auto px-4 safe-x flex items-center justify-between h-16">
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

          <TabsContent value="order" className="animate-fade-in space-y-5">
            <PromoBanner onNavigateToStore={handlePromoNavigate} />

            {/* Hero greeting */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-accent/10 to-primary/5 border border-primary/20 p-5"
            >
              <div className="absolute top-2 right-3 text-4xl opacity-40">{greeting.emoji}</div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                {greeting.text}{customerName ? `, ${customerName}` : ""}! 👋
              </h1>
              <p className="text-muted-foreground text-sm mt-1">What do you need delivered today?</p>

              {/* Tip of the day */}
              <div className="mt-3 bg-card/60 backdrop-blur-sm rounded-xl px-3 py-2 text-xs text-muted-foreground border border-border/30">
                {TIPS[tipIndex]}
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-3 gap-3"
            >
              <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-3.5 border border-border/50 text-center">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <p className="font-display text-xl font-bold text-foreground">{stats.totalOrders}</p>
                <p className="text-[10px] text-muted-foreground font-medium">Completed</p>
              </div>
              <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-3.5 border border-border/50 text-center">
                <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-2">
                  <Zap className="h-4 w-4 text-accent" />
                </div>
                <p className="font-display text-xl font-bold text-foreground">{stats.activeOrders}</p>
                <p className="text-[10px] text-muted-foreground font-medium">Active Now</p>
              </div>
              <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-3.5 border border-border/50 text-center">
                <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-2">
                  <Star className="h-4 w-4 text-green-500" />
                </div>
                <p className="font-display text-lg font-bold text-foreground">${(stats.totalSpent / 1000).toFixed(0)}k</p>
                <p className="text-[10px] text-muted-foreground font-medium">GYD Spent</p>
              </div>
            </motion.div>

            {/* Food Section Card */}
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setActiveTab("marketplace")}
              className="w-full bg-card/90 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-4 text-left border border-border/50 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all"
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

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 gap-4"
            >
              <NewOrderDialog onOrderCreated={() => setRefreshKey((k) => k + 1)}>
                <button className="bg-card/90 backdrop-blur-sm border border-border/50 rounded-2xl p-5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 text-left group glow-card">
                  <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-primary/20">
                    <Package className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-card-foreground mb-1">Delivery</h3>
                  <p className="text-muted-foreground text-xs mb-2">Send a package A → B</p>
                  <p className="font-display text-xl font-bold text-primary">
                    $700+ <span className="text-xs font-normal text-muted-foreground">GYD</span>
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
                    $1,000+ <span className="text-xs font-normal text-muted-foreground">GYD</span>
                  </p>
                </button>
              </NewOrderDialog>
            </motion.div>

            <LoyaltyCard />

            {/* Referral Quick Card */}
            {referralCode && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-4 border border-primary/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                    <Gift className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-sm text-foreground">Refer & Earn $500 GYD</p>
                    <p className="text-xs text-muted-foreground truncate">Code: <span className="font-mono font-bold text-primary">{referralCode}</span></p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full text-xs shrink-0 border-primary/30 hover:bg-primary/10"
                    onClick={() => {
                      const url = `${window.location.origin}/signup?ref=${referralCode}`;
                      if (navigator.share) {
                        navigator.share({ title: "Join MaceyRunners!", text: `Use my referral code ${referralCode} to sign up!`, url });
                      } else {
                        navigator.clipboard.writeText(url);
                        toast.success("Referral link copied!");
                      }
                    }}
                  >
                    <Users className="h-3.5 w-3.5 mr-1" /> Share
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Why MaceyRunners card */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-card/90 backdrop-blur-sm rounded-2xl p-4 border border-border/50"
            >
              <h3 className="font-display font-bold text-sm text-foreground mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-accent" /> Why Guyanese Love MaceyRunners
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-start gap-2 bg-muted/30 rounded-xl p-2.5">
                  <Clock className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">15-30 Min</p>
                    <p className="text-muted-foreground">Fast delivery times</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-muted/30 rounded-xl p-2.5">
                  <Star className="h-3.5 w-3.5 text-accent mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Real-Time</p>
                    <p className="text-muted-foreground">Track your rider live</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-muted/30 rounded-xl p-2.5">
                  <Package className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Any Errand</p>
                    <p className="text-muted-foreground">We pick up anything</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-muted/30 rounded-xl p-2.5">
                  <Gift className="h-3.5 w-3.5 text-pink-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Earn Points</p>
                    <p className="text-muted-foreground">Get rewards on orders</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <div>
              <OrdersList refreshKey={refreshKey} />
            </div>
          </TabsContent>

          <TabsContent value="marketplace" className="animate-fade-in">
            <MarketplaceBrowser initialStoreId={targetStoreId} initialProductId={targetProductId} onStoreOpened={() => { setTargetStoreId(null); setTargetProductId(null); }} />
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
