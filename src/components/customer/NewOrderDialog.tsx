import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Package, MapPin, Loader2, Paperclip, X, MessageCircle, CalendarClock, Navigation, Info, Clock, Mail, Zap, Heart } from "lucide-react";
import { CLOSURE_MESSAGE, CLOSURE_EMAIL, CLOSURE_WHATSAPP, CLOSURE_WHATSAPP_LINK } from "@/lib/closure";
import { useServiceStatus } from "@/hooks/useServiceStatus";
import { useSurge } from "@/hooks/useSurge";
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

const orderSchema = z.object({
  order_type: z.enum(["delivery", "errand"]),
  pickup_address: z.string().trim().min(3, "Pickup address is required").max(500),
  dropoff_address: z.string().trim().min(3, "Dropoff address is required").max(500),
  description: z.string().trim().max(1000).optional(),
  payment_method: z.enum(["cash", "mmg"]),
  promo_code: z.string().trim().max(50).optional(),
  scheduled_date: z.string().optional(),
  scheduled_time: z.string().optional(),
  weight_category: z.enum(["under_40lbs", "over_40lbs"]).default("under_40lbs"),
  is_fragile: z.boolean().default(false),
  is_hazardous: z.boolean().default(false),
  is_easy_break: z.boolean().default(false),
});

type OrderFormValues = z.infer<typeof orderSchema>;

