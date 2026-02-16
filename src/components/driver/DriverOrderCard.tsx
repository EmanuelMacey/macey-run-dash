import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Package, MapPin, CheckCircle2, Loader2, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"orders">;

const NEXT_STATUS: Record<string, { label: string; next: string; color: string }> = {
  accepted: { label: "Mark Picked Up", next: "picked_up", color: "bg-primary" },
  picked_up: { label: "On The Way", next: "on_the_way", color: "bg-accent" },
  on_the_way: { label: "Mark Delivered", next: "delivered", color: "bg-green-600" },
};

interface DriverOrderCardProps {
  order: Order;
  isAvailable?: boolean;
  onUpdated: () => void;
}

const DriverOrderCard = ({ order, isAvailable = false, onUpdated }: DriverOrderCardProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const acceptOrder = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ driver_id: user.id, status: "accepted" })
        .eq("id", order.id);
      if (error) throw error;
      toast.success("Order accepted!");
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
      const { error } = await supabase
        .from("orders")
        .update({ status: nextStatus as any })
        .eq("id", order.id);
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
    <div className={`bg-card border rounded-xl p-4 space-y-3 ${isAvailable ? "border-accent/50 shadow-sm" : "border-border"}`}>
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
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-primary">${order.price.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground">GYD</span>
        </div>
      </div>

      <div className="space-y-1 text-sm">
        <div className="flex gap-2">
          <span className="text-muted-foreground shrink-0">📍 From:</span>
          <span className="text-foreground">{order.pickup_address}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-muted-foreground shrink-0">📍 To:</span>
          <span className="text-foreground">{order.dropoff_address}</span>
        </div>
        {order.description && (
          <p className="text-muted-foreground text-xs italic mt-1">"{order.description}"</p>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="capitalize text-xs">
            {order.payment_method}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {new Date(order.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        {isAvailable ? (
          <Button onClick={acceptOrder} disabled={loading} size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
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
            className={`${statusInfo.color} hover:opacity-90 text-white`}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
              <>
                <Navigation className="h-4 w-4 mr-1" />
                {statusInfo.label}
              </>
            )}
          </Button>
        ) : (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Delivered
          </Badge>
        )}
      </div>
    </div>
  );
};

export default DriverOrderCard;
