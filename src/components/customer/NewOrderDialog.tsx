import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Package, MapPin, Loader2, Paperclip, X, MessageCircle } from "lucide-react";
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
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

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
    setSubmitting(true);

    try {
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
      }).select("id").single();

      if (error) throw error;

      // Upload attachment if errand type
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
