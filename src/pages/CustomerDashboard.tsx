import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, Package, Home, ClipboardList, User, ShoppingCart } from "lucide-react";
import { unlockAudio } from "@/lib/notifications";
import logo from "@/assets/logo.png";
import NewOrderDialog from "@/components/customer/NewOrderDialog";
import NotificationBell from "@/components/customer/NotificationBell";
import OrdersList from "@/components/customer/OrdersList";
import MarketplaceBrowser from "@/components/customer/MarketplaceBrowser";
import CustomerProfile from "@/components/customer/CustomerProfile";
import ThemeToggle from "@/components/ThemeToggle";
import CartSheet from "@/components/marketplace/CartSheet";
import { useCart } from "@/hooks/useCart";

type Tab = "home" | "services" | "orders" | "account";

const CustomerDashboard = () => {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [refreshKey, setRefreshKey] = useState(0);
  const { itemCount } = useCart();

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "home", label: "Home", icon: <Home className="h-5 w-5" /> },
    { id: "services", label: "Services", icon: <Package className="h-5 w-5" /> },
    { id: "orders", label: "Orders", icon: <ClipboardList className="h-5 w-5" /> },
    { id: "account", label: "Account", icon: <User className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen bg-background" onClick={unlockAudio}>
      {/* Top header — compact, Instacart-style */}
      <header className="bg-card/95 backdrop-blur-xl border-b border-border/40 sticky top-0 z-50">
        <div className="px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <img src={logo} alt="MaceyRunners" className="h-7 w-auto" />
            <span className="font-display font-bold text-base text-foreground">MaceyRunners</span>
          </div>
          <div className="flex items-center gap-0.5">
            <CartSheet>
              <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-accent text-accent-foreground text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                    {itemCount}
                  </span>
                )}
              </button>
            </CartSheet>
            <ThemeToggle />
            <NotificationBell />
            <Button variant="ghost" size="icon" onClick={signOut} className="text-muted-foreground hover:text-foreground h-9 w-9">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content area — full height minus header and bottom nav */}
      <main className="pb-20">
        {activeTab === "home" && (
          <div className="animate-fade-in">
            <MarketplaceBrowser />
          </div>
        )}

        {activeTab === "services" && (
          <div className="animate-fade-in px-4 py-6 max-w-2xl mx-auto">
            <h1 className="font-display text-2xl font-bold text-foreground mb-1">Services 🚀</h1>
            <p className="text-muted-foreground text-sm mb-6">Need something delivered or an errand run?</p>

            <div className="grid grid-cols-2 gap-3 mb-8">
              <NewOrderDialog onOrderCreated={() => setRefreshKey((k) => k + 1)}>
                <button className="bg-card border border-border rounded-2xl p-5 hover:border-primary/50 hover:shadow-lg transition-all duration-300 text-left group">
                  <div className="w-11 h-11 gradient-primary rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-md">
                    <Package className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h3 className="font-display text-base font-bold text-card-foreground mb-0.5">Delivery</h3>
                  <p className="text-muted-foreground text-xs mb-2">Send a package A → B</p>
                  <p className="font-display text-lg font-bold text-primary">
                    $1,000 <span className="text-xs font-normal text-muted-foreground">GYD</span>
                  </p>
                </button>
              </NewOrderDialog>

              <NewOrderDialog onOrderCreated={() => setRefreshKey((k) => k + 1)}>
                <button className="bg-card border border-border rounded-2xl p-5 hover:border-accent/50 hover:shadow-lg transition-all duration-300 text-left group">
                  <div className="w-11 h-11 bg-accent rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-md">
                    <Package className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <h3 className="font-display text-base font-bold text-card-foreground mb-0.5">Errand</h3>
                  <p className="text-muted-foreground text-xs mb-2">We'll run it for you</p>
                  <p className="font-display text-lg font-bold text-accent">
                    $1,500 <span className="text-xs font-normal text-muted-foreground">GYD</span>
                  </p>
                </button>
              </NewOrderDialog>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="animate-fade-in px-4 py-6 max-w-2xl mx-auto">
            <h1 className="font-display text-2xl font-bold text-foreground mb-1">Your Orders 📦</h1>
            <p className="text-muted-foreground text-sm mb-6">Track active and past orders</p>
            <OrdersList refreshKey={refreshKey} />
          </div>
        )}

        {activeTab === "account" && (
          <div className="animate-fade-in px-4 py-6 max-w-2xl mx-auto">
            <CustomerProfile />
          </div>
        )}
      </main>

      {/* Bottom navigation bar — Instacart style */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border/40 safe-area-bottom">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[60px] ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className={`transition-transform duration-200 ${isActive ? "scale-110" : ""}`}>
                  {tab.icon}
                </div>
                <span className={`text-[10px] font-semibold ${isActive ? "text-primary" : ""}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default CustomerDashboard;
