import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { CheckCircle, XCircle, User, Car, MapPin, Shield, Wifi, WifiOff } from "lucide-react";
import { motion } from "framer-motion";
import type { Tables } from "@/integrations/supabase/types";

type Driver = Tables<"drivers"> & { profile?: { full_name: string; phone: string | null } };

const AdminDrivers = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDrivers = async () => {
    const { data: driversData } = await supabase.from("drivers").select("*").order("created_at", { ascending: false });
    if (!driversData) { setLoading(false); return; }

    const userIds = driversData.map((d) => d.user_id);
    const { data: profiles } = await supabase.from("profiles").select("user_id, full_name, phone").in("user_id", userIds);

    const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);
    const enriched = driversData.map((d) => ({ ...d, profile: profileMap.get(d.user_id) }));
    setDrivers(enriched);
    setLoading(false);
  };

  useEffect(() => { fetchDrivers(); }, []);

  const toggleApproval = async (driverId: string, approved: boolean) => {
    const { error } = await supabase.from("drivers").update({ is_approved: approved }).eq("id", driverId);
    if (error) {
      toast.error("Failed to update driver");
    } else {
      toast.success(approved ? "Driver approved" : "Driver suspended");
      fetchDrivers();
    }
  };

  if (loading) return <div className="p-8 text-muted-foreground">Loading drivers...</div>;

  const onlineCount = drivers.filter(d => d.is_online).length;
  const approvedCount = drivers.filter(d => d.is_approved).length;

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
          <User className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-primary">{drivers.length} Drivers</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 rounded-full">
          <Wifi className="h-3.5 w-3.5 text-success" />
          <span className="text-xs font-semibold text-success">{onlineCount} Online</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
          <Shield className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">{approvedCount} Approved</span>
        </div>
      </div>

      {drivers.length === 0 ? (
        <Card className="p-10 text-center border-dashed">
          <User className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No drivers registered yet</p>
          <p className="text-xs text-muted-foreground mt-1">Drivers will appear here once they sign up</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {drivers.map((driver, i) => (
            <motion.div
              key={driver.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className={`overflow-hidden transition-all ${driver.is_approved ? "border-border/50" : "border-accent/30 bg-accent/5"}`}>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    {/* Driver info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative">
                        <Avatar className="h-12 w-12 border-2 border-border">
                          {driver.avatar_url ? (
                            <AvatarImage src={driver.avatar_url} alt={driver.profile?.full_name || "Driver"} />
                          ) : null}
                          <AvatarFallback className="bg-muted text-muted-foreground font-bold">
                            {driver.profile?.full_name?.charAt(0)?.toUpperCase() || <User className="h-5 w-5" />}
                          </AvatarFallback>
                        </Avatar>
                        {/* Online indicator */}
                        <span className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-card ${driver.is_online ? "bg-success" : "bg-muted-foreground/40"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-display font-bold text-sm text-foreground truncate">
                            {driver.profile?.full_name || "Unknown Driver"}
                          </p>
                          {!driver.is_approved && (
                            <Badge variant="outline" className="text-[10px] border-accent text-accent shrink-0">Pending</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          {(driver.vehicle_type || driver.license_plate) && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Car className="h-3 w-3" />
                              {driver.vehicle_type || "No vehicle"}
                              {driver.license_plate && (
                                <span className="bg-foreground/10 text-foreground font-mono font-bold text-[10px] px-1.5 py-0.5 rounded ml-1">
                                  {driver.license_plate}
                                </span>
                              )}
                            </span>
                          )}
                          {driver.profile?.phone && (
                            <span className="text-xs text-muted-foreground">{driver.profile.phone}</span>
                          )}
                        </div>
                        {driver.current_lat && driver.current_lng && (
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                            <MapPin className="h-2.5 w-2.5" />
                            {driver.current_lat.toFixed(4)}, {driver.current_lng.toFixed(4)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={driver.is_online ? "default" : "secondary"} className="gap-1 text-[10px]">
                        {driver.is_online ? <Wifi className="h-2.5 w-2.5" /> : <WifiOff className="h-2.5 w-2.5" />}
                        {driver.is_online ? "Online" : "Offline"}
                      </Badge>
                      {driver.is_approved ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleApproval(driver.id, false)}
                          className="text-destructive border-destructive/30 hover:bg-destructive/10 rounded-full text-xs gap-1 h-8"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Suspend
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => toggleApproval(driver.id, true)}
                          className="gradient-primary text-primary-foreground rounded-full text-xs gap-1 h-8 shadow-sm"
                        >
                          <CheckCircle className="h-3.5 w-3.5" /> Approve
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDrivers;
