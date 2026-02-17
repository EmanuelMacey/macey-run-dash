import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { DollarSign, TrendingUp, Calendar, Truck } from "lucide-react";
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
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 rounded-2xl bg-card animate-pulse" />
        ))}
      </div>
    );
  }

  const stats = [
    { icon: DollarSign, label: "Today", value: `$${todayEarnings.toLocaleString()}`, sub: "GYD", color: "text-primary" },
    { icon: TrendingUp, label: "This Week", value: `$${weekEarnings.toLocaleString()}`, sub: "GYD", color: "text-accent" },
    { icon: Truck, label: "Today's Trips", value: todayOrders.length.toString(), sub: "deliveries", color: "text-success" },
    { icon: Calendar, label: "Week's Trips", value: weekOrders.length.toString(), sub: "deliveries", color: "text-warning" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-card/90 backdrop-blur-sm border border-border/50 rounded-2xl p-4 hover:shadow-lg hover:shadow-primary/5 transition-all glow-card">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${stat.color} bg-current/10`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
          </div>
          <div className="font-display font-bold text-xl text-foreground">{stat.value}</div>
          <span className="text-[10px] text-muted-foreground">{stat.sub}</span>
        </div>
      ))}
    </div>
  );
};

export default DriverEarnings;
