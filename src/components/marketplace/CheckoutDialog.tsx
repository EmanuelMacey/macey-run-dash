import { useState } from "react";
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
import { Loader2, MapPin, CreditCard, Banknote } from "lucide-react";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CheckoutDialog = ({ open, onOpenChange }: CheckoutDialogProps) => {
  const { items, total, storeName, storeId, clearCart } = useCart();
  const { user } = useAuth();
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");
  const [loading, setLoading] = useState(false);

  const deliveryFee = 500;
  const grandTotal = total + deliveryFee;

  const formatPrice = (price: number) => `$${price.toLocaleString()}`;

  const buildDescription = () => {
    const itemLines = items.map((i) => `${i.quantity}x ${i.name}`).join(", ");
    return `Food order from ${storeName}: ${itemLines}${notes ? ` | Notes: ${notes}` : ""}`;
  };

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim()) {
      toast({ title: "Missing address", description: "Please enter a delivery address.", variant: "destructive" });
      return;
    }
    if (!user) return;

    setLoading(true);
    try {
      const { data: orderData, error } = await supabase.from("orders").insert({
        customer_id: user.id,
        order_type: "delivery" as const,
        pickup_address: `${storeName}`,
        dropoff_address: deliveryAddress.trim(),
        description: buildDescription(),
        price: grandTotal,
        payment_method: paymentMethod,
        status: "pending" as const,
      }).select("id").single();

      if (error) throw error;

      // Save individual order items
      const orderItems = items.map((item) => ({
        order_id: orderData.id,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) console.error("Failed to save order items:", itemsError);

      toast({ title: "Order placed! 🎉", description: "A driver will pick up your food soon." });
      clearCart();
      onOpenChange(false);
      setDeliveryAddress("");
      setNotes("");
    } catch (err: any) {
      toast({ title: "Order failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Checkout</DialogTitle>
          {storeName && <p className="text-sm text-muted-foreground">Ordering from {storeName}</p>}
        </DialogHeader>

        <div className="space-y-5 pt-2">
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
                <span className="text-muted-foreground">Delivery fee</span>
                <span className="font-medium text-foreground">{formatPrice(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-1">
                <span>Total</span>
                <span className="text-primary">{formatPrice(grandTotal)} <span className="text-xs font-normal text-muted-foreground">GYD</span></span>
              </div>
            </div>
          </div>

          {/* Delivery address */}
          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary" /> Delivery Address
            </Label>
            <Input
              id="address"
              placeholder="Enter your delivery address..."
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="rounded-xl"
            />
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

          {/* Payment method */}
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as "cash" | "card")} className="grid grid-cols-2 gap-3">
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
                htmlFor="pay-card"
                className={`flex items-center gap-2 border rounded-xl p-3 cursor-pointer transition-colors ${
                  paymentMethod === "card" ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <RadioGroupItem value="card" id="pay-card" />
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Card</span>
              </Label>
            </RadioGroup>
          </div>

          {/* Place order button */}
          <Button
            className="w-full h-12 rounded-full text-base font-bold"
            onClick={handlePlaceOrder}
            disabled={loading || items.length === 0}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Place Order — {formatPrice(grandTotal)} GYD
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;
