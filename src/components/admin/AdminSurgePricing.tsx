import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Zap, TrendingUp } from "lucide-react";

const PRESETS = [
  { label: "Normal", mult: 1.0, reason: null },
  { label: "Peak hours", mult: 1.25, reason: "Peak demand" },
  { label: "Rainy weather", mult: 1.5, reason: "Rainy weather surcharge" },
  { label: "High demand", mult: 1.75, reason: "Very high demand" },
  { label: "Holiday rush", mult: 2.0, reason: "Holiday surge" },
];

const AdminSurgePricing = () => {
  const [id, setId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [multiplier, setMultiplier] = useState(1);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any)
        .from("surge_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (data) {
        setId(data.id);
        setIsActive(!!data.is_active);
        setMultiplier(Number(data.multiplier) || 1);
        setReason(data.reason ?? "");
      }
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    if (!id) return;
    setSaving(true);
    const { error } = await (supabase as any)
      .from("surge_settings")
      .update({
        is_active: isActive,
        multiplier,
        reason: reason || null,
      })
      .eq("id", id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success(isActive ? `Surge ON — ${multiplier}x` : "Surge OFF");
  };

  const applyPreset = (p: typeof PRESETS[number]) => {
    setMultiplier(p.mult);
    setReason(p.reason ?? "");
    setIsActive(p.mult > 1);
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <Card className="p-5 sm:p-6 space-y-5 rounded-2xl">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg">Surge Pricing</h2>
            <p className="text-xs text-muted-foreground">Multiplies the delivery/errand fee in real time.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="surge-active" className="text-sm">{isActive ? "Active" : "Off"}</Label>
          <Switch id="surge-active" checked={isActive} onCheckedChange={setIsActive} />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => applyPreset(p)}
            className={`rounded-xl border-2 p-2 text-xs font-semibold transition-all ${
              Math.abs(multiplier - p.mult) < 0.01
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/40"
            }`}
          >
            <div className="text-sm">{p.mult}x</div>
            <div className="text-[10px] text-muted-foreground">{p.label}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="mult">Multiplier (1.00 – 3.00)</Label>
          <Input
            id="mult"
            type="number"
            min={1}
            max={3}
            step={0.05}
            value={multiplier}
            onChange={(e) => setMultiplier(Math.max(1, Math.min(3, Number(e.target.value) || 1)))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reason">Reason (shown to customers)</Label>
          <Input
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Rainy weather, peak demand..."
            maxLength={140}
          />
        </div>
      </div>

      <div className="rounded-xl bg-muted/50 p-3 flex items-center gap-2 text-sm">
        <TrendingUp className="h-4 w-4 text-primary" />
        Example: a $700 delivery fee becomes <strong>${Math.round(700 * multiplier).toLocaleString()} GYD</strong> at {multiplier}x.
      </div>

      <Button onClick={save} disabled={saving} className="w-full sm:w-auto">
        {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Save surge settings
      </Button>
    </Card>
  );
};

export default AdminSurgePricing;
