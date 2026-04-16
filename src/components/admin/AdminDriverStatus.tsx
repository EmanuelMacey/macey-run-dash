import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Wifi, WifiOff, User, MapPin, Car } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Tables } from "@/integrations/supabase/types";

type Driver = Tables<"drivers"> & { profile?: { full_name: string; phone: string | null } };

const AdminDriverStatus = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDrivers = async () => {
    const { data: driversData } = await supabase
      .from("drivers")
      .select("*")
      .eq("is_approved", true)
      .order("is_online", { ascending: false });
    if (!driversData) { setLoading(false); return; }

    const userIds = driversData.map((d) => d.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, phone")
      .in("user_id", userIds);

    const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);
    const enriched = driversData.map((d) => ({ ...d, profile: profileMap.get(d.user_id) }));
    setDrivers(enriched);
    setLoading(false);
  };

  useEffect(() => { fetchDrivers(); }, []);

  // Realtime subscription for driver status changes
  useEffect(() => {
    const channel = supabase
      .channel("admin-driver-status")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "drivers" },
        () => { fetchDrivers(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const onlineDrivers = drivers.filter((d) => d.is_online);
  const offlineDrivers = drivers.filter((d) => !d.is_online);

  if (loading) return <div className="p-4 text-muted-foreground text-sm">Loading driver status...</div>;

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 rounded-full">
          <Wifi className="h-3.5 w-3.5 text-success" />
          <span className="text-xs font-semibold text-success">{onlineDrivers.length} Online</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
          <WifiOff className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">{offlineDrivers.length} Offline</span>
        </div>
      </div>

      {/* Online Drivers */}
      {onlineDrivers.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-success flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" /> Active Now
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <AnimatePresence>
              {onlineDrivers.map((driver) => (
                <DriverCard key={driver.id} driver={driver} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Offline Drivers */}
      {offlineDrivers.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Offline</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {offlineDrivers.map((driver) => (
              <DriverCard key={driver.id} driver={driver} />
            ))}
          </div>
        </div>
      )}

      {drivers.length === 0 && (
        <Card className="p-8 text-center border-dashed">
          <User className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No approved drivers yet</p>
        </Card>
      )}
    </div>
  );
};

const DriverCard = ({ driver }: { driver: Driver & { profile?: { full_name: string; phone: string | null } } }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
  >
    <Card className={`p-3 flex items-center gap-3 transition-all ${driver.is_online ? "border-success/30 bg-success/5" : "border-border/50 opacity-70"}`}>
      <div className="relative shrink-0">
        <Avatar className="h-10 w-10 border-2 border-border">
          {driver.avatar_url ? <AvatarImage src={driver.avatar_url} /> : null}
          <AvatarFallback className="bg-muted text-muted-foreground text-xs font-bold">
            {driver.profile?.full_name?.charAt(0)?.toUpperCase() || <User className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
        <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card ${driver.is_online ? "bg-success" : "bg-muted-foreground/40"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground truncate">{driver.profile?.full_name || "Unknown"}</p>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          {driver.vehicle_type && (
            <span className="flex items-center gap-0.5"><Car className="h-3 w-3" /> {driver.vehicle_type}</span>
          )}
          {driver.current_lat && driver.current_lng && (
            <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" /> GPS</span>
          )}
        </div>
      </div>
      <Badge variant={driver.is_online ? "default" : "secondary"} className="text-[10px] gap-0.5 shrink-0">
        {driver.is_online ? <Wifi className="h-2.5 w-2.5" /> : <WifiOff className="h-2.5 w-2.5" />}
        {driver.is_online ? "Online" : "Offline"}
      </Badge>
    </Card>
  </motion.div>
);

export default AdminDriverStatus;
