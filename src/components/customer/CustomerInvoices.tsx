import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { FileText } from "lucide-react";

interface Invoice {
  id: string;
  order_id: string;
  invoice_number: number;
  amount: number;
  total_amount: number;
  status: string;
  created_at: string;
}

const CustomerInvoices = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setInvoices((data as Invoice[]) || []);
        setLoading(false);
      });
  }, [user]);

  if (loading) return <div className="p-4 text-muted-foreground text-sm">Loading invoices...</div>;

  if (invoices.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground border border-border/50 rounded-2xl">
        <FileText className="h-8 w-8 mx-auto mb-3 opacity-40" />
        <p className="text-sm">No invoices yet</p>
        <p className="text-xs mt-1">Invoices are generated when your orders are delivered.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="font-display text-xl font-bold text-foreground">My Invoices</h2>
      {invoices.map((inv) => (
        <Card key={inv.id} className="p-4 border border-border/50 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <span className="font-display font-semibold text-sm text-foreground">INV-{String(inv.invoice_number).padStart(4, '0')}</span>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(inv.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-display font-bold text-primary">${inv.total_amount.toLocaleString()}</p>
              <Badge variant="outline" className="text-[10px]">{inv.status}</Badge>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default CustomerInvoices;
