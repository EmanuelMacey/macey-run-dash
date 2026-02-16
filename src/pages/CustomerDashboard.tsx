import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, Package, Clock, MapPin } from "lucide-react";

const CustomerDashboard = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-secondary border-b border-border">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-sm">M</span>
            </div>
            <span className="font-display font-bold text-lg text-secondary-foreground">MaceyRunners</span>
          </div>
          <Button variant="ghost" onClick={signOut} className="text-muted-foreground">
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Welcome back!</h1>
        <p className="text-muted-foreground mb-8">What do you need delivered today?</p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-colors cursor-pointer">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-display text-xl font-bold text-card-foreground mb-2">Delivery</h3>
            <p className="text-muted-foreground text-sm mb-3">Send a package from point A to point B</p>
            <p className="font-display text-2xl font-bold text-primary">$1,000 <span className="text-sm font-normal text-muted-foreground">GYD</span></p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-colors cursor-pointer">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-display text-xl font-bold text-card-foreground mb-2">Errand</h3>
            <p className="text-muted-foreground text-sm mb-3">We'll run an errand for you</p>
            <p className="font-display text-2xl font-bold text-primary">$1,500 <span className="text-sm font-normal text-muted-foreground">GYD</span></p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-display text-lg font-bold text-card-foreground">Recent Orders</h2>
          </div>
          <p className="text-muted-foreground text-sm">No orders yet. Place your first order above!</p>
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;
