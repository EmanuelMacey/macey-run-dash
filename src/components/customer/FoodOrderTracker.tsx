import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Package, Truck, Clock, CheckCircle2, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"orders">;

const STATUS_STEPS = [
  { key: "pending", label: "Order Placed", icon: Clock },
  { key: "accepted", label: "Driver Assigned", icon: CheckCircle2 },
  { key: "picked_up", label: "Picked Up", icon: Package },
  { key: "on_the_way", label: "On The Way", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

const statusIndex = (status: string) => STATUS_STEPS.findIndex((s) => s.key === status);

const FoodOrderTracker = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_id", user.id)
      .eq("order_type", "delivery")
      .in("status", ["pending", "accepted", "picked_up", "on_the_way"])
      .order("created_at", { ascending: false });
    setOrders(data || []);
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("food-order-tracker")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "orders",
        filter: `customer_id=eq.${user.id}`,
      }, () => fetchOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  if (orders.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-1.5">
        <Truck className="h-4 w-4 text-primary" /> Active Food Orders
      </h3>
      {orders.map((order) => {
        const currentIdx = statusIndex(order.status);
        const storeName = order.pickup_address;
        const minutesAgo = Math.round((Date.now() - new Date(order.created_at).getTime()) / 60000);

        return (
          <div key={order.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display font-semibold text-sm text-foreground">{storeName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {minutesAgo < 1 ? "Just now" : `${minutesAgo}m ago`} • ${order.price.toLocaleString()} GYD
                </p>
              </div>
              <Badge variant={order.status === "on_the_way" ? "default" : "secondary"} className="text-xs">
                {STATUS_STEPS[currentIdx]?.label || order.status}
              </Badge>
            </div>

            {/* Progress steps */}
            <div className="flex items-center gap-1">
              {STATUS_STEPS.slice(0, 4).map((step, i) => {
                const active = i <= currentIdx;
                return (
                  <div key={step.key} className="flex-1 flex items-center gap-1">
                    <div className={`h-1.5 w-full rounded-full transition-colors ${active ? "bg-primary" : "bg-muted"}`} />
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2 text-xs text-muted-foreground">
              <span>To: {order.dropoff_address}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FoodOrderTracker;
