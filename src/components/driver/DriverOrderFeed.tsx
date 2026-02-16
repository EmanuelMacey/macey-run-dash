import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Inbox } from "lucide-react";
import DriverOrderCard from "./DriverOrderCard";
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"orders">;

interface DriverOrderFeedProps {
  isOnline: boolean;
}

const DriverOrderFeed = ({ isOnline }: DriverOrderFeedProps) => {
  const { user } = useAuth();
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [completedToday, setCompletedToday] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!user) return;

    // Fetch available (pending, unassigned) orders
    const { data: available } = await supabase
      .from("orders")
      .select("*")
      .eq("status", "pending")
      .is("driver_id", null)
      .order("created_at", { ascending: true });

    // Fetch my active order (accepted/picked_up/on_the_way)
    const { data: active } = await supabase
      .from("orders")
      .select("*")
      .eq("driver_id", user.id)
      .in("status", ["accepted", "picked_up", "on_the_way"])
      .order("created_at", { ascending: false })
      .limit(1);

    // Fetch today's completed orders
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { data: completed } = await supabase
      .from("orders")
      .select("*")
      .eq("driver_id", user.id)
      .eq("status", "delivered")
      .gte("updated_at", todayStart.toISOString())
      .order("updated_at", { ascending: false });

    setAvailableOrders(available || []);
    setActiveOrder(active?.[0] || null);
    setCompletedToday(completed || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  // Realtime subscription for order changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("driver-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (!isOnline) {
    return (
      <div className="bg-card border border-border rounded-2xl p-8 text-center">
        <p className="text-muted-foreground">Go online to start receiving orders.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Order */}
      {activeOrder && (
        <div>
          <h2 className="font-display text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Active Order
          </h2>
          <DriverOrderCard order={activeOrder} onUpdated={fetchOrders} />
        </div>
      )}

      {/* Available Orders */}
      {!activeOrder && (
        <div>
          <h2 className="font-display text-lg font-bold text-foreground mb-3">
            Available Orders ({availableOrders.length})
          </h2>
          {availableOrders.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <Inbox className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">No orders available right now. Stay online!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableOrders.map((order) => (
                <DriverOrderCard key={order.id} order={order} isAvailable onUpdated={fetchOrders} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Today's Completed */}
      {completedToday.length > 0 && (
        <div>
          <h2 className="font-display text-lg font-bold text-foreground mb-3">
            Completed Today ({completedToday.length})
          </h2>
          <div className="space-y-3">
            {completedToday.map((order) => (
              <DriverOrderCard key={order.id} order={order} onUpdated={fetchOrders} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverOrderFeed;
