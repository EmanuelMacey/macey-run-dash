import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import type { Tables, Enums } from "@/integrations/supabase/types";

type Order = Tables<"orders">;

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  accepted: "secondary",
  picked_up: "secondary",
  on_the_way: "default",
  delivered: "default",
  cancelled: "destructive",
};

const ALL_STATUSES: Enums<"order_status">[] = ["pending", "accepted", "picked_up", "on_the_way", "delivered", "cancelled"];

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const fetchOrders = async () => {
    let query = supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (filterStatus !== "all") {
      query = query.eq("status", filterStatus as Enums<"order_status">);
    }
    const { data } = await query;
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const updateStatus = async (orderId: string, newStatus: Enums<"order_status">) => {
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(`Order updated to ${newStatus.replace("_", " ")}`);
      fetchOrders();
    }
  };

  if (loading) return <div className="p-8 text-muted-foreground">Loading orders...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Filter:</span>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {ALL_STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground ml-auto">{orders.length} orders</span>
      </div>

      {orders.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">No orders found.</Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={STATUS_VARIANT[order.status] || "outline"} className="capitalize">
                      {order.status.replace("_", " ")}
                    </Badge>
                    <Badge variant="secondary" className="capitalize">{order.order_type}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-foreground truncate"><span className="font-medium">From:</span> {order.pickup_address}</p>
                  <p className="text-sm text-foreground truncate"><span className="font-medium">To:</span> {order.dropoff_address}</p>
                  {order.description && <p className="text-xs text-muted-foreground mt-1">{order.description}</p>}
                  <p className="text-sm font-display font-bold text-primary mt-1">${order.price.toLocaleString()} GYD</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Select
                    value={order.status}
                    onValueChange={(val) => updateStatus(order.id, val as Enums<"order_status">)}
                  >
                    <SelectTrigger className="w-36 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_STATUSES.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize text-xs">{s.replace("_", " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
