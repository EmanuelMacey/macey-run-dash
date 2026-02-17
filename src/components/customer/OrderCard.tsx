import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Package, MapPin, Clock, CheckCircle2, XCircle, Truck, Loader2, Timer, ShoppingBag } from "lucide-react";
import DriverMap from "./DriverMap";
import OrderChat from "@/components/chat/OrderChat";
import RatingDialog from "./RatingDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"orders">;

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  pending: { label: "Pending", variant: "outline", icon: <Clock className="h-3 w-3" /> },
  accepted: { label: "Accepted", variant: "secondary", icon: <CheckCircle2 className="h-3 w-3" /> },
  picked_up: { label: "Picked Up", variant: "secondary", icon: <Package className="h-3 w-3" /> },
  on_the_way: { label: "On The Way", variant: "default", icon: <Truck className="h-3 w-3" /> },
  delivered: { label: "Delivered", variant: "default", icon: <CheckCircle2 className="h-3 w-3" /> },
  cancelled: { label: "Cancelled", variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
};

interface OrderCardProps {
  order: Order;
  onUpdated: () => void;
}

const OrderCard = ({ order, onUpdated }: OrderCardProps) => {
  const [cancelling, setCancelling] = useState(false);
  const [eta, setEta] = useState<number | null>(null);
  const [orderItems, setOrderItems] = useState<{ id: string; product_name: string; quantity: number; unit_price: number }[]>([]);
  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const canCancel = order.status === "pending";
  const showMap = order.driver_id && ["accepted", "picked_up", "on_the_way"].includes(order.status);
  const handleEtaChange = useCallback((minutes: number | null) => setEta(minutes), []);

  useEffect(() => {
    const fetchItems = async () => {
      const { data } = await supabase
        .from("order_items")
        .select("id, product_name, quantity, unit_price")
        .eq("order_id", order.id);
      if (data && data.length > 0) setOrderItems(data);
    };
    fetchItems();
  }, [order.id]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", order.id);
      if (error) throw error;
      toast.success("Order cancelled");
      onUpdated();
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {order.order_type === "delivery" ? (
            <Package className="h-4 w-4 text-primary" />
          ) : (
            <MapPin className="h-4 w-4 text-accent" />
          )}
          <span className="font-display font-semibold text-sm capitalize text-foreground">
            {order.order_type}
          </span>
        </div>
        <Badge variant={status.variant} className="flex items-center gap-1 text-xs">
          {status.icon}
          {status.label}
        </Badge>
      </div>

      <div className="space-y-1 text-sm">
        <div className="flex gap-2">
          <span className="text-muted-foreground shrink-0">From:</span>
          <span className="text-foreground">{order.pickup_address}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-muted-foreground shrink-0">To:</span>
          <span className="text-foreground">{order.dropoff_address}</span>
        </div>
        {order.description && !orderItems.length && (
          <p className="text-muted-foreground text-xs mt-1">{order.description}</p>
        )}
      </div>

      {/* Order items breakdown */}
      {orderItems.length > 0 && (
        <div className="bg-muted/50 rounded-lg p-3 space-y-1.5">
          <div className="flex items-center gap-1.5 mb-1">
            <ShoppingBag className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-foreground">Order Items</span>
          </div>
          {orderItems.map((item) => (
            <div key={item.id} className="flex justify-between text-xs">
              <span className="text-muted-foreground">{item.quantity}x {item.product_name}</span>
              <span className="font-medium text-foreground">${(item.unit_price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      {showMap && (
        <>
          {eta !== null && (
            <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
              <Timer className="h-4 w-4" />
              <span>ETA: ~{eta} min</span>
            </div>
          )}
          <DriverMap driverId={order.driver_id!} pickupAddress={order.pickup_address} dropoffAddress={order.dropoff_address} onEtaChange={handleEtaChange} />
          <OrderChat orderId={order.id} />
        </>
      )}

      {order.status === "delivered" && order.driver_id && (
        <RatingDialog orderId={order.id} driverId={order.driver_id} />
      )}

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div>
          <span className="font-display font-bold text-primary">${order.price.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground ml-1">GYD</span>
          <span className="text-xs text-muted-foreground ml-2 capitalize">• {order.payment_method}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {new Date(order.created_at).toLocaleDateString()}
          </span>
          {canCancel && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive h-7 px-2">
                  Cancel
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. The order will be permanently cancelled.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Order</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancel} disabled={cancelling} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    {cancelling && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Yes, Cancel
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