// Pricing constants
const BASE_FEE = 300;
const PER_KM_RATE = 150;
const MIN_PRICES = { delivery: 700, errand: 1000 };
const MAX_FEE = 5000;
const SERVICE_FEE = 100;

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
  const { isClosed: closed } = useServiceStatus();
  const surge = useSurge();
  const isWithinClosure = () => closed;
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [calculatingFee, setCalculatingFee] = useState(false);
  const [tipAmount, setTipAmount] = useState(0);
  const [customTip, setCustomTip] = useState("");

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      order_type: "delivery",
      pickup_address: "",
      dropoff_address: "",
      description: "",
      payment_method: "cash",
      promo_code: "",
      scheduled_date: "",
      scheduled_time: "",
      weight_category: "under_40lbs",
      is_fragile: false,
      is_hazardous: false,
      is_easy_break: false,
    },
  });

  const orderType = form.watch("order_type");
  const pickupAddress = form.watch("pickup_address");
  const dropoffAddress = form.watch("dropoff_address");
  const minPrice = MIN_PRICES[orderType];

  // Calculate price based on distance
  useEffect(() => {
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
          const fee = Math.round(BASE_FEE + dist * PER_KM_RATE);
          const clampedFee = Math.max(minPrice, Math.min(MAX_FEE, fee));
          setCalculatedPrice(clampedFee);
        } else {
          setDistanceKm(null);
          setCalculatedPrice(minPrice);
        }
      } catch {
        setCalculatedPrice(minPrice);
        setDistanceKm(null);
      } finally {
        setCalculatingFee(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [pickupAddress, dropoffAddress, minPrice]);

  const baseDeliveryPrice = calculatedPrice ?? minPrice;
  const surgeMult = surge.isActive ? surge.multiplier : 1;
  const deliveryPrice = Math.round(baseDeliveryPrice * surgeMult);
  const surgeAddOn = deliveryPrice - baseDeliveryPrice;
  const totalBeforeDiscount = deliveryPrice + SERVICE_FEE;
  const finalPrice = Math.max(0, totalBeforeDiscount - discount) + tipAmount;

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

  const onSubmit = async (values: OrderFormValues) => {
    if (!user) return;
    if (isWithinClosure()) {
      toast.error(CLOSURE_MESSAGE);
      return;
    }
    setSubmitting(true);

    try {
      let scheduledFor: string | null = null;
      if (values.scheduled_date && values.scheduled_time) {
        scheduledFor = new Date(`${values.scheduled_date}T${values.scheduled_time}`).toISOString();
      }

      const weightCat = values.weight_category;
      const requiresCar = weightCat === "over_40lbs" || values.is_fragile || values.is_hazardous || values.is_easy_break;

      const { data: orderData, error } = await supabase.from("orders").insert({
        customer_id: user.id,
        order_type: values.order_type,
        pickup_address: values.pickup_address,
        dropoff_address: values.dropoff_address,
        description: values.description || null,
        payment_method: values.payment_method === "mmg" ? "cash" : values.payment_method,
        price: finalPrice,
        status: "pending",
        payment_status: "pending",
        scheduled_for: scheduledFor,
        weight_category: weightCat,
        is_fragile: values.is_fragile,
        is_hazardous: values.is_hazardous,
        is_easy_break: values.is_easy_break,
        required_vehicle: requiresCar ? "car" : "bike",
        tip_amount: tipAmount,
        surge_multiplier: surgeMult,
        surge_reason: surge.isActive ? surge.reason : null,
      } as any).select("id").single();

      if (error) throw error;

      if (attachedFile && orderData) {
        const imageUrl = await uploadAttachment(orderData.id);
        if (imageUrl) {
          await supabase.from("orders").update({ image_url: imageUrl }).eq("id", orderData.id);
        }
      }

      toast.success("Order placed successfully!");
      form.reset();
      setDiscount(0);
      setPromoApplied(false);
      setAttachedFile(null);
      setCalculatedPrice(null);
      setDistanceKm(null);
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

        {isWithinClosure() && (
          <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10 p-4 space-y-2">
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-primary mt-0.5 shrink-0 animate-pulse" />
              <p className="text-sm font-semibold text-foreground leading-tight">{CLOSURE_MESSAGE}</p>
            </div>
            <p className="text-xs text-muted-foreground">For urgent matters, contact us:</p>
            <div className="flex flex-col gap-1.5 text-xs">
              <a href={`mailto:${CLOSURE_EMAIL}`} className="flex items-center gap-1.5 text-primary hover:underline">
                <Mail className="h-3 w-3" /> {CLOSURE_EMAIL}
              </a>
              <a href={CLOSURE_WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary hover:underline">
                <MessageCircle className="h-3 w-3" /> WhatsApp {CLOSURE_WHATSAPP}
              </a>
            </div>
          </div>
        )}

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
                      <span className="text-xs text-muted-foreground">From $700 GYD</span>
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
                      <span className="text-xs text-muted-foreground">From $1,000 GYD</span>
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

            {/* Distance & fee info */}
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

            {/* Package weight & special handling */}
            <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-3">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Package Weight</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(["under_40lbs", "over_40lbs"] as const).map((w) => {
                    const selected = form.watch("weight_category") === w;
                    return (
                      <button
                        key={w}
                        type="button"
                        onClick={() => form.setValue("weight_category", w, { shouldDirty: true })}
                        className={`rounded-xl border-2 px-3 py-2 text-left transition-all ${selected ? "border-primary bg-primary/5" : "border-border"}`}
                      >
                        <div className="text-sm font-semibold">{w === "under_40lbs" ? "Under 40 lbs" : "Over 40 lbs"}</div>
                        <div className="text-[11px] text-muted-foreground">{w === "under_40lbs" ? "🛵 Bike delivery" : "🚗 Car delivery"}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Special Handling (auto-routes to car)</Label>
                <div className="grid grid-cols-1 gap-1.5 text-sm">
                  {([
                    ["is_fragile", "Fragile"],
                    ["is_easy_break", "Easy to break"],
                    ["is_hazardous", "Hazardous"],
                  ] as const).map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!form.watch(key)}
                        onChange={(e) => form.setValue(key, e.target.checked, { shouldDirty: true })}
                        className="h-4 w-4 rounded border-border accent-primary"
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              {(form.watch("weight_category") === "over_40lbs" || form.watch("is_fragile") || form.watch("is_hazardous") || form.watch("is_easy_break")) && (
                <div className="text-xs text-primary font-medium flex items-center gap-1">
                  <Info className="h-3 w-3" /> This package will be assigned to a car driver.
                </div>
              )}
            </div>


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
                  <Select onValueChange={(v) => {
                    field.onChange(v);
                    if (v === "mmg") {
                      window.open("https://wa.me/5927219769?text=Hi%2C%20I%20would%20like%20to%20pay%20via%20MMG%20for%20my%20MaceyRunners%20order.", "_blank");
                    }
                  }} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">Cash on Delivery</SelectItem>
                      <SelectItem value="mmg">MMG Payment</SelectItem>
                    </SelectContent>
                  </Select>
                  {field.value === "mmg" && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Contact <a href="https://wa.me/5927219769" target="_blank" rel="noopener noreferrer" className="text-primary underline">+592 721 9769</a> on WhatsApp to complete MMG payment.
                    </p>
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

            <Button type="submit" className="w-full" disabled={submitting || isWithinClosure()}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isWithinClosure() ? "Closed — Reopens 3:30 PM" : `Place Order — $${finalPrice.toLocaleString()} GYD`}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewOrderDialog;
