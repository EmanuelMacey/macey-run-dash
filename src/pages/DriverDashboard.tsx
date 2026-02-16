import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, Power } from "lucide-react";
import { useState } from "react";

const DriverDashboard = () => {
  const { signOut } = useAuth();
  const [isOnline, setIsOnline] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-secondary border-b border-border">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-sm">M</span>
            </div>
            <span className="font-display font-bold text-lg text-secondary-foreground">Driver</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant={isOnline ? "default" : "outline"}
              onClick={() => setIsOnline(!isOnline)}
              className={`rounded-full ${isOnline ? "bg-green-600 hover:bg-green-700" : ""}`}
            >
              <Power className="h-4 w-4 mr-2" />
              {isOnline ? "Online" : "Offline"}
            </Button>
            <Button variant="ghost" onClick={signOut} className="text-muted-foreground">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Driver Dashboard</h1>
        <p className="text-muted-foreground mb-8">
          {isOnline ? "You're online — waiting for orders..." : "Go online to start receiving orders"}
        </p>

        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <p className="text-muted-foreground">No incoming orders right now.</p>
        </div>
      </main>
    </div>
  );
};

export default DriverDashboard;
