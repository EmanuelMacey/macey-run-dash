import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Tag, Trash2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type PromoCode = Tables<"promo_codes">;

const AdminPromoCodes = () => {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ code: "", discount_percent: 0, discount_amount: 0, max_uses: "" });

  const fetchPromos = async () => {
    const { data } = await supabase.from("promo_codes").select("*").order("created_at", { ascending: false });
    setPromos(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchPromos(); }, []);

  const createPromo = async () => {
    if (!form.code.trim()) { toast.error("Code is required"); return; }
    const { error } = await supabase.from("promo_codes").insert({
      code: form.code.toUpperCase().trim(),
      discount_percent: form.discount_percent,
      discount_amount: form.discount_amount,
      max_uses: form.max_uses ? parseInt(form.max_uses) : null,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Promo code created");
      setForm({ code: "", discount_percent: 0, discount_amount: 0, max_uses: "" });
      setDialogOpen(false);
      fetchPromos();
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from("promo_codes").update({ is_active: active }).eq("id", id);
    fetchPromos();
  };

  const deletePromo = async (id: string) => {
    const { error } = await supabase.from("promo_codes").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else { toast.success("Deleted"); fetchPromos(); }
  };

  if (loading) return <div className="p-8 text-muted-foreground">Loading promo codes...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> New Promo Code</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Create Promo Code</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Code</Label>
                <Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} placeholder="e.g. SAVE20" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Discount %</Label>
                  <Input type="number" min={0} max={100} value={form.discount_percent} onChange={(e) => setForm((f) => ({ ...f, discount_percent: parseInt(e.target.value) || 0 }))} />
                </div>
                <div>
                  <Label>Discount Amount (GYD)</Label>
                  <Input type="number" min={0} value={form.discount_amount} onChange={(e) => setForm((f) => ({ ...f, discount_amount: parseInt(e.target.value) || 0 }))} />
                </div>
              </div>
              <div>
                <Label>Max Uses (blank = unlimited)</Label>
                <Input value={form.max_uses} onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value }))} placeholder="e.g. 100" />
              </div>
              <Button onClick={createPromo} className="w-full">Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {promos.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">No promo codes yet.</Card>
      ) : (
        <div className="space-y-3">
          {promos.map((promo) => (
            <Card key={promo.id} className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Tag className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-foreground">{promo.code}</p>
                    <p className="text-xs text-muted-foreground">
                      {promo.discount_percent > 0 && `${promo.discount_percent}% off`}
                      {promo.discount_percent > 0 && promo.discount_amount > 0 && " + "}
                      {promo.discount_amount > 0 && `$${promo.discount_amount} GYD off`}
                      {" · "}
                      {promo.current_uses}{promo.max_uses ? `/${promo.max_uses}` : ""} uses
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={promo.is_active} onCheckedChange={(v) => toggleActive(promo.id, v)} />
                  <Button variant="ghost" size="icon" onClick={() => deletePromo(promo.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPromoCodes;
