import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LogOut, Power, MapPin } from "lucide-react";
import { unlockAudio } from "@/lib/notifications";
import logo from "@/assets/logo.png";
import DriverOrderFeed from "@/components/driver/DriverOrderFeed";
import DriverEarnings from "@/components/driver/DriverEarnings";
import DriverProfile from "@/components/driver/DriverProfile";
import NotificationBell from "@/components/customer/NotificationBell";
import ThemeToggle from "@/components/ThemeToggle";

const DriverDashboard = () => {
  const { user, signOut } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [gpsActive, setGpsActive] = useState(false);
  const gpsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const startGpsBroadcast = useCallback(() => {
    if (!user || gpsIntervalRef.current) return;
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setGpsActive(true);
    toast.success("GPS broadcasting started", { icon: "📍" });

    const sendLocation = () => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          await supabase.from("drivers").update({ current_lat: latitude, current_lng: longitude }).eq("user_id", user.id);
        },
        (err) => console.error("GPS error:", err.message),
        { enableHighAccuracy: true, timeout: 4000 }
      );
    };

    sendLocation();
    gpsIntervalRef.current = setInterval(sendLocation, 5000);
  }, [user]);

  const stopGpsBroadcast = useCallback(() => {
    if (gpsIntervalRef.current) { clearInterval(gpsIntervalRef.current); gpsIntervalRef.current = null; }
    if (watchIdRef.current !== null) { navigator.geolocation.clearWatch(watchIdRef.current); watchIdRef.current = null; }
    setGpsActive(false);
  }, []);

  useEffect(() => {
    if (isOnline) startGpsBroadcast(); else stopGpsBroadcast();
    return () => stopGpsBroadcast();
  }, [isOnline, startGpsBroadcast, stopGpsBroadcast]);

  useEffect(() => {
    if (!user) return;
    supabase.from("drivers").select("is_online").eq("user_id", user.id).single().then(({ data }) => {
      if (data) setIsOnline(data.is_online);
    });
  }, [user]);

  const toggleOnline = useCallback(async () => {
    if (!user) return;
    setToggling(true);
    const newStatus = !isOnline;
    try {
      const { error } = await supabase.from("drivers").update({ is_online: newStatus }).eq("user_id", user.id);
      if (error) throw error;
      setIsOnline(newStatus);
      toast.success(newStatus ? "You're now online! 🟢" : "You're now offline");
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setToggling(false);
    }
  }, [user, isOnline]);

  return (
    <div className="min-h-screen mesh-bg" onClick={unlockAudio}>
      {/* Decorative particles */}
      <div className="particle w-3 h-3 bg-success/20 top-24 left-[8%]" style={{ animationDelay: '0s' }} />
      <div className="particle w-2 h-2 bg-accent/15 top-48 right-[12%]" style={{ animationDelay: '3s' }} />

      <header className="bg-navy dark:bg-secondary/95 backdrop-blur-xl border-b border-navy/20 dark:border-white/10 sticky top-0 z-50 safe-top">
        <div className="container mx-auto px-4 safe-x flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <img src={logo} alt="MaceyRunners" className="h-8 w-auto" />
            <span className="font-display font-bold text-lg text-navy-foreground dark:text-white">Driver</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant={isOnline ? "default" : "outline"}
              onClick={toggleOnline}
              disabled={toggling}
              className={`rounded-full font-semibold ${isOnline ? "bg-success hover:bg-success/90 text-success-foreground animate-pulse-glow" : ""}`}
            >
              <Power className="h-4 w-4 mr-2" />
              {isOnline ? "Online" : "Offline"}
            </Button>
            <ThemeToggle />
            <NotificationBell />
            <Button variant="ghost" onClick={signOut} className="text-navy-foreground/70 hover:text-navy-foreground dark:text-white/70 dark:hover:text-white">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl relative">
        <h1 className="font-display text-3xl font-bold text-navy dark:text-white mb-1">Driver Dashboard</h1>
        <p className="text-muted-foreground mb-6">
          {isOnline ? "You're online — waiting for orders..." : "Go online to start receiving orders"}
        </p>

        {gpsActive && (
          <div className="flex items-center gap-2 mb-4 px-4 py-2.5 bg-success/10 rounded-2xl text-sm text-success font-medium border border-success/20 backdrop-blur-sm">
            <MapPin className="h-4 w-4 animate-pulse" />
            <span>GPS broadcasting active — updating every 5s</span>
          </div>
        )}

        <DriverProfile />
        <DriverEarnings />
        <DriverOrderFeed isOnline={isOnline} />
      </main>
    </div>
  );
};

export default DriverDashboard;
