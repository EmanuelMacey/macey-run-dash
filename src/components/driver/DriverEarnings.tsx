import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { DollarSign, TrendingUp, Calendar, Truck } from "lucide-react";
import { motion } from "framer-motion";
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"orders">;

const DriverEarnings = () => {
  const { user } = useAuth();
  const [todayOrders, setTodayOrders] = useState<Order[]>([]);
  const [weekOrders, setWeekOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchEarnings = async () => {
      const now = new Date();
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);

      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const [{ data: today }, { data: week }] = await Promise.all([
        supabase.from("orders").select("*").eq("driver_id", user.id).eq("status", "delivered").gte("updated_at", todayStart.toISOString()),
        supabase.from("orders").select("*").eq("driver_id", user.id).eq("status", "delivered").gte("updated_at", weekStart.toISOString()),
      ]);

      setTodayOrders(today || []);
      setWeekOrders(week || []);
      setLoading(false);
    };

    fetchEarnings();
  }, [user]);

  const todayEarnings = todayOrders.reduce((sum, o) => sum + o.price, 0);
  const weekEarnings = weekOrders.reduce((sum, o) => sum + o.price, 0);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-[100px] rounded-2xl bg-card animate-pulse" />
        ))}
      </div>
    );
  }

  const stats = [
    { icon: DollarSign, label: "Today", value: `$${todayEarnings.toLocaleString()}`, sub: "GYD earned", gradient: "from-primary/15 to-primary/5", iconBg: "bg-primary/15", iconColor: "text-primary", valueColor: "text-primary" },
    { icon: TrendingUp, label: "This Week", value: `$${weekEarnings.toLocaleString()}`, sub: "GYD earned", gradient: "from-accent/15 to-accent/5", iconBg: "bg-accent/15", iconColor: "text-accent", valueColor: "text-accent" },
    { icon: Truck, label: "Today's Trips", value: todayOrders.length.toString(), sub: "deliveries", gradient: "from-success/15 to-success/5", iconBg: "bg-success/15", iconColor: "text-success", valueColor: "text-success" },
    { icon: Calendar, label: "Week's Trips", value: weekOrders.length.toString(), sub: "deliveries", gradient: "from-warning/15 to-warning/5", iconBg: "bg-warning/15", iconColor: "text-warning", valueColor: "text-warning" },
  ];

  return (
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
  );
};

export default DriverEarnings;
