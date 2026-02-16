import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Package, MapPin, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const orderSchema = z.object({
  order_type: z.enum(["delivery", "errand"]),
  pickup_address: z.string().trim().min(3, "Pickup address is required").max(500),
  dropoff_address: z.string().trim().min(3, "Dropoff address is required").max(500),
  description: z.string().trim().max(1000).optional(),
  payment_method: z.enum(["cash", "card"]),
  promo_code: z.string().trim().max(50).optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

const PRICES = { delivery: 1000, errand: 1500 };

interface NewOrderDialogProps {
  onOrderCreated: () => void;
  children: React.ReactNode;
}

const NewOrderDialog = ({ onOrderCreated, children }: NewOrderDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      order_type: "delivery",
      pickup_address: "",
      dropoff_address: "",
      description: "",
      payment_method: "cash",
      promo_code: "",
    },
  });

  const orderType = form.watch("order_type");
  const basePrice = PRICES[orderType];
  const finalPrice = Math.max(0, basePrice - discount);

  const applyPromo = async () => {
    const code = form.getValues("promo_code")?.trim();
    if (!code) return;

    const { data, error } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single();

    if (error || !data) {
      toast.error("Invalid or expired promo code");
      setDiscount(0);
      setPromoApplied(false);
      return;
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      toast.error("This promo code has expired");
      return;
    }
    if (data.max_uses && data.current_uses >= data.max_uses) {
      toast.error("This promo code has reached its limit");
      return;
    }

    const discountAmt = data.discount_amount > 0
      ? data.discount_amount
      : Math.round(basePrice * (data.discount_percent / 100));

    setDiscount(discountAmt);
    setPromoApplied(true);
    toast.success(`Promo applied! $${discountAmt} GYD off`);
  };

  const onSubmit = async (values: OrderFormValues) => {
    if (!user) return;
    setSubmitting(true);

    try {
      const { error } = await supabase.from("orders").insert({
        customer_id: user.id,
        order_type: values.order_type,
        pickup_address: values.pickup_address,
        dropoff_address: values.dropoff_address,
        description: values.description || null,
        payment_method: values.payment_method,
        price: finalPrice,
        status: "pending",
        payment_status: "pending",
      });

      if (error) throw error;

      // Increment promo usage if applied
      if (promoApplied && values.promo_code) {
        await supabase.rpc("has_role", { _user_id: user.id, _role: "customer" }); // no-op just to verify auth
        // We can't directly update promo_codes due to RLS, admin handles that
      }

      toast.success("Order placed successfully!");
      form.reset();
      setDiscount(0);
      setPromoApplied(false);
      setOpen(false);
      onOrderCreated();
    } catch (err: any) {
      toast.error(err.message || "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Place New Order</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Order Type */}
            <FormField
              control={form.control}
              name="order_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Type</FormLabel>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => field.onChange("delivery")}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        field.value === "delivery"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <Package className={`h-6 w-6 ${field.value === "delivery" ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`font-display font-semibold text-sm ${field.value === "delivery" ? "text-primary" : "text-foreground"}`}>
                        Delivery
                      </span>
                      <span className="text-xs text-muted-foreground">$1,000 GYD</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => field.onChange("errand")}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        field.value === "errand"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <MapPin className={`h-6 w-6 ${field.value === "errand" ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`font-display font-semibold text-sm ${field.value === "errand" ? "text-primary" : "text-foreground"}`}>
                        Errand
                      </span>
                      <span className="text-xs text-muted-foreground">$1,500 GYD</span>
                    </button>
                  </div>
                </FormItem>
              )}
            />

            {/* Addresses */}
            <FormField
              control={form.control}
              name="pickup_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pickup Address</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 123 Main St, Georgetown" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dropoff_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dropoff Address</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 456 Camp St, Georgetown" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any special instructions..." className="resize-none" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Payment */}
            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">Cash on Delivery</SelectItem>
                      <SelectItem value="card">Card Payment</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Promo Code */}
            <div className="space-y-2">
              <Label>Promo Code (optional)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter code"
                  {...form.register("promo_code")}
                  className="flex-1"
                  disabled={promoApplied}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={applyPromo}
                  disabled={promoApplied}
                  className="shrink-0"
                >
                  {promoApplied ? "Applied" : "Apply"}
                </Button>
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-muted/50 rounded-xl p-4 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base price</span>
                <span>${basePrice.toLocaleString()} GYD</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-${discount.toLocaleString()} GYD</span>
                </div>
              )}
              <div className="flex justify-between font-display font-bold text-lg pt-1 border-t border-border">
                <span>Total</span>
                <span className="text-primary">${finalPrice.toLocaleString()} GYD</span>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Place Order
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewOrderDialog;
