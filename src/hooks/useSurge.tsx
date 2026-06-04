import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SurgeState {
  isActive: boolean;
  multiplier: number;
  reason: string | null;
}

export const useSurge = () => {
  const [surge, setSurge] = useState<SurgeState>({ isActive: false, multiplier: 1, reason: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data } = await (supabase as any)
        .from("surge_settings")
        .select("is_active, multiplier, reason")
        .limit(1)
        .maybeSingle();
      if (mounted && data) {
        setSurge({
          isActive: !!data.is_active,
          multiplier: data.is_active ? Number(data.multiplier) || 1 : 1,
          reason: data.reason ?? null,
        });
      }
      if (mounted) setLoading(false);
    };
    load();

    const channel = (supabase as any)
      .channel("surge_settings_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "surge_settings" }, load)
      .subscribe();

    return () => {
      mounted = false;
      (supabase as any).removeChannel(channel);
    };
  }, []);

  return { ...surge, loading };
};
