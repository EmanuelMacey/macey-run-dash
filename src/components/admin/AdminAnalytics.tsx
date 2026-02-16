import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Users, ShoppingBag, DollarSign, Tag, TrendingUp, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  totalDrivers: number;
  pendingDrivers: number;
  activePromos: number;
  ordersByStatus: { name: string; value: number }[];
  recentOrders: { date: string; count: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: "hsl(40, 80%, 55%)",
  accepted: "hsl(215, 55%, 45%)",
  picked_up: "hsl(28, 85%, 55%)",
  on_the_way: "hsl(195, 60%, 45%)",
  delivered: "hsl(145, 55%, 42%)",
  cancelled: "hsl(0, 60%, 50%)",
};

const AdminAnalytics = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [ordersRes, driversRes, promosRes] = await Promise.all([
        supabase.from("orders").select("*"),
        supabase.from("drivers").select("*"),
        supabase.from("promo_codes").select("*").eq("is_active", true),
      ]);

      const orders = ordersRes.data || [];
      const drivers = driversRes.data || [];
      const promos = promosRes.data || [];

      const statusCounts: Record<string, number> = {};
      let totalRevenue = 0;
      const dailyCounts: Record<string, number> = {};

      orders.forEach((o) => {
        statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
        if (o.status === "delivered") totalRevenue += o.price;
        const day = o.created_at.slice(0, 10);
        dailyCounts[day] = (dailyCounts[day] || 0) + 1;
      });

      const ordersByStatus = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
      const recentOrders = Object.entries(dailyCounts)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-7)
        .map(([date, count]) => ({ date: date.slice(5), count }));

      setStats({
        totalOrders: orders.length,
        totalRevenue,
        totalDrivers: drivers.length,
        pendingDrivers: drivers.filter((d) => !d.is_approved).length,
        activePromos: promos.length,
        ordersByStatus,
        recentOrders,
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading || !stats) {
    return <div className="p-8 text-muted-foreground">Loading analytics...</div>;
  }

  const statCards = [
    { label: "Total Orders", value: stats.totalOrders.toString(), icon: ShoppingBag, color: "text-primary" },
    { label: "Revenue", value: `$${stats.totalRevenue.toLocaleString()} GYD`, icon: DollarSign, color: "text-accent" },
    { label: "Drivers", value: stats.totalDrivers.toString(), icon: Users, color: "text-primary" },
    { label: "Pending Approvals", value: stats.pendingDrivers.toString(), icon: Clock, color: "text-destructive" },
    { label: "Active Promos", value: stats.activePromos.toString(), icon: Tag, color: "text-accent" },
    { label: "Delivered", value: (stats.ordersByStatus.find((s) => s.name === "delivered")?.value || 0).toString(), icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="p-5">
            <Icon className={`h-5 w-5 ${color} mb-2`} />
            <p className="text-2xl font-display font-bold text-card-foreground">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-display font-semibold text-card-foreground mb-4">Orders (Last 7 Days)</h3>
          {stats.recentOrders.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.recentOrders}>
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm">No order data yet.</p>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="font-display font-semibold text-card-foreground mb-4">Orders by Status</h3>
          {stats.ordersByStatus.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={stats.ordersByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                    {stats.ordersByStatus.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "hsl(var(--muted))"} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1">
                {stats.ordersByStatus.map((s) => (
                  <div key={s.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ background: STATUS_COLORS[s.name] || "hsl(var(--muted))" }} />
                    <span className="text-muted-foreground capitalize">{s.name.replace("_", " ")}</span>
                    <span className="font-semibold text-card-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No orders yet.</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
