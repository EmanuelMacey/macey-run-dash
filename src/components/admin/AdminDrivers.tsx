import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle, XCircle, User } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Driver = Tables<"drivers"> & { profile?: { full_name: string; phone: string | null } };

const AdminDrivers = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDrivers = async () => {
    const { data: driversData } = await supabase.from("drivers").select("*").order("created_at", { ascending: false });
    if (!driversData) { setLoading(false); return; }

    // Fetch profiles for these drivers
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

  return (
    <div className="space-y-3">
      {drivers.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">No drivers registered yet.</Card>
      ) : (
        drivers.map((driver) => (
          <Card key={driver.id} className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{driver.profile?.full_name || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">
                    {driver.vehicle_type || "No vehicle"} · {driver.license_plate || "No plate"}
                  </p>
                  {driver.profile?.phone && <p className="text-xs text-muted-foreground">{driver.profile.phone}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={driver.is_online ? "default" : "secondary"}>
                  {driver.is_online ? "Online" : "Offline"}
                </Badge>
                {driver.is_approved ? (
                  <Button variant="outline" size="sm" onClick={() => toggleApproval(driver.id, false)} className="text-destructive border-destructive/30">
                    <XCircle className="h-4 w-4 mr-1" /> Suspend
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => toggleApproval(driver.id, true)}>
                    <CheckCircle className="h-4 w-4 mr-1" /> Approve
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
};

export default AdminDrivers;
