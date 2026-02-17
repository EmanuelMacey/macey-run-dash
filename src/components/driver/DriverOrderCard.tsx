import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Package, MapPin, CheckCircle2, Loader2, Navigation, ShoppingBag, User, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import OrderChat from "@/components/chat/OrderChat";
import DriverMap from "@/components/customer/DriverMap";
import OrderReceipt from "@/components/customer/OrderReceipt";
import { motion, AnimatePresence } from "framer-motion";
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"orders">;

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

interface CustomerInfo {
  full_name: string;
  phone: string | null;
  default_lat: number | null;
  default_lng: number | null;
  default_address: string | null;
}

const STATUS_STEPS = [
  { key: "accepted", label: "Accepted", icon: CheckCircle2 },
  { key: "picked_up", label: "Picked Up", icon: Package },
  { key: "on_the_way", label: "On The Way", icon: Navigation },
  { key: "delivered", label: "Delivered", icon: MapPin },
];

const NEXT_STATUS: Record<string, { label: string; next: string }> = {
  accepted: { label: "Mark Picked Up", next: "picked_up" },
  picked_up: { label: "On The Way", next: "on_the_way" },
  on_the_way: { label: "Mark Delivered", next: "delivered" },
};

interface DriverOrderCardProps {
  order: Order;
  isAvailable?: boolean;
  onUpdated: () => void;
}

const DriverOrderCard = ({ order, isAvailable = false, onUpdated }: DriverOrderCardProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customer, setCustomer] = useState<CustomerInfo | null>(null);
  const [showTracking, setShowTracking] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      const { data } = await supabase.from("order_items").select("id, product_name, quantity, unit_price").eq("order_id", order.id);
      if (data && data.length > 0) setOrderItems(data);
    };
    fetchItems();
  }, [order.id]);

  useEffect(() => {
    if (isAvailable || !order.driver_id) return;
    const fetchCustomer = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, phone, default_lat, default_lng, default_address")
        .eq("user_id", order.customer_id)
        .single();
      if (data) setCustomer(data as CustomerInfo);
    };
    fetchCustomer();
  }, [order.customer_id, order.driver_id, isAvailable]);

  const acceptOrder = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("orders").update({ driver_id: user.id, status: "accepted" }).eq("id", order.id);
      if (error) throw error;
      toast.success("Order accepted! 🎉");
      onUpdated();
    } catch (err: any) {
      toast.error(err.message || "Failed to accept order");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (nextStatus: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("orders").update({ status: nextStatus as any }).eq("id", order.id);
      if (error) throw error;
      toast.success(`Order marked as ${nextStatus.replace("_", " ")}`);
      onUpdated();
    } catch (err: any) {
      toast.error(err.message || "Failed to update order");
    } finally {
      setLoading(false);
    }
  };

  const statusInfo = NEXT_STATUS[order.status];
  const currentStepIndex = STATUS_STEPS.findIndex(s => s.key === order.status);
  const progressPercent = order.status === "delivered" ? 100 : Math.max(0, ((currentStepIndex + 1) / STATUS_STEPS.length) * 100);
  const isActive = ["accepted", "picked_up", "on_the_way"].includes(order.status);

  return (
    <div className={`relative overflow-hidden bg-card border rounded-2xl transition-all duration-300 ${isAvailable ? "border-accent/50 shadow-lg shadow-accent/10" : isActive ? "border-primary/30 shadow-lg shadow-primary/10" : "border-border/50"}`}>
      {/* Gradient accent bar */}
      {isActive && (
        <div className="absolute top-0 left-0 right-0 h-1 gradient-primary" />
      )}

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
              <span className="font-display font-semibold text-sm capitalize text-foreground">{order.order_type}</span>
              {order.order_number && (
                <span className="text-xs text-muted-foreground ml-2">#{order.order_number}</span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="font-display font-bold text-lg text-primary">${order.price.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">GYD</p>
          </div>
        </div>

        {/* Progress Steps for active orders */}
        {isActive && (
          <div className="space-y-2">
            <Progress value={progressPercent} className="h-1.5" />
            <div className="flex justify-between">
              {STATUS_STEPS.map((step, i) => {
                const isCompleted = i <= currentStepIndex;
                const isCurrent = i === currentStepIndex;
                const StepIcon = step.icon;
                return (
                  <div key={step.key} className="flex flex-col items-center gap-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${isCurrent ? "gradient-primary shadow-md" : isCompleted ? "bg-primary/20" : "bg-muted"}`}>
                      <StepIcon className={`h-3 w-3 ${isCurrent ? "text-primary-foreground" : isCompleted ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <span className={`text-[10px] ${isCurrent ? "font-semibold text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
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

        {order.description && !orderItems.length && (
          <p className="text-muted-foreground text-xs italic px-1">"{order.description}"</p>
        )}

        {/* Order items */}
        {orderItems.length > 0 && (
          <div className="bg-muted/40 rounded-xl p-3 space-y-1.5 border border-border/20">
            <div className="flex items-center gap-1.5 mb-1">
              <ShoppingBag className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-foreground">Items ({orderItems.length})</span>
            </div>
            {orderItems.map((item) => (
              <div key={item.id} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{item.quantity}x {item.product_name}</span>
                <span className="font-medium text-foreground">${(item.unit_price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}

        {/* Collapsible tracking */}
        {!isAvailable && isActive && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs gap-1.5 text-muted-foreground hover:text-primary"
              onClick={() => setShowTracking(!showTracking)}
            >
              {showTracking ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {showTracking ? "Hide Tracking" : "Show Map & Chat"}
            </Button>
            <AnimatePresence>
              {showTracking && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-3 overflow-hidden"
                >
                  <DriverMap
                    driverId={order.driver_id!}
                    pickupAddress={order.pickup_address}
                    dropoffAddress={order.dropoff_address}
                    customerLat={customer?.default_lat ?? undefined}
                    customerLng={customer?.default_lng ?? undefined}
                  />
                  <OrderChat orderId={order.id} />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize text-[10px] rounded-lg px-2 py-0.5">{order.payment_method}</Badge>
            <OrderReceipt order={order} orderItems={orderItems} customerName={customer?.full_name} />
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              {new Date(order.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>

          {isAvailable ? (
            <Button onClick={acceptOrder} disabled={loading} size="sm" className="gradient-primary text-primary-foreground rounded-full font-semibold px-5">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Accept
                </>
              )}
            </Button>
          ) : statusInfo ? (
            <Button
              onClick={() => updateStatus(statusInfo.next)}
              disabled={loading}
              size="sm"
              className="gradient-primary hover:opacity-90 text-primary-foreground rounded-full font-semibold px-5"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <>
                  <Navigation className="h-4 w-4 mr-1" />
                  {statusInfo.label}
                </>
              )}
            </Button>
          ) : (
            <Badge className="bg-success text-success-foreground rounded-full px-3 py-1">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Delivered
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverOrderCard;
