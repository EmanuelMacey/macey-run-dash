import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, MapPin, Banknote, Navigation, CheckCircle2, MessageCircle, CalendarClock } from "lucide-react";
import OrderReceipt from "@/components/customer/OrderReceipt";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderPlaced?: () => void;
}

// Haversine distance in km
const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Geocode using Nominatim
const geocode = async (address: string): Promise<{ lat: number; lon: number } | null> => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
    );
    const data = await res.json();
    if (data.length > 0) return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  } catch {}
  return null;
};

// Pricing: base + per-km rate (GYD)
const BASE_FEE = 300;
const PER_KM_RATE = 150;
const MIN_FEE = 700;
const MAX_FEE = 5000;

const calculateDeliveryFee = (distanceKm: number) => {
  const fee = Math.round(BASE_FEE + distanceKm * PER_KM_RATE);
  return Math.max(MIN_FEE, Math.min(MAX_FEE, fee));
};

const CheckoutDialog = ({ open, onOpenChange, onOrderPlaced }: CheckoutDialogProps) => {
  const { items, total, storeName, storeId, clearCart } = useCart();
  const { user } = useAuth();
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "mmg">("cash");
  const [loading, setLoading] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [calculatingFee, setCalculatingFee] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [completedItems, setCompletedItems] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [defaultAddress, setDefaultAddress] = useState<string | null>(null);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  // Fetch customer name and default address
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name, default_address").eq("user_id", user.id).single()
      .then(({ data }) => {
        if (data) {
          setCustomerName(data.full_name);
          setDefaultAddress(data.default_address);
        }
      });
  }, [user]);

  const grandTotal = total + (deliveryFee ?? 0);
  const formatPrice = (price: number) => `$${price.toLocaleString()}`;

  // Debounced distance calculation
  useEffect(() => {
    if (!deliveryAddress.trim() || !storeName) {
      setDeliveryFee(null);
      setDistanceKm(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCalculatingFee(true);
      try {
        // Geocode both store (by name + Guyana) and delivery address
        const [storeCoords, dropCoords] = await Promise.all([
          geocode(`${storeName}, Georgetown, Guyana`),
          geocode(`${deliveryAddress}, Guyana`),
        ]);

        if (storeCoords && dropCoords) {
          const dist = haversineKm(storeCoords.lat, storeCoords.lon, dropCoords.lat, dropCoords.lon);
          setDistanceKm(Math.round(dist * 10) / 10);
          setDeliveryFee(calculateDeliveryFee(dist));
        } else {
          // Fallback if geocoding fails
          setDistanceKm(null);
          setDeliveryFee(MIN_FEE);
        }
      } catch {
        setDeliveryFee(MIN_FEE);
        setDistanceKm(null);
      } finally {
        setCalculatingFee(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [deliveryAddress, storeName]);

  const buildDescription = () => {
    const itemLines = items.map((i) => `${i.quantity}x ${i.name}`).join(", ");
    return `Food order from ${storeName}: ${itemLines}${notes ? ` | Notes: ${notes}` : ""}`;
  };

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim()) {
      toast({ title: "Missing address", description: "Please enter a delivery address.", variant: "destructive" });
      return;
    }
    if (deliveryFee === null) {
      toast({ title: "Calculating fee", description: "Please wait for the delivery fee to calculate.", variant: "destructive" });
      return;
    }
    if (!user) return;

    setLoading(true);
    try {
      let scheduledFor: string | null = null;
      if (scheduledDate && scheduledTime) {
        scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
      }

      const { data: orderData, error } = await supabase.from("orders").insert({
        customer_id: user.id,
        order_type: "delivery" as const,
        pickup_address: `${storeName}`,
        dropoff_address: deliveryAddress.trim(),
        description: buildDescription(),
        price: grandTotal,
        payment_method: paymentMethod === "mmg" ? "cash" as const : paymentMethod,
        status: "pending" as const,
        scheduled_for: scheduledFor,
      } as any).select("id").single();

      if (error) throw error;

      const orderItems = items.map((item) => ({
        order_id: orderData.id,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) console.error("Failed to save order items:", itemsError);

      // Save completed order for receipt display
      const savedItems = items.map((item) => ({
        id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
      }));
      setCompletedOrder({ ...orderData, order_type: "delivery", pickup_address: storeName, dropoff_address: deliveryAddress.trim(), price: grandTotal, payment_method: paymentMethod, status: "pending", created_at: new Date().toISOString() });
      setCompletedItems(savedItems);

      toast({ title: "Order placed! 🎉", description: "A driver will pick up your food soon." });
      clearCart();
      onOrderPlaced?.();
      setDeliveryAddress("");
      setNotes("");
      setDeliveryFee(null);
      setDistanceKm(null);
    } catch (err: any) {
      toast({ title: "Order failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // If order completed, show receipt
  if (completedOrder) {
    return (
      <Dialog open={open} onOpenChange={(v) => { if (!v) { setCompletedOrder(null); setCompletedItems([]); } onOpenChange(v); }}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-display font-bold text-xl text-foreground">Order Placed!</h2>
            <p className="text-sm text-muted-foreground">A driver will pick up your food soon.</p>
            <OrderReceipt order={completedOrder} orderItems={completedItems} customerName={customerName}>
              <Button className="w-full rounded-xl">View Receipt</Button>
            </OrderReceipt>
            <Button variant="outline" className="w-full rounded-xl" onClick={() => { setCompletedOrder(null); setCompletedItems([]); onOpenChange(false); }}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Checkout</DialogTitle>
          {storeName && <p className="text-sm text-muted-foreground">Ordering from {storeName}</p>}
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Delivery address */}
          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary" /> Delivery Address
            </Label>
            {defaultAddress && !deliveryAddress && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full rounded-xl text-xs justify-start gap-2"
                onClick={() => setDeliveryAddress(defaultAddress)}
              >
                <Navigation className="h-3 w-3" />
                Use saved address: {defaultAddress}
              </Button>
            )}
            <Input
              id="address"
              placeholder="Enter your delivery address..."
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="rounded-xl"
            />
            {calculatingFee && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" /> Calculating delivery fee...
              </p>
            )}
            {distanceKm !== null && deliveryFee !== null && !calculatingFee && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Navigation className="h-3 w-3" /> ~{distanceKm} km • Delivery fee: {formatPrice(deliveryFee)} GYD
              </p>
            )}
          </div>

          {/* Order summary */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Order Summary</h3>
            <div className="bg-muted/50 rounded-xl p-3 space-y-1.5">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.quantity}x {item.name}</span>
                  <span className="font-medium text-foreground">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t border-border pt-1.5 flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-foreground">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Delivery fee {distanceKm !== null ? `(${distanceKm} km)` : ""}
                </span>
                <span className="font-medium text-foreground">
                  {deliveryFee !== null ? formatPrice(deliveryFee) : "—"}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold pt-1 border-t border-border">
                <span>Total</span>
                <span className="text-primary">
                  {deliveryFee !== null ? formatPrice(grandTotal) : "—"}{" "}
                  <span className="text-xs font-normal text-muted-foreground">GYD</span>
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Special Instructions (optional)</Label>
            <Textarea
              id="notes"
              placeholder="E.g. extra sauce, no onions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-xl min-h-[60px]"
              maxLength={500}
            />
          </div>

          {/* Schedule Delivery */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <CalendarClock className="h-3.5 w-3.5" /> Schedule for Later (optional)
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="rounded-xl text-sm"
              />
              <Input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="rounded-xl text-sm"
              />
            </div>
            {scheduledDate && scheduledTime && (
              <p className="text-xs text-primary">
                📅 Scheduled for {new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString()}
              </p>
            )}
          </div>

          {/* Payment method */}
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={(v) => {
              setPaymentMethod(v as "cash" | "mmg");
              if (v === "mmg") {
                window.open("https://wa.me/5927219769?text=Hi%2C%20I%20would%20like%20to%20pay%20via%20MMG%20for%20my%20MaceyRunners%20order.", "_blank");
              }
            }} className="grid grid-cols-2 gap-3">
              <Label
                htmlFor="pay-cash"
                className={`flex items-center gap-2 border rounded-xl p-3 cursor-pointer transition-colors ${
                  paymentMethod === "cash" ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <RadioGroupItem value="cash" id="pay-cash" />
                <Banknote className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Cash</span>
              </Label>
              <Label
                htmlFor="pay-mmg"
                className={`flex items-center gap-2 border rounded-xl p-3 cursor-pointer transition-colors ${
                  paymentMethod === "mmg" ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <RadioGroupItem value="mmg" id="pay-mmg" />
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">MMG</span>
              </Label>
            </RadioGroup>
            {paymentMethod === "mmg" && (
              <p className="text-xs text-muted-foreground">
                Contact <a href="https://wa.me/5927219769" target="_blank" rel="noopener noreferrer" className="text-primary underline">+592 721 9769</a> on WhatsApp to complete your MMG payment.
              </p>
            )}
          </div>

          {/* Place order button */}
          <Button
            className="w-full h-12 rounded-full text-base font-bold"
            onClick={handlePlaceOrder}
            disabled={loading || items.length === 0 || deliveryFee === null || calculatingFee}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {deliveryFee !== null ? `Place Order — ${formatPrice(grandTotal)} GYD` : "Enter address to see total"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;
