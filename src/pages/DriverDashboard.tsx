import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LogOut, Power } from "lucide-react";
import logo from "@/assets/logo.png";
import DriverOrderFeed from "@/components/driver/DriverOrderFeed";

const DriverDashboard = () => {
  const { user, signOut } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [toggling, setToggling] = useState(false);

  // Fetch current online status from drivers table
  useEffect(() => {
    if (!user) return;
    supabase
      .from("drivers")
      .select("is_online")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setIsOnline(data.is_online);
      });
  }, [user]);

  const toggleOnline = useCallback(async () => {
    if (!user) return;
    setToggling(true);
    const newStatus = !isOnline;

    try {
      const { error } = await supabase
        .from("drivers")
        .update({ is_online: newStatus })
        .eq("user_id", user.id);

      if (error) throw error;
      setIsOnline(newStatus);
      toast.success(newStatus ? "You're now online!" : "You're now offline");
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setToggling(false);
    }
  }, [user, isOnline]);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-secondary border-b border-border">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <img src={logo} alt="MaceyRunners" className="h-8 w-auto" />
            <span className="font-display font-bold text-lg text-secondary-foreground">Driver</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant={isOnline ? "default" : "outline"}
              onClick={toggleOnline}
              disabled={toggling}
              className={`rounded-full ${isOnline ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
            >
              <Power className="h-4 w-4 mr-2" />
              {isOnline ? "Online" : "Offline"}
            </Button>
            <Button variant="ghost" onClick={signOut} className="text-secondary-foreground/70 hover:text-secondary-foreground">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Driver Dashboard</h1>
        <p className="text-muted-foreground mb-6">
          {isOnline
            ? "You're online — waiting for orders..."
            : "Go online to start receiving orders"}
        </p>

        <DriverOrderFeed isOnline={isOnline} />
      </main>
    </div>
  );
};

export default DriverDashboard;
