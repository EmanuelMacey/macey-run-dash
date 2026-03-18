import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Package, MapPin, Loader2, Paperclip, X, CalendarClock, Navigation, Info } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import MMGPaymentPage from "./MMGPaymentPage";

const orderSchema = z.object({
  order_type: z.enum(["delivery", "errand"]),
  pickup_address: z.string().trim().min(3, "Pickup address is required").max(500),
  dropoff_address: z.string().trim().min(3, "Dropoff address is required").max(500),
  description: z.string().trim().max(1000).optional(),
  payment_method: z.enum(["cash", "mmg"]),
  promo_code: z.string().trim().max(50).optional(),
  scheduled_date: z.string().optional(),
  scheduled_time: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

const GEORGETOWN_RADIUS_KM = 5;
const GEORGETOWN_FLAT_FEE = 1000;
const BASE_FEE = 500;
const PER_KM_RATE = 250;
const MIN_DELIVERY_PRICE = 1000;
const MAX_FEE = 5000;
const SERVICE_FEE = 100;
const STANDARD_ERRAND_PRICE = 1200;
const PREMIUM_ERRAND_PRICE = 1500;

const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const geocode = async (address: string): Promise<{ lat: number; lon: number } | null> => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=gy&limit=1`
    );
    const data = await res.json();
    if (data.length > 0) return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  } catch {}
  return null;
};

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
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [calculatingFee, setCalculatingFee] = useState(false);
  // MMG payment step
  const [mmgStep, setMmgStep] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [createdOrderPrice, setCreatedOrderPrice] = useState(0);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      order_type: "delivery",
      pickup_address: "",
      dropoff_address: "",
      description: "",
      payment_method: "mmg",
      promo_code: "",
      scheduled_date: "",
      scheduled_time: "",
    },
  });

  const orderType = form.watch("order_type");
  const pickupAddress = form.watch("pickup_address");
  const dropoffAddress = form.watch("dropoff_address");
  const paymentMethod = form.watch("payment_method");
  const isErrand = orderType === "errand";
  const minPrice = isErrand ? STANDARD_ERRAND_PRICE : MIN_DELIVERY_PRICE;

  useEffect(() => {
    if (isErrand) {
      setCalculatedPrice(STANDARD_ERRAND_PRICE);
      setDistanceKm(null);
      return;
    }

    if (!pickupAddress?.trim() || !dropoffAddress?.trim()) {
      setCalculatedPrice(null);
      setDistanceKm(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCalculatingFee(true);
      try {
        const [pickupCoords, dropCoords] = await Promise.all([
          geocode(`${pickupAddress}, Guyana`),
          geocode(`${dropoffAddress}, Guyana`),
        ]);

        if (pickupCoords && dropCoords) {
          const dist = haversineKm(pickupCoords.lat, pickupCoords.lon, dropCoords.lat, dropCoords.lon);
          setDistanceKm(Math.round(dist * 10) / 10);
          const clampedFee = dist <= GEORGETOWN_RADIUS_KM
            ? GEORGETOWN_FLAT_FEE
            : Math.max(MIN_DELIVERY_PRICE, Math.min(MAX_FEE, Math.round(BASE_FEE + dist * PER_KM_RATE)));
          setCalculatedPrice(clampedFee);
        } else {
          setDistanceKm(null);
          setCalculatedPrice(MIN_DELIVERY_PRICE);
        }
      } catch {
        setCalculatedPrice(MIN_DELIVERY_PRICE);
        setDistanceKm(null);
      } finally {
        setCalculatingFee(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [pickupAddress, dropoffAddress, isErrand]);

  const deliveryPrice = calculatedPrice ?? minPrice;
  const totalBeforeDiscount = deliveryPrice + SERVICE_FEE;
  const finalPrice = Math.max(0, totalBeforeDiscount - discount);

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
      : Math.round(deliveryPrice * (data.discount_percent / 100));

    setDiscount(discountAmt);
    setPromoApplied(true);
    toast.success(`Promo applied! $${discountAmt} GYD off`);
  };

  const uploadAttachment = async (orderId: string): Promise<string | null> => {
    if (!attachedFile || !user) return null;
    try {
      const ext = attachedFile.name.split(".").pop();
      const path = `${user.id}/${orderId}.${ext}`;
      const { error } = await supabase.storage.from("errand-attachments").upload(path, attachedFile);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("errand-attachments").getPublicUrl(path);
      return urlData.publicUrl;
    } catch (err: any) {
      console.error("Attachment upload failed:", err.message);
      return null;
    }
  };

  const resetForm = () => {
    form.reset();
    setDiscount(0);
    setPromoApplied(false);
    setAttachedFile(null);
    setCalculatedPrice(null);
    setDistanceKm(null);
    setMmgStep(false);
    setCreatedOrderId(null);
    setCreatedOrderPrice(0);
  };

  const onSubmit = async (values: OrderFormValues) => {
    if (!user) return;
    setSubmitting(true);

    try {
      let scheduledFor: string | null = null;
      if (values.scheduled_date && values.scheduled_time) {
        scheduledFor = new Date(`${values.scheduled_date}T${values.scheduled_time}`).toISOString();
      }

      const isMMG = values.payment_method === "mmg";

      const { data: orderData, error } = await supabase.from("orders").insert({
        customer_id: user.id,
        order_type: values.order_type,
        pickup_address: values.pickup_address,
        dropoff_address: values.dropoff_address,
        description: values.description || null,
        payment_method: isMMG ? "mmg" : values.payment_method,
        price: finalPrice,
        status: "pending",
        payment_status: "pending",
        scheduled_for: scheduledFor,
      } as any).select("id").single();

      if (error) throw error;

      if (attachedFile && orderData) {
        const imageUrl = await uploadAttachment(orderData.id);
        if (imageUrl) {
          await supabase.from("orders").update({ image_url: imageUrl }).eq("id", orderData.id);
        }
      }

      if (isMMG && orderData) {
        // Show MMG payment page instead of closing
        setCreatedOrderId(orderData.id);
        setCreatedOrderPrice(finalPrice);
        setMmgStep(true);
        toast.success("Order created! Please complete MMG payment.");
      } else {
        toast.success("Order placed successfully!");
        resetForm();
        setOpen(false);
        onOrderCreated();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDialogChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm();
    }
    setOpen(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {mmgStep ? "Complete MMG Payment" : "Place New Order"}
          </DialogTitle>
        </DialogHeader>

        {mmgStep && createdOrderId ? (
          <MMGPaymentPage
            orderId={createdOrderId}
            amount={createdOrderPrice}
            onComplete={() => {
              resetForm();
              setOpen(false);
              onOrderCreated();
            }}
            onCancel={() => {
              resetForm();
              setOpen(false);
              onOrderCreated();
            }}
          />
        ) : (
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
                        onClick={() => { field.onChange("delivery"); setAttachedFile(null); }}
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
                        <span className="text-xs text-muted-foreground">Distance-based pricing</span>
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
                        <span className="text-xs text-muted-foreground">Fixed rate: $1,200 GYD</span>
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
                      <Input placeholder="e.g. Agricola, East Bank Demerara" {...field} />
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
                      <Input placeholder="e.g. Giftland Mall, Turkeyen" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {calculatingFee && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" /> Calculating distance...
                </p>
              )}
              {distanceKm !== null && !calculatingFee && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Navigation className="h-3 w-3" /> ~{distanceKm} km estimated distance
                </p>
              )}

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

              {/* File Attachment for Errands */}
              {orderType === "errand" && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Paperclip className="h-3.5 w-3.5" /> Attach File (optional)
                  </Label>
                  {attachedFile ? (
                    <div className="flex items-center gap-2 bg-muted/50 rounded-xl p-3">
                      <Paperclip className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm text-foreground truncate flex-1">{attachedFile.name}</span>
                      <Button type="button" variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => setAttachedFile(null)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex items-center gap-2 border border-dashed border-border rounded-xl p-3 cursor-pointer hover:border-primary/50 transition-colors">
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Click to attach an image or document</span>
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) => setAttachedFile(e.target.files?.[0] || null)}
                      />
                    </label>
                  )}
                </div>
              )}

              {/* Schedule Delivery */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <CalendarClock className="h-3.5 w-3.5" /> Schedule for Later (optional)
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    {...form.register("scheduled_date")}
                    className="rounded-xl text-sm"
                  />
                  <Input
                    type="time"
                    {...form.register("scheduled_time")}
                    className="rounded-xl text-sm"
                  />
                </div>
                {form.watch("scheduled_date") && form.watch("scheduled_time") && (
                  <p className="text-xs text-primary">
                    📅 Scheduled for {new Date(`${form.watch("scheduled_date")}T${form.watch("scheduled_time")}`).toLocaleString()}
                  </p>
                )}
              </div>

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
                        <SelectItem value="mmg">MMG Pre-Payment (Required)</SelectItem>
                        <SelectItem value="cash">Cash (Requires Admin Approval)</SelectItem>
                      </SelectContent>
                    </Select>
                    {field.value === "mmg" && (
                      <p className="text-xs text-muted-foreground mt-1">
                        You'll be directed to submit your MMG Transaction ID after placing this order.
                      </p>
                    )}
                    {field.value === "cash" && (
                      <div className="text-xs text-amber-600 mt-1 bg-amber-500/10 rounded-lg p-2">
                        ⚠️ Cash payments require admin approval before dispatch. Contact{" "}
                        <a href="tel:+5927219769" className="text-primary underline font-semibold">+592 721-9769</a>{" "}
                        to arrange cash payment.
                      </div>
                    )}
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
                  <span className="text-muted-foreground">
                    {orderType === "delivery" ? "Delivery" : "Errand"} fee
                    {distanceKm !== null ? ` (${distanceKm} km)` : ""}
                  </span>
                  <span>${deliveryPrice.toLocaleString()} GYD</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    Service fee <Info className="h-3 w-3" />
                  </span>
                  <span>${SERVICE_FEE.toLocaleString()} GYD</span>
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
                {paymentMethod === "mmg" ? "Continue to Payment" : "Place Order"} — ${finalPrice.toLocaleString()} GYD
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NewOrderDialog;
