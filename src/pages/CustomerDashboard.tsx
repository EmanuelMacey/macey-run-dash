import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Package, MapPin, ShoppingBag, User, FileText, UtensilsCrossed, Gift, Users, Zap, TrendingUp, Clock, Star, ShoppingCart, Pill, FileCheck, ChevronRight, Search, Landmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
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

const BIBLE_VERSES = [
  "Be still, and know that I am God. - Psalm 46:10",
  "The Lord is my shepherd; I shall not want. - Psalm 23:1",
  "I can do all things through Christ. - Philippians 4:13",
  "Trust in the Lord with all your heart. - Proverbs 3:5",
  "For God so loved the world. - John 3:16",
];

const ERRAND_SERVICES = [
  { icon: ShoppingCart, title: "Supermarket Shopping", subtitle: "Massy, Bounty, DSL & more", color: "bg-accent/10 text-accent", id: "supermarket" },
  { icon: Pill, title: "Pharmacy Errands", subtitle: "Mike's, Medicine Chest & more", color: "bg-destructive/10 text-destructive", id: "pharmacy" },
  { icon: Landmark, title: "Government Services", subtitle: "GRA, NIS, GRO & more", color: "bg-primary/10 text-primary", id: "government" },
  { icon: Package, title: "Package Delivery", subtitle: "Send parcels anywhere in GT", color: "bg-green-500/10 text-green-600", id: "package" },
];

const CustomerDashboard = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState("order");
  const [targetStoreId, setTargetStoreId] = useState<string | null>(null);
  const [targetProductId, setTargetProductId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [stats, setStats] = useState({ totalOrders: 0, activeOrders: 0, totalSpent: 0 });
  const [verseIndex] = useState(() => Math.floor(Math.random() * BIBLE_VERSES.length));
  const [showAllErrands, setShowAllErrands] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-b from-accent/8 via-background to-background" onClick={unlockAudio}>
      {/* Header - app-like */}
      <header className="bg-gradient-to-r from-accent via-accent to-accent/90 sticky top-0 z-50 safe-top">
        <div className="container mx-auto px-4 safe-x flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <img src={logo} alt="MaceyRunners" className="h-8 w-auto rounded-lg" />
            <span className="font-display font-bold text-lg text-accent-foreground">MaceyRunners</span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <NotificationBell />
            <Button variant="ghost" onClick={signOut} className="text-accent-foreground/80 hover:text-accent-foreground hover:bg-accent-foreground/10">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 max-w-2xl relative">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-4 mb-5 h-11 rounded-2xl bg-card/80 backdrop-blur-sm p-1 border border-border/50">
            <TabsTrigger value="order" className="gap-1.5 rounded-xl data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-md font-semibold transition-all text-xs">
              <Package className="h-4 w-4" /> <span className="hidden sm:inline">Home</span>
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="gap-1.5 rounded-xl data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-md font-semibold transition-all text-xs">
              <UtensilsCrossed className="h-4 w-4" /> <span className="hidden sm:inline">Food</span>
            </TabsTrigger>
            <TabsTrigger value="invoices" className="gap-1.5 rounded-xl data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-md font-semibold transition-all text-xs">
              <FileText className="h-4 w-4" /> <span className="hidden sm:inline">Invoices</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-1.5 rounded-xl data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-md font-semibold transition-all text-xs">
              <User className="h-4 w-4" /> <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="order" className="animate-fade-in space-y-4">
            <PromoBanner onNavigateToStore={handlePromoNavigate} />

            {/* Greeting with Bible verse */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent/15 via-accent/5 to-transparent border border-accent/20 p-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="font-display text-2xl font-bold text-foreground leading-tight">
                    {greeting.text}{customerName ? `, ${customerName}` : ""}!
                  </h1>
                  <p className="text-muted-foreground text-xs mt-1 italic">{BIBLE_VERSES[verseIndex]}</p>
                </div>
                <div className="flex gap-2 ml-3">
                  <button onClick={() => setActiveTab("marketplace")} className="w-10 h-10 rounded-full bg-card/80 border border-border/50 flex items-center justify-center">
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button onClick={() => setActiveTab("profile")} className="w-10 h-10 rounded-full bg-card/80 border border-border/50 flex items-center justify-center">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for restaurants or errands"
                className="pl-10 h-12 rounded-2xl bg-card border-border/50 text-sm"
                onFocus={() => setActiveTab("marketplace")}
                readOnly
              />
            </div>

            {/* Category pills */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              <button onClick={() => setActiveTab("marketplace")} className="px-4 py-2 rounded-full bg-accent text-accent-foreground text-xs font-semibold whitespace-nowrap">
                All
              </button>
              <button onClick={() => setActiveTab("marketplace")} className="px-4 py-2 rounded-full bg-card border border-border/50 text-muted-foreground text-xs font-semibold whitespace-nowrap flex items-center gap-1">
                🍔 Restaurants
              </button>
              <button onClick={() => navigate("/errands")} className="px-4 py-2 rounded-full bg-card border border-border/50 text-muted-foreground text-xs font-semibold whitespace-nowrap flex items-center gap-1">
                🏃 Errands
              </button>
            </div>

            {/* Errand Services Section */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-lg font-bold text-foreground">Errand Services</h2>
                <button onClick={() => navigate("/errands")} className="text-accent text-xs font-semibold">
                  See all →
                </button>
              </div>
              <div className="space-y-2">
                {(showAllErrands ? ERRAND_SERVICES : ERRAND_SERVICES.slice(0, 3)).map((service, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(`/errands/${service.id}`)}
                    className="w-full flex items-center gap-4 bg-card/90 backdrop-blur-sm border border-border/50 rounded-2xl p-4 hover:border-accent/30 hover:shadow-lg transition-all text-left group"
                  >
                    <div className={`w-12 h-12 rounded-full ${service.color} flex items-center justify-center shrink-0`}>
                      <service.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold text-sm text-card-foreground group-hover:text-accent transition-colors">{service.title}</h3>
                      <p className="text-xs text-muted-foreground">{service.subtitle}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Restaurants quick section */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-lg font-bold text-foreground">Restaurants</h2>
                <button onClick={() => setActiveTab("marketplace")} className="text-accent text-xs font-semibold">See all</button>
              </div>
              <button
                onClick={() => setActiveTab("marketplace")}
                className="w-full bg-card/90 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-4 text-left border border-border/50 hover:border-accent/40 hover:shadow-lg transition-all"
              >
                <div className="w-11 h-11 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
                  <UtensilsCrossed className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-base font-semibold text-card-foreground">Order Food Now!</h3>
                  <p className="text-muted-foreground text-xs">Browse local restaurants & menus</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-3 gap-3"
            >
              <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-3.5 border border-border/50 text-center">
                <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="h-4 w-4 text-accent" />
                </div>
                <p className="font-display text-xl font-bold text-foreground">{stats.totalOrders}</p>
                <p className="text-[10px] text-muted-foreground font-medium">Completed</p>
              </div>
              <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-3.5 border border-border/50 text-center">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <Zap className="h-4 w-4 text-primary" />
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

            <LoyaltyCard />

            {/* Referral Quick Card */}
            {referralCode && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-2xl p-4 border border-accent/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
                    <Gift className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-sm text-foreground">Refer & Earn $500 GYD</p>
                    <p className="text-xs text-muted-foreground truncate">Code: <span className="font-mono font-bold text-accent">{referralCode}</span></p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full text-xs shrink-0 border-accent/30 hover:bg-accent/10"
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
