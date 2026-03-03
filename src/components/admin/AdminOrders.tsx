import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { User, Package, MapPin, Clock, Truck } from "lucide-react";
import OrderReceipt from "@/components/customer/OrderReceipt";
import type { Tables, Enums } from "@/integrations/supabase/types";

type Order = Tables<"orders">;

interface CustomerInfo {
  full_name: string;
  phone: string | null;
  default_address: string | null;
}

interface DriverInfo {
  user_id: string;
  full_name: string;
  vehicle_type: string | null;
  license_plate: string | null;
  is_online: boolean;
  is_approved: boolean;
}

const STATUS_STEPS = [
  { key: "pending", label: "Pending" },
  { key: "accepted", label: "Accepted" },
  { key: "picked_up", label: "Picked Up" },
  { key: "on_the_way", label: "On The Way" },
  { key: "delivered", label: "Delivered" },
];

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
  const [orderItemsMap, setOrderItemsMap] = useState<Record<string, any[]>>({});
  const [customerMap, setCustomerMap] = useState<Record<string, CustomerInfo>>({});
  const [drivers, setDrivers] = useState<DriverInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const fetchDrivers = async () => {
    const { data: driverRecords } = await supabase
      .from("drivers")
      .select("user_id, vehicle_type, license_plate, is_online, is_approved")
      .eq("is_approved", true);
    
    if (driverRecords && driverRecords.length > 0) {
      const driverUserIds = driverRecords.map(d => d.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", driverUserIds);
      
      const profileMap: Record<string, string> = {};
      profiles?.forEach(p => { profileMap[p.user_id] = p.full_name; });

      setDrivers(driverRecords.map(d => ({
        ...d,
        full_name: profileMap[d.user_id] || "Unknown Driver",
      })));
    }
  };

  const fetchOrders = async () => {
    let query = supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (filterStatus !== "all") {
      query = query.eq("status", filterStatus as Enums<"order_status">);
    }
    const { data } = await query;
    setOrders(data || []);
    setLoading(false);

    if (data && data.length > 0) {
      const { data: items } = await supabase
        .from("order_items")
        .select("*")
        .in("order_id", data.map(o => o.id));
      if (items) {
        const map: Record<string, any[]> = {};
        items.forEach(item => {
          if (!map[item.order_id]) map[item.order_id] = [];
          map[item.order_id].push(item);
        });
        setOrderItemsMap(map);
      }

      const customerIds = [...new Set(data.map(o => o.customer_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, phone, default_address")
        .in("user_id", customerIds);
      if (profiles) {
        const cMap: Record<string, CustomerInfo> = {};
        profiles.forEach(p => {
          cMap[p.user_id] = { full_name: p.full_name, phone: p.phone, default_address: p.default_address };
        });
        setCustomerMap(cMap);
      }
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchDrivers();
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

  const assignDriver = async (orderId: string, driverUserId: string) => {
    const currentOrder = orders.find(o => o.id === orderId);
    const newStatus = currentOrder?.status === "pending" ? "accepted" : currentOrder?.status;
    
    const { error } = await supabase
      .from("orders")
      .update({ driver_id: driverUserId, status: newStatus })
      .eq("id", orderId);
    
    if (error) {
      toast.error("Failed to assign driver");
    } else {
      const driver = drivers.find(d => d.user_id === driverUserId);
      toast.success(`Assigned to ${driver?.full_name || "driver"}`);
      fetchOrders();
    }
  };

  if (loading) return <div className="p-8 text-muted-foreground">Loading orders...</div>;

  const getStepIndex = (status: string) => STATUS_STEPS.findIndex(s => s.key === status);
  const getProgress = (status: string) => {
    if (status === "cancelled") return 0;
    const idx = getStepIndex(status);
    return idx >= 0 ? ((idx + 1) / STATUS_STEPS.length) * 100 : 0;
  };

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
          {orders.map((order) => {
            const customer = customerMap[order.customer_id];
            const assignedDriver = drivers.find(d => d.user_id === order.driver_id);
            const isActive = ["accepted", "picked_up", "on_the_way"].includes(order.status);
            const stepIndex = getStepIndex(order.status);

            return (
              <div
                key={order.id}
                className={`relative overflow-hidden bg-card border rounded-2xl transition-all duration-300 ${isActive ? "border-primary/30 shadow-lg shadow-primary/10" : order.status === "cancelled" ? "border-destructive/30 opacity-75" : "border-border/50"}`}
              >
                {isActive && <div className="absolute top-0 left-0 right-0 h-1 gradient-primary" />}

                <div className="p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${order.order_type === "delivery" ? "gradient-primary" : "bg-accent"}`}>
                        {order.order_type === "delivery" ? (
                          <Package className="h-4 w-4 text-primary-foreground" />
                        ) : (
                          <MapPin className="h-4 w-4 text-accent-foreground" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-semibold text-sm capitalize text-foreground">{order.order_type}</span>
                          {order.order_number && (
                            <Badge variant="outline" className="text-[10px] px-1.5">#{order.order_number}</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-bold text-lg text-primary">${order.price.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">GYD</p>
                    </div>
                  </div>

                  {/* Progress bar for active orders */}
                  {order.status !== "cancelled" && (
                    <div className="space-y-1.5">
                      <Progress value={getProgress(order.status)} className="h-1.5" />
                      <div className="flex justify-between">
                        {STATUS_STEPS.map((step, i) => (
                          <span
                            key={step.key}
                            className={`text-[9px] ${i === stepIndex ? "font-semibold text-primary" : i < stepIndex ? "text-foreground" : "text-muted-foreground"}`}
                          >
                            {step.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Customer info */}
                  {customer && (
                    <div className="flex items-center gap-3 px-3 py-2.5 bg-muted/50 rounded-xl border border-border/30">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{customer.full_name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {customer.phone && <span>{customer.phone}</span>}
                          {customer.default_address && <span className="truncate">• {customer.default_address}</span>}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Driver assignment */}
                  <div className="flex items-center gap-3 px-3 py-2.5 bg-muted/50 rounded-xl border border-border/30">
                    <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center">
                      <Truck className="h-4 w-4 text-accent-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Assign Driver</p>
                      <Select
                        value={order.driver_id || "unassigned"}
                        onValueChange={(val) => {
                          if (val !== "unassigned") assignDriver(order.id, val);
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select a driver" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned" disabled>Unassigned</SelectItem>
                          {drivers.map((d) => (
                            <SelectItem key={d.user_id} value={d.user_id} className="text-xs">
                              <span className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${d.is_online ? "bg-green-500" : "bg-muted-foreground/30"}`} />
                                {d.full_name}
                                {d.vehicle_type && <span className="text-muted-foreground">• {d.vehicle_type}</span>}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Route */}
                  <div className="relative pl-6 space-y-3">
                    <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary to-accent" />
                    <div className="relative">
                      <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 border-primary bg-card flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-primary uppercase tracking-wide">Pickup</p>
                        <p className="text-sm text-foreground">{order.pickup_address}</p>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 border-accent bg-card flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-accent" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-accent uppercase tracking-wide">Dropoff</p>
                        <p className="text-sm text-foreground">{order.dropoff_address}</p>
                      </div>
                    </div>
                  </div>

                  {order.description && <p className="text-xs text-muted-foreground italic px-1">"{order.description}"</p>}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <Badge variant={STATUS_VARIANT[order.status] || "outline"} className="capitalize text-[10px] rounded-lg">
                        {order.status.replace("_", " ")}
                      </Badge>
                      <OrderReceipt order={order} orderItems={orderItemsMap[order.id] || []} customerName={customer?.full_name} />
                    </div>
                    <Select
                      value={order.status}
                      onValueChange={(val) => updateStatus(order.id, val as Enums<"order_status">)}
                    >
                      <SelectTrigger className="w-36 h-8 text-xs rounded-full">
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
