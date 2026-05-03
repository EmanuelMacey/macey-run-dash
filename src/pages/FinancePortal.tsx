import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  TrendingUp,
  Wallet,
  Receipt,
  Search,
  Trash2,
  Download,
  LineChart,
} from "lucide-react";

type FinanceLog = {
  id: string;
  trace_code: string;
  log_type: "delivery" | "errand";
  log_date: string;
  customer_name: string;
  customer_phone: string | null;
  pickup_address: string | null;
  dropoff_address: string | null;
  distance_km: number | null;
  gross_amount: number;
  platform_fee: number;
  driver_payout: number;
  net_profit: number;
  payment_method: "cash" | "mmg";
  payment_status: "paid" | "pending" | "refunded";
  driver_name: string | null;
  notes: string | null;
  created_at: string;
};

const emptyForm = {
  log_type: "delivery" as "delivery" | "errand",
  log_date: new Date().toISOString().slice(0, 10),
  customer_name: "",
  customer_phone: "",
  pickup_address: "",
  dropoff_address: "",
  distance_km: "",
  gross_amount: "",
  platform_fee: "100",
  driver_payout: "",
  payment_method: "cash" as "cash" | "mmg",
  payment_status: "paid" as "paid" | "pending" | "refunded",
  driver_name: "",
  notes: "",
};

const fmt = (n: number) =>
  `$${Number(n || 0).toLocaleString("en-US")} GYD`;

