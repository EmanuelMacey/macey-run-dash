import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Clock, Lock, Unlock, Wand2 } from "lucide-react";
import { isWithinClosure } from "@/lib/closure";
import type { OverrideMode } from "@/hooks/useServiceStatus";

const AdminServiceStatus = () => {
  const [mode, setMode] = useState<OverrideMode>("auto");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<OverrideMode | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("service_status")
        .select("override_mode")
        .maybeSingle();
      if (data?.override_mode) setMode(data.override_mode as OverrideMode);
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel("admin_service_status")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "service_status" },
        (payload: any) => {
          if (payload.new?.override_mode) setMode(payload.new.override_mode as OverrideMode);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateMode = async (next: OverrideMode) => {
    setSaving(next);
    const { data: userRes } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("service_status")
      .update({ override_mode: next, updated_by: userRes.user?.id, updated_at: new Date().toISOString() })
      .eq("id", true);
    setSaving(null);
    if (error) {
      toast.error("Failed to update service status");
      return;
    }
    setMode(next);
    toast.success(
      next === "auto"
        ? "Switched to automatic schedule"
        : next === "force_open"
        ? "Service is now FORCED OPEN"
        : "Service is now FORCED CLOSED"
    );
  };

  const inWindow = isWithinClosure();
  const effectivelyClosed =
    mode === "force_closed" || (mode === "auto" && inWindow);

  const options: { value: OverrideMode; label: string; desc: string; icon: typeof Wand2; tone: string }[] = [
    {
      value: "auto",
      label: "Automatic",
      desc: "Follow the 7:00 AM – 3:30 PM closure schedule",
      icon: Wand2,
      tone: "bg-primary text-primary-foreground",
    },
    {
      value: "force_open",
      label: "Force Open",
      desc: "Override the schedule and keep the service open",
      icon: Unlock,
      tone: "bg-success text-success-foreground",
    },
    {
      value: "force_closed",
      label: "Force Closed",
      desc: "Show the closure overlay regardless of time",
      icon: Lock,
      tone: "bg-destructive text-destructive-foreground",
    },
  ];

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Clock className="h-5 w-5 text-primary" />
            Service Status Override
          </CardTitle>
          <Badge
            variant={effectivelyClosed ? "destructive" : "default"}
            className={effectivelyClosed ? "" : "bg-success text-success-foreground hover:bg-success"}
          >
            {effectivelyClosed ? "CLOSED" : "OPEN"}
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          {mode === "auto"
            ? `Automatic mode — currently ${inWindow ? "within" : "outside"} the 7:00 AM – 3:30 PM closure window.`
            : mode === "force_open"
            ? "Manual override active: service is FORCED OPEN."
            : "Manual override active: service is FORCED CLOSED."}
        </p>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-3">
        {options.map((opt) => {
          const Icon = opt.icon;
          const active = mode === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => !active && updateMode(opt.value)}
              disabled={loading || saving !== null}
              className={`text-left rounded-2xl border p-4 transition-all ${
                active
                  ? "border-primary ring-2 ring-primary/30 bg-primary/5"
                  : "border-border hover:border-primary/40 hover:bg-muted/50"
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${opt.tone}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="font-semibold text-sm">{opt.label}</span>
                {active && <Badge variant="secondary" className="ml-auto text-[10px]">Active</Badge>}
              </div>
              <p className="text-xs text-muted-foreground leading-snug">{opt.desc}</p>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default AdminServiceStatus;
