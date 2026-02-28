import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Inbox, Zap, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
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

    const { data: available } = await supabase.from("orders").select("*").eq("status", "pending").is("driver_id", null).order("created_at", { ascending: true });
    const { data: active } = await supabase.from("orders").select("*").eq("driver_id", user.id).in("status", ["accepted", "picked_up", "on_the_way"]).order("created_at", { ascending: false }).limit(1);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { data: completed } = await supabase.from("orders").select("*").eq("driver_id", user.id).eq("status", "delivered").gte("updated_at", todayStart.toISOString()).order("updated_at", { ascending: false });

    setAvailableOrders(available || []);
    setActiveOrder(active?.[0] || null);
    setCompletedToday(completed || []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [user]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel("driver-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => fetchOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  if (!isOnline) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card/90 backdrop-blur-sm border border-border/50 rounded-2xl p-10 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-muted/80 flex items-center justify-center mx-auto mb-4">
          <Inbox className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="font-display font-bold text-foreground mb-1">You're offline</h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Go online using the button above to start receiving delivery requests.
        </p>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-36 w-full rounded-2xl" />
        <Skeleton className="h-36 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Order */}
      {activeOrder && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <h2 className="font-display text-base font-bold text-foreground">Active Order</h2>
            <span className="w-2 h-2 rounded-full bg-success animate-pulse ml-auto" />
          </div>
          <DriverOrderCard order={activeOrder} onUpdated={fetchOrders} />
        </motion.div>
      )}

      {/* Available Orders */}
      {!activeOrder && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center">
              <Inbox className="h-3.5 w-3.5 text-accent" />
            </div>
            <h2 className="font-display text-base font-bold text-foreground">Available Orders</h2>
            {availableOrders.length > 0 && (
              <span className="ml-auto text-xs font-bold text-accent bg-accent/10 rounded-full px-2.5 py-0.5">
                {availableOrders.length}
              </span>
            )}
          </div>
          {availableOrders.length === 0 ? (
            <div className="bg-card/90 backdrop-blur-sm border border-border/50 rounded-2xl p-10 text-center">
              <div className="w-14 h-14 rounded-2xl bg-muted/80 flex items-center justify-center mx-auto mb-3">
                <Inbox className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-display font-semibold text-foreground text-sm mb-1">No orders right now</h3>
              <p className="text-muted-foreground text-xs">Stay online — new orders will appear here automatically.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableOrders.map((order, i) => (
                <motion.div key={order.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <DriverOrderCard order={order} isAvailable onUpdated={fetchOrders} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Completed Today */}
      {completedToday.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-success/15 flex items-center justify-center">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
            </div>
            <h2 className="font-display text-base font-bold text-foreground">Completed Today</h2>
            <span className="ml-auto text-xs font-bold text-success bg-success/10 rounded-full px-2.5 py-0.5">
              {completedToday.length}
            </span>
          </div>
          <div className="space-y-3">
            {completedToday.map((order) => (
              <DriverOrderCard key={order.id} order={order} onUpdated={fetchOrders} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DriverOrderFeed;
