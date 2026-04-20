import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isWithinClosure } from "@/lib/closure";

export type OverrideMode = "auto" | "force_open" | "force_closed";

export interface ServiceStatus {
  override_mode: OverrideMode;
  isClosed: boolean;
  loading: boolean;
}

const computeClosed = (mode: OverrideMode) => {
  if (mode === "force_closed") return true;
  if (mode === "force_open") return false;
  return isWithinClosure();
};

export const useServiceStatus = (): ServiceStatus => {
  const [mode, setMode] = useState<OverrideMode>("auto");
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let active = true;

    const fetchStatus = async () => {
      const { data } = await supabase
        .from("service_status")
        .select("override_mode")
        .maybeSingle();
      if (!active) return;
      if (data?.override_mode) setMode(data.override_mode as OverrideMode);
      setLoading(false);
    };

    fetchStatus();

    const channel = supabase
      .channel("service_status_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "service_status" },
        (payload: any) => {
          const newMode = payload.new?.override_mode;
          if (newMode) setMode(newMode as OverrideMode);
        }
      )
      .subscribe();

    // Re-evaluate auto mode every 30s
    const interval = setInterval(() => setTick((t) => t + 1), 30_000);

    return () => {
      active = false;
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  return {
    override_mode: mode,
    isClosed: computeClosed(mode),
    loading,
  };
};
