import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Package, MapPin, CheckCircle2, Loader2, Navigation, ShoppingBag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import OrderChat from "@/components/chat/OrderChat";
import DriverMap from "@/components/customer/DriverMap";
import OrderReceipt from "@/components/customer/OrderReceipt";
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

const NEXT_STATUS: Record<string, { label: string; next: string; color: string }> = {
  accepted: { label: "Mark Picked Up", next: "picked_up", color: "gradient-primary" },
  picked_up: { label: "On The Way", next: "on_the_way", color: "bg-accent" },
  on_the_way: { label: "Mark Delivered", next: "delivered", color: "bg-success" },
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

  useEffect(() => {
    const fetchItems = async () => {
      const { data } = await supabase.from("order_items").select("id, product_name, quantity, unit_price").eq("order_id", order.id);
      if (data && data.length > 0) setOrderItems(data);
    };
    fetchItems();
  }, [order.id]);

  // Fetch customer info for assigned orders
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

  return (
    <div className={`bg-card/90 backdrop-blur-sm border rounded-2xl p-4 space-y-3 transition-all duration-300 hover:shadow-lg ${isAvailable ? "border-accent/50 shadow-md shadow-accent/5" : "border-border/50 hover:shadow-primary/5"}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {order.order_type === "delivery" ? (
            <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
              <Package className="h-4 w-4 text-primary-foreground" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center">
              <MapPin className="h-4 w-4 text-accent-foreground" />
            </div>
          )}
          <span className="font-display font-semibold text-sm capitalize text-foreground">
            {order.order_type}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-primary">${order.price.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground">GYD</span>
        </div>
      </div>

      {/* Customer info */}
      {customer && (
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-xl">
          <User className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm">
            <span className="font-medium text-foreground">{customer.full_name}</span>
            {customer.phone && <span className="text-muted-foreground ml-2">• {customer.phone}</span>}
          </div>
        </div>
      )}

      <div className="space-y-1 text-sm">
        <div className="flex gap-2">
          <span className="text-muted-foreground shrink-0">📍 From:</span>
          <span className="text-foreground">{order.pickup_address}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-muted-foreground shrink-0">📍 To:</span>
          <span className="text-foreground">{order.dropoff_address}</span>
        </div>
        {order.description && !orderItems.length && (
          <p className="text-muted-foreground text-xs italic mt-1">"{order.description}"</p>
        )}
      </div>

      {orderItems.length > 0 && (
        <div className="bg-muted/50 rounded-xl p-3 space-y-1.5">
          <div className="flex items-center gap-1.5 mb-1">
            <ShoppingBag className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-foreground">Items to Pick Up</span>
          </div>
          {orderItems.map((item) => (
            <div key={item.id} className="flex justify-between text-xs">
              <span className="text-muted-foreground">{item.quantity}x {item.product_name}</span>
              <span className="font-medium text-foreground">${(item.unit_price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      {/* Show map with customer pin for active orders */}
      {!isAvailable && ["accepted", "picked_up", "on_the_way"].includes(order.status) && (
        <>
          <DriverMap
            driverId={order.driver_id!}
            pickupAddress={order.pickup_address}
            dropoffAddress={order.dropoff_address}
            customerLat={customer?.default_lat ?? undefined}
            customerLng={customer?.default_lng ?? undefined}
          />
          <OrderChat orderId={order.id} />
        </>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="capitalize text-xs rounded-lg">
            {order.payment_method}
          </Badge>
          <OrderReceipt order={order} orderItems={orderItems} />
          <span className="text-xs text-muted-foreground">
            {new Date(order.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        {isAvailable ? (
          <Button onClick={acceptOrder} disabled={loading} size="sm" className="gradient-primary text-primary-foreground rounded-full font-semibold">
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
            className={`${statusInfo.color} hover:opacity-90 text-primary-foreground rounded-full font-semibold`}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
              <>
                <Navigation className="h-4 w-4 mr-1" />
                {statusInfo.label}
              </>
            )}
          </Button>
        ) : (
          <Badge className="bg-success text-success-foreground rounded-full">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Delivered
          </Badge>
        )}
      </div>
    </div>
  );
};

export default DriverOrderCard;
