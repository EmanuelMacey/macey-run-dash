import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Download, Mail, BarChart3 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Period = "daily" | "weekly";

interface Report {
  period: Period;
  range: { start: string; end: string };
  totals: {
    orders_created: number;
    delivered: number;
    cancelled: number;
    revenue: number;
    platform_fees: number;
    avg_order_value: number;
  };
  breakdown: {
    by_type: { delivery: number; errand: number };
    by_vehicle: { bike: number; car: number };
    by_payment: { cash: number; mmg: number };
  };
}

const fmt = (n: number) => `$${Number(n || 0).toLocaleString()} GYD`;

const AdminReports = () => {
  const [period, setPeriod] = useState<Period>("daily");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [report, setReport] = useState<Report | null>(null);

  const fetchReport = async (p: Period, sendEmail = false) => {
    sendEmail ? setSending(true) : setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-summary-report", {
        body: { period: p, send_email: sendEmail },
      });
      if (error) throw error;
      setReport(data.report);
      if (sendEmail) {
        toast.success(`Report emailed to ${data.email?.sent ?? 0} admin(s)`);
      } else {
        toast.success("Report loaded");
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to load report");
    } finally {
      setLoading(false);
      setSending(false);
    }
  };

  const downloadPdf = () => {
    if (!report) return;
    const doc = new jsPDF();
    const title = `MaceyRunners ${report.period === "daily" ? "Daily" : "Weekly"} Summary`;
    const date = new Date(report.range.start).toLocaleDateString("en-GB", { dateStyle: "long" });

    doc.setFillColor(30, 58, 138);
    doc.rect(0, 0, 210, 28, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text(title, 14, 14);
    doc.setFontSize(10);
    doc.text(`Range: ${new Date(report.range.start).toLocaleString()} → ${new Date(report.range.end).toLocaleString()}`, 14, 22);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Revenue: ${fmt(report.totals.revenue)}`, 14, 40);
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text(`Generated ${new Date().toLocaleString()} · ${date}`, 14, 46);
    doc.setTextColor(0, 0, 0);

    autoTable(doc, {
      startY: 54,
      head: [["Metric", "Value"]],
      body: [
        ["Orders created", String(report.totals.orders_created)],
        ["Delivered", String(report.totals.delivered)],
        ["Cancelled", String(report.totals.cancelled)],
        ["Revenue", fmt(report.totals.revenue)],
        ["Platform service fees", fmt(report.totals.platform_fees)],
        ["Avg order value", fmt(report.totals.avg_order_value)],
        ["Deliveries", String(report.breakdown.by_type.delivery)],
        ["Errands", String(report.breakdown.by_type.errand)],
        ["Bike routes", String(report.breakdown.by_vehicle.bike)],
        ["Car routes", String(report.breakdown.by_vehicle.car)],
        ["Cash orders", String(report.breakdown.by_payment.cash)],
        ["MMG orders", String(report.breakdown.by_payment.mmg)],
      ],
      headStyles: { fillColor: [249, 115, 22] },
      theme: "striped",
    });

    doc.save(`maceyrunners-${report.period}-summary-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const Stat = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-1 font-display text-2xl font-bold ${accent ? "text-primary" : ""}`}>{value}</div>
    </div>
  );

  return (
    <Card className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h2 className="font-display text-lg font-bold">Summary Reports</h2>
      </div>

      <Tabs value={period} onValueChange={(v) => { setPeriod(v as Period); setReport(null); }}>
        <TabsList>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
        </TabsList>

        {(["daily", "weekly"] as Period[]).map((p) => (
          <TabsContent key={p} value={p} className="space-y-4 pt-3">
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => fetchReport(p, false)} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <BarChart3 className="h-4 w-4 mr-2" />}
                Generate {p} report
              </Button>
              <Button variant="outline" onClick={() => fetchReport(p, true)} disabled={sending}>
                {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
                Email to admins
              </Button>
              <Button variant="outline" onClick={downloadPdf} disabled={!report}>
                <Download className="h-4 w-4 mr-2" /> Download PDF
              </Button>
            </div>

            {report && report.period === p && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Stat label="Revenue" value={fmt(report.totals.revenue)} accent />
                  <Stat label="Delivered" value={String(report.totals.delivered)} />
                  <Stat label="Created" value={String(report.totals.orders_created)} />
                  <Stat label="Cancelled" value={String(report.totals.cancelled)} />
                  <Stat label="Avg order" value={fmt(report.totals.avg_order_value)} />
                  <Stat label="Platform fees" value={fmt(report.totals.platform_fees)} />
                  <Stat label="Bike / Car" value={`${report.breakdown.by_vehicle.bike} / ${report.breakdown.by_vehicle.car}`} />
                  <Stat label="Cash / MMG" value={`${report.breakdown.by_payment.cash} / ${report.breakdown.by_payment.mmg}`} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Range: {new Date(report.range.start).toLocaleString()} → {new Date(report.range.end).toLocaleString()}
                </p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <p className="text-xs text-muted-foreground border-t border-border pt-3">
        Reports are also auto-emailed to all admins daily at 8 AM and weekly on Monday at 8 AM.
      </p>
    </Card>
  );
};

export default AdminReports;
