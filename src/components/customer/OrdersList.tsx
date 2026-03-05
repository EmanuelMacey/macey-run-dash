import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Clock, Package, Filter, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
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
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");

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

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("customer-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `customer_id=eq.${user.id}` }, () => fetchOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const activeOrders = orders.filter((o) =>
    ["pending", "accepted", "picked_up", "on_the_way"].includes(o.status)
  );
  
  const pastOrders = orders.filter((o) =>
    ["delivered", "cancelled"].includes(o.status)
  );

  // Apply filters to past orders
  const filteredPastOrders = pastOrders.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (typeFilter !== "all" && o.order_type !== typeFilter) return false;
    if (dateFilter) {
      const orderDate = new Date(o.created_at).toISOString().split("T")[0];
      if (orderDate !== dateFilter) return false;
    }
    return true;
  });

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
      <TabsList className="w-full bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-1">
        <TabsTrigger value="active" className="flex-1 gap-1 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <Clock className="h-3.5 w-3.5" />
          Active ({activeOrders.length})
        </TabsTrigger>
        <TabsTrigger value="history" className="flex-1 gap-1 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <Package className="h-3.5 w-3.5" />
          History ({pastOrders.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="active" className="space-y-3 mt-4">
        {activeOrders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm bg-card/60 backdrop-blur-sm rounded-2xl border border-border/30">
            No active orders. Place one above!
          </div>
        ) : (
          activeOrders.map((order) => (
            <OrderCard key={order.id} order={order} onUpdated={fetchOrders} />
          ))
        )}
      </TabsContent>

      <TabsContent value="history" className="space-y-4 mt-4">
        {/* Filters */}
        <div className="flex gap-2 flex-wrap items-center bg-card/60 backdrop-blur-sm rounded-2xl p-3 border border-border/30">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px] h-8 text-xs rounded-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[130px] h-8 text-xs rounded-xl">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="delivery">Delivery</SelectItem>
              <SelectItem value="errand">Errand</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative">
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
              className="h-8 text-xs pl-8 w-[140px] rounded-xl" />
          </div>
          {(statusFilter !== "all" || typeFilter !== "all" || dateFilter) && (
            <button onClick={() => { setStatusFilter("all"); setTypeFilter("all"); setDateFilter(""); }}
              className="text-xs text-primary hover:underline font-medium">
              Clear
            </button>
          )}
        </div>

        {filteredPastOrders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm bg-card/60 backdrop-blur-sm rounded-2xl border border-border/30">
            {pastOrders.length === 0 ? "No past orders yet." : "No orders match your filters."}
          </div>
        ) : (
          filteredPastOrders.map((order, index) => (
            <OrderCard key={order.id} order={order} onUpdated={fetchOrders} autoPromptRating={index === 0 && order.status === "delivered"} />
          ))
        )}
      </TabsContent>
    </Tabs>
  );
};

export default OrdersList;
