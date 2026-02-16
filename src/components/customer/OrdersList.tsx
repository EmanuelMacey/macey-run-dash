import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Clock, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OrderCard from "./OrderCard";
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"orders">;

interface OrdersListProps {
  refreshKey: number;
}

const OrdersList = ({ refreshKey }: OrdersListProps) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [user, refreshKey]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("customer-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `customer_id=eq.${user.id}`,
        },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const activeOrders = orders.filter((o) =>
    ["pending", "accepted", "picked_up", "on_the_way"].includes(o.status)
  );
  const pastOrders = orders.filter((o) =>
    ["delivered", "cancelled"].includes(o.status)
  );

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="active" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger value="active" className="flex-1 gap-1">
          <Clock className="h-3.5 w-3.5" />
          Active ({activeOrders.length})
        </TabsTrigger>
        <TabsTrigger value="history" className="flex-1 gap-1">
          <Package className="h-3.5 w-3.5" />
          History ({pastOrders.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="active" className="space-y-3 mt-4">
        {activeOrders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No active orders. Place one above!
          </div>
        ) : (
          activeOrders.map((order) => (
            <OrderCard key={order.id} order={order} onUpdated={fetchOrders} />
          ))
        )}
      </TabsContent>

      <TabsContent value="history" className="space-y-3 mt-4">
        {pastOrders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No past orders yet.
          </div>
        ) : (
          pastOrders.map((order) => (
            <OrderCard key={order.id} order={order} onUpdated={fetchOrders} />
          ))
        )}
      </TabsContent>
    </Tabs>
  );
};

export default OrdersList;
