import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Package, MapPin, Clock, CheckCircle2, XCircle, Truck, Loader2, Timer, ShoppingBag, ChevronDown, ChevronUp, Navigation } from "lucide-react";
import DriverMap from "./DriverMap";
import OrderChat from "@/components/chat/OrderChat";
import RatingDialog from "./RatingDialog";
import OrderReceipt from "./OrderReceipt";
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

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode; color: string }> = {
  pending: { label: "Pending", variant: "outline", icon: <Clock className="h-3 w-3" />, color: "text-muted-foreground" },
  accepted: { label: "Accepted", variant: "secondary", icon: <CheckCircle2 className="h-3 w-3" />, color: "text-blue-500" },
  picked_up: { label: "Picked Up", variant: "secondary", icon: <Package className="h-3 w-3" />, color: "text-amber-500" },
  on_the_way: { label: "On The Way", variant: "default", icon: <Truck className="h-3 w-3" />, color: "text-primary" },
  delivered: { label: "Delivered", variant: "default", icon: <CheckCircle2 className="h-3 w-3" />, color: "text-green-500" },
  cancelled: { label: "Cancelled", variant: "destructive", icon: <XCircle className="h-3 w-3" />, color: "text-destructive" },
};

const STATUS_STEPS = ["pending", "accepted", "picked_up", "on_the_way", "delivered"];

interface OrderCardProps {
  order: Order;
  onUpdated: () => void;
}

const OrderCard = ({ order, onUpdated }: OrderCardProps) => {
  const [cancelling, setCancelling] = useState(false);
  const [eta, setEta] = useState<number | null>(null);
  const [orderItems, setOrderItems] = useState<{ id: string; product_name: string; quantity: number; unit_price: number }[]>([]);
  const [showTracking, setShowTracking] = useState(false);
  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const canCancel = order.status === "pending";
  const showMap = order.driver_id && ["accepted", "picked_up", "on_the_way"].includes(order.status);
  const handleEtaChange = useCallback((minutes: number | null) => setEta(minutes), []);
  const isActive = ["pending", "accepted", "picked_up", "on_the_way"].includes(order.status);
  const currentStepIdx = STATUS_STEPS.indexOf(order.status);

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

  const minutesAgo = Math.round((Date.now() - new Date(order.created_at).getTime()) / 60000);
  const timeLabel = minutesAgo < 1 ? "Just now" : minutesAgo < 60 ? `${minutesAgo}m ago` : new Date(order.created_at).toLocaleDateString();

  return (
    <div className={`bg-card border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg ${isActive ? "border-primary/30 shadow-md shadow-primary/5" : "border-border/50"}`}>
      {/* Status progress bar for active orders */}
      {isActive && (
        <div className="flex gap-0.5 px-4 pt-3">
          {STATUS_STEPS.slice(0, 4).map((step, i) => (
            <div
              key={step}
              className={`h-1 flex-1 rounded-full transition-colors ${i <= currentStepIdx ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isActive ? "gradient-primary" : "bg-muted"}`}>
              {order.order_type === "delivery" ? (
                <Package className={`h-4 w-4 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
              ) : (
                <MapPin className={`h-4 w-4 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
              )}
            </div>
            <div>
              <p className="font-display font-semibold text-sm text-foreground">{order.pickup_address}</p>
              <p className="text-xs text-muted-foreground">{timeLabel} • {order.order_type}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant={status.variant} className="flex items-center gap-1 text-xs">
              {status.icon}
              {status.label}
            </Badge>
            {eta !== null && isActive && (
              <span className="flex items-center gap-1 text-xs font-semibold text-primary">
                <Timer className="h-3 w-3" /> ~{eta} min
              </span>
            )}
          </div>
        </div>

        {/* Delivery info */}
        <div className="bg-muted/40 rounded-xl p-3 space-y-1.5">
          <div className="flex items-start gap-2 text-sm">
            <div className="flex flex-col items-center gap-0.5 mt-1">
              <div className="w-2 h-2 rounded-full bg-success" />
              <div className="w-px h-4 bg-border" />
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-foreground text-xs">{order.pickup_address}</p>
              <p className="text-foreground text-xs font-medium">{order.dropoff_address}</p>
            </div>
          </div>
        </div>

        {/* Order items */}
        {orderItems.length > 0 && (
          <div className="bg-muted/30 rounded-xl p-3 space-y-1.5">
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

        {order.description && !orderItems.length && (
          <p className="text-muted-foreground text-xs italic">"{order.description}"</p>
        )}

        {/* Track driver toggle */}
        {showMap && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTracking(!showTracking)}
            className="w-full rounded-xl text-xs gap-2"
          >
            <Navigation className="h-3.5 w-3.5" />
            {showTracking ? "Hide Driver Tracking" : "Track Your Driver"}
            {showTracking ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
        )}

        {showMap && showTracking && (
          <div className="space-y-3">
            <DriverMap driverId={order.driver_id!} pickupAddress={order.pickup_address} dropoffAddress={order.dropoff_address} onEtaChange={handleEtaChange} />
            <OrderChat orderId={order.id} />
          </div>
        )}

        {order.status === "delivered" && order.driver_id && (
          <RatingDialog orderId={order.id} driverId={order.driver_id} />
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-base text-primary">${order.price.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground">GYD</span>
            <Badge variant="outline" className="text-[10px] capitalize ml-1">{order.payment_method}</Badge>
          </div>
          <div className="flex items-center gap-1.5">
            <OrderReceipt order={order} orderItems={orderItems} />
            {canCancel && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive h-7 px-2 text-xs">
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
    </div>
  );
};

export default OrderCard;
