import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, XCircle, AlertTriangle, Clock, Image, ExternalLink, Settings, Save, Loader2 } from "lucide-react";

interface Verification {
  id: string;
  order_id: string;
  customer_id: string;
  transaction_id: string;
  mmg_number_used: string;
  screenshot_url: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

interface PaymentSettings {
  id: string;
  mmg_number: string;
  account_name: string;
  payment_instructions: string;
}

const AdminPaymentVerifications = () => {
  const { user } = useAuth();
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [customerNames, setCustomerNames] = useState<Record<string, string>>({});
  const [orderDetails, setOrderDetails] = useState<Record<string, { price: number; order_type: string; order_number: number | null }>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("pending");
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [editingSettings, setEditingSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, dailyRevenue: 0 });

  const fetchVerifications = async () => {
    let query = supabase
      .from("payment_verifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    const { data } = await query;
    setVerifications((data as any) || []);
    setLoading(false);

    if (data && data.length > 0) {
      const customerIds = [...new Set(data.map((v: any) => v.customer_id))];
      const orderIds = [...new Set(data.map((v: any) => v.order_id))];

      const [{ data: profiles }, { data: orders }] = await Promise.all([
        supabase.from("profiles").select("user_id, full_name").in("user_id", customerIds),
        supabase.from("orders").select("id, price, order_type, order_number").in("id", orderIds),
      ]);

      const nameMap: Record<string, string> = {};
      profiles?.forEach((p) => { nameMap[p.user_id] = p.full_name; });
      setCustomerNames(nameMap);

      const orderMap: Record<string, any> = {};
      orders?.forEach((o) => { orderMap[o.id] = o; });
      setOrderDetails(orderMap);
    }
  };

  const fetchSettings = async () => {
    const { data } = await supabase.from("payment_settings").select("*").limit(1).single();
    if (data) setSettings(data as any);
  };

  const fetchStats = async () => {
    const { data: all } = await supabase.from("payment_verifications").select("status, created_at, order_id");
    if (all) {
      const today = new Date().toDateString();
      const pending = all.filter((v: any) => v.status === "pending").length;
      const approved = all.filter((v: any) => v.status === "approved").length;
      const rejected = all.filter((v: any) => v.status === "rejected").length;

      const todayApproved = all.filter((v: any) => v.status === "approved" && new Date(v.created_at).toDateString() === today);
      const orderIds = todayApproved.map((v: any) => v.order_id);

      let dailyRevenue = 0;
      if (orderIds.length > 0) {
        const { data: orders } = await supabase.from("orders").select("price").in("id", orderIds);
        dailyRevenue = orders?.reduce((sum, o) => sum + o.price, 0) || 0;
      }

      setStats({ pending, approved, rejected, dailyRevenue });
    }
  };

  useEffect(() => {
    fetchVerifications();
    fetchSettings();
    fetchStats();
  }, [filter]);

  const handleVerification = async (id: string, orderId: string, action: "approved" | "rejected", notes?: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("payment_verifications")
      .update({
        status: action,
        verified_by: user.id,
        verified_at: new Date().toISOString(),
        admin_notes: notes || null,
      } as any)
      .eq("id", id);

    if (error) {
      toast.error("Failed to update verification");
      return;
    }

    if (action === "approved") {
      await supabase
        .from("orders")
        .update({ payment_status: "paid" as any })
        .eq("id", orderId);
      toast.success("Payment approved! Order is now available for drivers.");
    } else {
      toast.success("Payment rejected.");
    }

    fetchVerifications();
    fetchStats();
  };

  const saveSettings = async () => {
    if (!settings || !user) return;
    setSavingSettings(true);
    const { error } = await supabase
      .from("payment_settings")
      .update({
        mmg_number: settings.mmg_number,
        account_name: settings.account_name,
        payment_instructions: settings.payment_instructions,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      } as any)
      .eq("id", settings.id);

    if (error) toast.error("Failed to save settings");
    else {
      toast.success("Payment settings updated!");
      setEditingSettings(false);
    }
    setSavingSettings(false);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-amber-500">{stats.pending}</p>
          <p className="text-xs text-muted-foreground">Pending</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-green-500">{stats.approved}</p>
          <p className="text-xs text-muted-foreground">Approved</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-destructive">{stats.rejected}</p>
          <p className="text-xs text-muted-foreground">Rejected</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-primary">${stats.dailyRevenue.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Today's Revenue</p>
        </Card>
      </div>

      {/* Settings */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-foreground flex items-center gap-2">
            <Settings className="h-4 w-4" /> MMG Payment Settings
          </h3>
          <Button variant="outline" size="sm" onClick={() => setEditingSettings(!editingSettings)}>
            {editingSettings ? "Cancel" : "Edit"}
          </Button>
        </div>
        {editingSettings && settings ? (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Account Name</Label>
              <Input value={settings.account_name} onChange={(e) => setSettings({ ...settings, account_name: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">MMG Number</Label>
              <Input value={settings.mmg_number} onChange={(e) => setSettings({ ...settings, mmg_number: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Payment Instructions</Label>
              <Textarea value={settings.payment_instructions} onChange={(e) => setSettings({ ...settings, payment_instructions: e.target.value })} rows={3} />
            </div>
            <Button onClick={saveSettings} disabled={savingSettings} size="sm">
              {savingSettings && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
              <Save className="h-3 w-3 mr-1" /> Save Settings
            </Button>
          </div>
        ) : settings ? (
          <div className="text-sm text-muted-foreground space-y-1">
            <p><span className="font-semibold text-foreground">Account:</span> {settings.account_name}</p>
            <p><span className="font-semibold text-foreground">MMG #:</span> {settings.mmg_number}</p>
          </div>
        ) : null}
      </Card>

      {/* Filter */}
      <div className="flex gap-2">
        {["pending", "approved", "rejected", "all"].map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
            className="capitalize text-xs rounded-full"
          >
            {f} {f === "pending" && stats.pending > 0 && <Badge variant="destructive" className="ml-1 text-[10px] px-1">{stats.pending}</Badge>}
          </Button>
        ))}
      </div>

      {/* Verifications list */}
      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Loading...</div>
      ) : verifications.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">No payment verifications found.</Card>
      ) : (
        <div className="space-y-3">
          {verifications.map((v) => {
            const order = orderDetails[v.order_id];
            return (
              <Card key={v.id} className={`p-4 space-y-3 ${v.status === "pending" ? "border-amber-500/30" : ""}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-sm text-foreground">
                        {customerNames[v.customer_id] || "Unknown"}
                      </span>
                      {order?.order_number && (
                        <Badge variant="outline" className="text-[10px]">#{order.order_number}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(v.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge
                    variant={v.status === "approved" ? "default" : v.status === "rejected" ? "destructive" : "outline"}
                    className="capitalize text-[10px]"
                  >
                    {v.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                    {v.status === "approved" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                    {v.status === "rejected" && <XCircle className="h-3 w-3 mr-1" />}
                    {v.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-muted/50 rounded-lg p-2">
                    <p className="text-muted-foreground">Transaction ID</p>
                    <p className="font-mono font-bold text-foreground">{v.transaction_id}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <p className="text-muted-foreground">MMG # Used</p>
                    <p className="font-bold text-foreground">{v.mmg_number_used}</p>
                  </div>
                  {order && (
                    <>
                      <div className="bg-muted/50 rounded-lg p-2">
                        <p className="text-muted-foreground">Amount</p>
                        <p className="font-bold text-primary">${order.price?.toLocaleString()} GYD</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-2">
                        <p className="text-muted-foreground">Type</p>
                        <p className="font-bold capitalize text-foreground">{order.order_type}</p>
                      </div>
                    </>
                  )}
                </div>

                {v.screenshot_url && (
                  <a href={v.screenshot_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-primary hover:underline">
                    <Image className="h-3.5 w-3.5" /> View Payment Screenshot <ExternalLink className="h-3 w-3" />
                  </a>
                )}

                {v.admin_notes && (
                  <p className="text-xs text-muted-foreground italic bg-muted/30 rounded-lg p-2">Note: {v.admin_notes}</p>
                )}

                {v.status === "pending" && (
                  <div className="flex gap-2 pt-2 border-t border-border/50">
                    <Button
                      size="sm"
                      onClick={() => handleVerification(v.id, v.order_id, "approved")}
                      className="flex-1 rounded-xl text-xs"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve Payment
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        const notes = prompt("Rejection reason (optional):");
                        handleVerification(v.id, v.order_id, "rejected", notes || undefined);
                      }}
                      className="flex-1 rounded-xl text-xs"
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const notes = prompt("What additional proof is needed?");
                        if (notes) {
                          supabase.from("payment_verifications").update({ admin_notes: notes } as any).eq("id", v.id).then(() => {
                            toast.success("Request sent to customer");
                            fetchVerifications();
                          });
                        }
                      }}
                      className="rounded-xl text-xs"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminPaymentVerifications;
