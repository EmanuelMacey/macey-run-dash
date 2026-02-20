import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { FileText, Send, Download } from "lucide-react";

interface Invoice {
  id: string;
  order_id: string;
  customer_id: string;
  invoice_number: number;
  amount: number;
  tax_amount: number;
  total_amount: number;
  status: string;
  notes: string | null;
  created_at: string;
  sent_at: string | null;
}

const AdminInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customerMap, setCustomerMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);

  const fetchInvoices = async () => {
    const { data } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });
    const inv = (data as Invoice[]) || [];
    setInvoices(inv);
    setLoading(false);

    if (inv.length > 0) {
      const customerIds = [...new Set(inv.map(i => i.customer_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", customerIds);
      if (profiles) {
        const map: Record<string, string> = {};
        profiles.forEach(p => { map[p.user_id] = p.full_name; });
        setCustomerMap(map);
      }
    }
  };

  useEffect(() => { fetchInvoices(); }, []);

  const sendInvoice = async (invoice: Invoice) => {
    setSending(invoice.id);
    try {
      const { error } = await supabase.functions.invoke("send-order-email", {
        body: {
          type: "invoice",
          order_id: invoice.order_id,
          invoice_id: invoice.id,
        },
      });
      if (error) throw error;

      await supabase
        .from("invoices")
        .update({ status: "sent", sent_at: new Date().toISOString() } as any)
        .eq("id", invoice.id);

      toast.success("Invoice sent to customer");
      fetchInvoices();
    } catch (e: any) {
      toast.error("Failed to send invoice: " + (e.message || "Unknown error"));
    } finally {
      setSending(null);
    }
  };

  if (loading) return <div className="p-8 text-muted-foreground">Loading invoices...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground">Invoices</h2>
        <span className="text-sm text-muted-foreground">{invoices.length} invoices</span>
      </div>

      {invoices.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">No invoices yet. They are auto-generated when orders are delivered.</Card>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => (
            <Card key={inv.id} className="p-4 border border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-semibold text-sm text-foreground">INV-{String(inv.invoice_number).padStart(4, '0')}</span>
                      <Badge variant={inv.status === "sent" ? "default" : inv.status === "paid" ? "default" : "outline"} className="text-[10px]">
                        {inv.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {customerMap[inv.customer_id] || "Customer"} • {formatDistanceToNow(new Date(inv.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-display font-bold text-lg text-primary">${inv.total_amount.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">GYD</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => sendInvoice(inv)}
                    disabled={sending === inv.id}
                    className="rounded-full gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {sending === inv.id ? "Sending..." : inv.sent_at ? "Resend" : "Send"}
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

export default AdminInvoices;