export default function FinancePortal() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<FinanceLog[]>([]);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "delivery" | "errand">("all");
  const [period, setPeriod] = useState<"today" | "7d" | "30d" | "all">("30d");

  useEffect(() => {
    if (!loading && (!user || role !== "admin")) {
      navigate("/login");
    }
  }, [user, role, loading, navigate]);

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from("finance_logs")
      .select("*")
      .order("log_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) {
      toast.error(error.message);
      return;
    }
    setLogs((data as FinanceLog[]) || []);
  };

  useEffect(() => {
    if (user && role === "admin") fetchLogs();
  }, [user, role]);

  // Auto compute net_profit preview
  const previewNet = useMemo(() => {
    const g = Number(form.gross_amount || 0);
    const f = Number(form.platform_fee || 0);
    const d = Number(form.driver_payout || 0);
    return g - d; // platform earns fee + (gross - payout - fee) — but net profit to platform = gross - driver_payout
  }, [form.gross_amount, form.platform_fee, form.driver_payout]);

  const handleSubmit = async () => {
    if (!form.customer_name.trim() || !form.gross_amount) {
      toast.error("Customer name and gross amount are required.");
      return;
    }
    setBusy(true);
    const gross = Number(form.gross_amount);
    const fee = Number(form.platform_fee || 0);
    const payout = Number(form.driver_payout || 0);
    const net = gross - payout;

    const { error } = await supabase.from("finance_logs").insert([{
      trace_code: "",
      log_type: form.log_type,
      log_date: form.log_date,
      customer_name: form.customer_name.trim(),
      customer_phone: form.customer_phone.trim(),
      pickup_address: form.pickup_address.trim(),
      dropoff_address: form.dropoff_address.trim(),
      distance_km: form.distance_km ? Number(form.distance_km) : 0,
      gross_amount: gross,
      platform_fee: fee,
      driver_payout: payout,
      net_profit: net,
      payment_method: form.payment_method,
      payment_status: form.payment_status,
      driver_name: form.driver_name.trim(),
      notes: form.notes.trim(),
      created_by: user?.id,
    }]);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Logged successfully");
    setOpen(false);
    setForm(emptyForm);
    fetchLogs();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this log entry?")) return;
    const { error } = await supabase.from("finance_logs").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    fetchLogs();
  };

  const filtered = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(now);
    if (period === "today") cutoff.setHours(0, 0, 0, 0);
    else if (period === "7d") cutoff.setDate(now.getDate() - 7);
    else if (period === "30d") cutoff.setDate(now.getDate() - 30);

    return logs.filter((l) => {
      if (filter !== "all" && l.log_type !== filter) return false;
      if (period !== "all" && new Date(l.log_date) < cutoff) return false;
      if (search) {
        const s = search.toLowerCase();
        return (
          l.trace_code.toLowerCase().includes(s) ||
          l.customer_name.toLowerCase().includes(s) ||
          (l.driver_name || "").toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [logs, filter, period, search]);

  const stats = useMemo(() => {
    const gross = filtered.reduce((s, l) => s + l.gross_amount, 0);
    const payouts = filtered.reduce((s, l) => s + l.driver_payout, 0);
    const fees = filtered.reduce((s, l) => s + l.platform_fee, 0);
    const net = filtered.reduce((s, l) => s + l.net_profit, 0);
    return { gross, payouts, fees, net, count: filtered.length };
  }, [filtered]);

  const exportCsv = () => {
    const headers = [
      "Trace",
      "Date",
      "Type",
      "Customer",
      "Driver",
      "Pickup",
      "Dropoff",
      "Distance(km)",
      "Gross",
      "Fee",
      "Payout",
      "Net",
      "Method",
      "Status",
      "Notes",
    ];
    const rows = filtered.map((l) => [
      l.trace_code,
      l.log_date,
      l.log_type,
      l.customer_name,
      l.driver_name || "",
      l.pickup_address || "",
      l.dropoff_address || "",
      l.distance_km || 0,
      l.gross_amount,
      l.platform_fee,
      l.driver_payout,
      l.net_profit,
      l.payment_method,
      l.payment_status,
      (l.notes || "").replace(/[\r\n,]/g, " "),
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `maceyrunners-finance-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return null;

  return (
    <div className="min-h-[100dvh] bg-[#0a0e1a] text-slate-100 font-mono">
      {/* subtle grid backdrop */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <header className="relative border-b border-emerald-500/20 bg-[#0a0e1a]/90 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="text-slate-400 hover:text-emerald-400 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-emerald-400">
                  LEDGER<span className="text-slate-300">.macey</span>
                </h1>
              </div>
              <p className="text-[11px] text-slate-500 uppercase tracking-widest">
                Private finance terminal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportCsv}
              className="border-emerald-500/40 bg-transparent text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200"
            >
              <Download className="w-4 h-4 mr-1.5" />
              Export
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  New Log
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#0f1524] border-emerald-500/20 text-slate-100 max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-emerald-400">
                    Log new entry
                  </DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-slate-400">Type</Label>
                    <Select
                      value={form.log_type}
                      onValueChange={(v: "delivery" | "errand") =>
                        setForm({ ...form, log_type: v })
                      }
                    >
                      <SelectTrigger className="bg-slate-900 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="delivery">Delivery</SelectItem>
                        <SelectItem value="errand">Errand</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400">Date</Label>
                    <Input
                      type="date"
                      value={form.log_date}
                      onChange={(e) =>
                        setForm({ ...form, log_date: e.target.value })
                      }
                      className="bg-slate-900 border-slate-700"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400">Customer name *</Label>
                    <Input
                      value={form.customer_name}
                      onChange={(e) =>
                        setForm({ ...form, customer_name: e.target.value })
                      }
                      className="bg-slate-900 border-slate-700"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400">Customer phone</Label>
                    <Input
                      value={form.customer_phone}
                      onChange={(e) =>
                        setForm({ ...form, customer_phone: e.target.value })
                      }
                      className="bg-slate-900 border-slate-700"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400">Pickup</Label>
                    <Input
                      value={form.pickup_address}
                      onChange={(e) =>
                        setForm({ ...form, pickup_address: e.target.value })
                      }
                      className="bg-slate-900 border-slate-700"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400">Dropoff</Label>
                    <Input
                      value={form.dropoff_address}
                      onChange={(e) =>
                        setForm({ ...form, dropoff_address: e.target.value })
                      }
                      className="bg-slate-900 border-slate-700"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400">Distance (km)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={form.distance_km}
                      onChange={(e) =>
                        setForm({ ...form, distance_km: e.target.value })
                      }
                      className="bg-slate-900 border-slate-700"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400">Driver name</Label>
                    <Input
                      value={form.driver_name}
                      onChange={(e) =>
                        setForm({ ...form, driver_name: e.target.value })
                      }
                      className="bg-slate-900 border-slate-700"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400">Gross (GYD) *</Label>
                    <Input
                      type="number"
                      value={form.gross_amount}
                      onChange={(e) =>
                        setForm({ ...form, gross_amount: e.target.value })
                      }
                      className="bg-slate-900 border-slate-700"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400">Platform fee</Label>
                    <Input
                      type="number"
                      value={form.platform_fee}
                      onChange={(e) =>
                        setForm({ ...form, platform_fee: e.target.value })
                      }
                      className="bg-slate-900 border-slate-700"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400">Driver payout</Label>
                    <Input
                      type="number"
                      value={form.driver_payout}
                      onChange={(e) =>
                        setForm({ ...form, driver_payout: e.target.value })
                      }
                      className="bg-slate-900 border-slate-700"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400">Method</Label>
                    <Select
                      value={form.payment_method}
                      onValueChange={(v: "cash" | "mmg") =>
                        setForm({ ...form, payment_method: v })
                      }
                    >
                      <SelectTrigger className="bg-slate-900 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="mmg">MMG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400">Status</Label>
                    <Select
                      value={form.payment_status}
                      onValueChange={(v: "paid" | "pending" | "refunded") =>
                        setForm({ ...form, payment_status: v })
                      }
                    >
                      <SelectTrigger className="bg-slate-900 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-xs text-slate-400">Notes</Label>
                    <Textarea
                      value={form.notes}
                      onChange={(e) =>
                        setForm({ ...form, notes: e.target.value })
                      }
                      className="bg-slate-900 border-slate-700"
                      rows={2}
                    />
                  </div>
                  <div className="sm:col-span-2 rounded-md border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm">
                    <span className="text-slate-400">Net profit preview: </span>
                    <span className="text-emerald-400 font-semibold">
                      {fmt(previewNet)}
                    </span>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleSubmit}
                    disabled={busy}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                  >
                    {busy ? "Saving…" : "Save entry"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              label: "Gross Revenue",
              value: fmt(stats.gross),
              icon: TrendingUp,
              color: "text-emerald-400",
            },
            {
              label: "Net Profit",
              value: fmt(stats.net),
              icon: LineChart,
              color: "text-cyan-400",
            },
            {
              label: "Driver Payouts",
              value: fmt(stats.payouts),
              icon: Wallet,
              color: "text-amber-400",
            },
            {
              label: "Entries",
              value: stats.count.toString(),
              icon: Receipt,
              color: "text-slate-300",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="relative rounded-lg border border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-950 p-4 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-widest text-slate-500">
                  {s.label}
                </span>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div className={`text-lg sm:text-xl font-semibold ${s.color}`}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <Input
              placeholder="Search trace, customer, driver…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-slate-900 border-slate-800 text-slate-100"
            />
          </div>
          <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
            <SelectTrigger className="w-full sm:w-36 bg-slate-900 border-slate-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="delivery">Deliveries</SelectItem>
              <SelectItem value="errand">Errands</SelectItem>
            </SelectContent>
          </Select>
          <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
            <SelectTrigger className="w-full sm:w-36 bg-slate-900 border-slate-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Ledger */}
        <div className="rounded-lg border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/80 text-slate-400 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="text-left px-3 py-2.5">Trace</th>
                  <th className="text-left px-3 py-2.5">Date</th>
                  <th className="text-left px-3 py-2.5">Type</th>
                  <th className="text-left px-3 py-2.5">Customer</th>
                  <th className="text-left px-3 py-2.5 hidden md:table-cell">
                    Driver
                  </th>
                  <th className="text-right px-3 py-2.5">Gross</th>
                  <th className="text-right px-3 py-2.5 hidden sm:table-cell">
                    Payout
                  </th>
                  <th className="text-right px-3 py-2.5">Net</th>
                  <th className="text-left px-3 py-2.5 hidden md:table-cell">
                    Status
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10} className="text-center py-12 text-slate-500">
                      No entries — click "New Log" to add your first.
                    </td>
                  </tr>
                )}
                {filtered.map((l) => (
                  <tr
                    key={l.id}
                    className="border-t border-slate-800 hover:bg-slate-900/40 transition"
                  >
                    <td className="px-3 py-2.5 text-emerald-400 font-semibold">
                      {l.trace_code}
                    </td>
                    <td className="px-3 py-2.5 text-slate-400">
                      {l.log_date}
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge
                        variant="outline"
                        className={
                          l.log_type === "delivery"
                            ? "border-cyan-500/40 text-cyan-300 bg-cyan-500/5"
                            : "border-amber-500/40 text-amber-300 bg-amber-500/5"
                        }
                      >
                        {l.log_type}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 text-slate-200">
                      {l.customer_name}
                    </td>
                    <td className="px-3 py-2.5 text-slate-400 hidden md:table-cell">
                      {l.driver_name || "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right text-slate-200">
                      {fmt(l.gross_amount)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-slate-400 hidden sm:table-cell">
                      {fmt(l.driver_payout)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-emerald-400 font-semibold">
                      {fmt(l.net_profit)}
                    </td>
                    <td className="px-3 py-2.5 hidden md:table-cell">
                      <span
                        className={`text-xs ${
                          l.payment_status === "paid"
                            ? "text-emerald-400"
                            : l.payment_status === "pending"
                            ? "text-amber-400"
                            : "text-rose-400"
                        }`}
                      >
                        {l.payment_status}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-right">
                      <button
                        onClick={() => handleDelete(l.id)}
                        className="text-slate-600 hover:text-rose-400 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-600 uppercase tracking-widest pb-6">
          MaceyRunners · Private Ledger · {new Date().getFullYear()}
        </p>
      </main>
    </div>
  );
}
