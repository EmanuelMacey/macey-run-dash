import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { DollarSign, TrendingUp, Calendar, Truck, Heart } from "lucide-react";
import { motion } from "framer-motion";

const SERVICE_FEE = 100;
const DRIVER_SPLIT = 0.6; // 60% of (price - tip - service fee)

interface OrderRow {
  id: string;
  price: number;
  tip_amount: number | null;
  status: string;
  updated_at: string;
}

const DriverEarnings = () => {
  const { user } = useAuth();
  const [todayOrders, setTodayOrders] = useState<OrderRow[]>([]);
  const [weekOrders, setWeekOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchEarnings = async () => {
      const now = new Date();
      const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const select = "id, price, tip_amount, status, updated_at";
      const [{ data: today }, { data: week }] = await Promise.all([
        (supabase as any).from("orders").select(select).eq("driver_id", user.id).eq("status", "delivered").gte("updated_at", todayStart.toISOString()),
        (supabase as any).from("orders").select(select).eq("driver_id", user.id).eq("status", "delivered").gte("updated_at", weekStart.toISOString()),
      ]);
      setTodayOrders(today || []);
      setWeekOrders(week || []);
      setLoading(false);
    };
    fetchEarnings();
  }, [user]);

  const breakdown = (orders: OrderRow[]) => {
    const tips = orders.reduce((s, o) => s + (o.tip_amount || 0), 0);
    const baseRevenue = orders.reduce((s, o) => {
      const base = Math.max(0, o.price - (o.tip_amount || 0) - SERVICE_FEE);
      return s + base;
    }, 0);
    const baseShare = Math.round(baseRevenue * DRIVER_SPLIT);
    return { tips, baseRevenue, baseShare, payout: baseShare + tips };
  };

  const today = breakdown(todayOrders);
  const week = breakdown(weekOrders);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map(i => (<div key={i} className="h-[100px] rounded-2xl bg-card animate-pulse" />))}
      </div>
    );
  }

  const stats = [
    { icon: DollarSign, label: "Today's Payout", value: `$${today.payout.toLocaleString()}`, sub: "GYD (share + tips)", gradient: "from-primary/15 to-primary/5", iconBg: "bg-primary/15", iconColor: "text-primary", valueColor: "text-primary" },
    { icon: TrendingUp, label: "Week's Payout", value: `$${week.payout.toLocaleString()}`, sub: "GYD (share + tips)", gradient: "from-accent/15 to-accent/5", iconBg: "bg-accent/15", iconColor: "text-accent", valueColor: "text-accent" },
    { icon: Truck, label: "Today's Trips", value: todayOrders.length.toString(), sub: "deliveries", gradient: "from-success/15 to-success/5", iconBg: "bg-success/15", iconColor: "text-success", valueColor: "text-success" },
    { icon: Calendar, label: "Week's Trips", value: weekOrders.length.toString(), sub: "deliveries", gradient: "from-warning/15 to-warning/5", iconBg: "bg-warning/15", iconColor: "text-warning", valueColor: "text-warning" },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`relative overflow-hidden bg-gradient-to-br ${stat.gradient} border border-border/30 rounded-2xl p-4 hover:shadow-lg transition-all`}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-9 h-9 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                <stat.icon className={`h-4.5 w-4.5 ${stat.iconColor}`} />
              </div>
              <span className="text-xs text-muted-foreground font-semibold">{stat.label}</span>
            </div>
            <div className={`font-display font-bold text-2xl ${stat.valueColor}`}>{stat.value}</div>
            <span className="text-[11px] text-muted-foreground font-medium">{stat.sub}</span>
          </motion.div>
        ))}
      </div>

      {/* Tip & fee breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-border/30 bg-card p-4 space-y-3"
      >
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
            <Heart className="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm">Earnings breakdown</h3>
            <p className="text-[11px] text-muted-foreground">Tips are paid 100% to you, on top of your 60% delivery share.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <BreakdownRow label="Today — delivery share (60%)" value={today.baseShare} />
          <BreakdownRow label="Today — tips (100%)" value={today.tips} accent />
          <BreakdownRow label="Week — delivery share (60%)" value={week.baseShare} />
          <BreakdownRow label="Week — tips (100%)" value={week.tips} accent />
        </div>
      </motion.div>
    </div>
  );
};

const BreakdownRow = ({ label, value, accent }: { label: string; value: number; accent?: boolean }) => (
  <div className="rounded-xl bg-muted/50 px-3 py-2.5 flex flex-col gap-0.5">
    <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</span>
    <span className={`font-display font-bold text-base ${accent ? "text-primary" : "text-foreground"}`}>
      ${value.toLocaleString()} <span className="text-[10px] font-medium text-muted-foreground">GYD</span>
    </span>
  </div>
);

export default DriverEarnings;
