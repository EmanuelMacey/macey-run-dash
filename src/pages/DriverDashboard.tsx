import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LogOut, Power, MapPin, Zap, Shield } from "lucide-react";
import { unlockAudio } from "@/lib/notifications";
import { motion } from "framer-motion";
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
  const [driverName, setDriverName] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name").eq("user_id", user.id).single().then(({ data }) => {
      if (data?.full_name) setDriverName(data.full_name.split(" ")[0]);
    });
  }, [user]);

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

      {/* Header */}
      <header className="bg-navy dark:bg-secondary/95 backdrop-blur-xl border-b border-navy/20 dark:border-white/10 sticky top-0 z-50 safe-top">
        <div className="container mx-auto px-4 safe-x flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="MaceyRunners" className="h-8 w-auto" />
            <div className="flex flex-col">
              <span className="font-display font-bold text-sm text-navy-foreground dark:text-white leading-tight">MaceyRunners</span>
              <span className="text-[10px] text-navy-foreground/60 dark:text-white/50 font-medium">Driver Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant={isOnline ? "default" : "outline"}
                size="sm"
                onClick={toggleOnline}
                disabled={toggling}
                className={`rounded-full font-semibold text-xs h-9 ${isOnline ? "bg-success hover:bg-success/90 text-success-foreground shadow-lg shadow-success/25" : "border-navy-foreground/20 text-navy-foreground dark:border-white/20 dark:text-white"}`}
              >
                <Power className="h-3.5 w-3.5 mr-1.5" />
                {isOnline ? "Online" : "Offline"}
              </Button>
            </motion.div>
            <ThemeToggle />
            <NotificationBell />
            <Button variant="ghost" size="icon" onClick={signOut} className="text-navy-foreground/70 hover:text-navy-foreground dark:text-white/70 dark:hover:text-white h-9 w-9">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl relative space-y-6">
        {/* Welcome Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy via-secondary to-navy p-6 text-navy-foreground"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              {isOnline && <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse shadow-lg shadow-success/50" />}
              <span className="text-xs font-medium text-navy-foreground/70">{isOnline ? "Currently active" : "Currently offline"}</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-white mb-1">
              {driverName ? `Hey, ${driverName} 👋` : "Driver Dashboard"}
            </h1>
            <p className="text-sm text-navy-foreground/70">
              {isOnline ? "You're online — orders will appear below" : "Go online to start receiving orders"}
            </p>
          </div>
        </motion.div>

        {/* GPS Status */}
        {gpsActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex items-center gap-2.5 px-4 py-3 bg-success/10 rounded-2xl text-sm text-success font-medium border border-success/20 backdrop-blur-sm"
          >
            <div className="w-8 h-8 rounded-xl bg-success/20 flex items-center justify-center">
              <MapPin className="h-4 w-4 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-semibold">GPS Active</p>
              <p className="text-xs text-success/70">Location updating every 5 seconds</p>
            </div>
          </motion.div>
        )}

        {/* Quick Stats */}
        <DriverEarnings />

        {/* Profile Section */}
        <DriverProfile />

        {/* Orders Section */}
        <DriverOrderFeed isOnline={isOnline} />
      </main>
    </div>
  );
};

export default DriverDashboard;
