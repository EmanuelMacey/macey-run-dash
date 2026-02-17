import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Receipt, Download, User, Phone, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

interface OrderReceiptProps {
  order: Tables<"orders"> & { order_number?: number };
  orderItems?: OrderItem[];
  customerName?: string;
  children?: React.ReactNode;
}

const OrderReceipt = ({ order, orderItems = [], customerName: propCustomerName, children }: OrderReceiptProps) => {
  const [customerInfo, setCustomerInfo] = useState<{ full_name: string; phone: string | null; default_address: string | null } | null>(null);
  const itemsTotal = orderItems.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
  const deliveryFee = orderItems.length > 0 ? order.price - itemsTotal : 0;
  const orderNum = (order as any).order_number ?? "—";

  useEffect(() => {
    const fetchCustomer = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, phone, default_address")
        .eq("user_id", order.customer_id)
        .single();
      if (data) setCustomerInfo(data);
    };
    fetchCustomer();
  }, [order.customer_id]);

  const displayName = propCustomerName || customerInfo?.full_name || "—";
  const displayPhone = customerInfo?.phone || "—";
  const displayAddress = order.dropoff_address || customerInfo?.default_address || "—";

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Receipt #${orderNum}</title>
      <style>
        body { font-family: 'Courier New', monospace; max-width: 320px; margin: 20px auto; padding: 20px; }
        .center { text-align: center; }
        .line { border-top: 1px dashed #333; margin: 8px 0; }
        .row { display: flex; justify-content: space-between; font-size: 13px; margin: 3px 0; }
        .bold { font-weight: bold; }
        h2 { margin: 4px 0; font-size: 18px; }
        .small { font-size: 11px; color: #666; }
      </style></head><body>
        <div class="center">
          <h2>MaceyRunners</h2>
          <p class="small">Fast Delivery & Errands in Guyana</p>
          <div class="line"></div>
          <p class="bold">RECEIPT #${orderNum}</p>
          <p class="small">${new Date(order.created_at).toLocaleString()}</p>
        </div>
        <div class="line"></div>
        <div class="row"><span>Customer:</span><span>${displayName}</span></div>
        <div class="row"><span>Phone:</span><span>${displayPhone}</span></div>
        <div class="row"><span>Type:</span><span style="text-transform:capitalize">${order.order_type}</span></div>
        <div class="row"><span>From:</span><span>${order.pickup_address}</span></div>
        <div class="row"><span>To:</span><span>${displayAddress}</span></div>
        <div class="row"><span>Payment:</span><span style="text-transform:capitalize">${order.payment_method}</span></div>
        <div class="line"></div>
        ${orderItems.length > 0 ? orderItems.map(i => 
          `<div class="row"><span>${i.quantity}x ${i.product_name}</span><span>$${(i.unit_price * i.quantity).toLocaleString()}</span></div>`
        ).join("") + `
          <div class="line"></div>
          <div class="row"><span>Subtotal</span><span>$${itemsTotal.toLocaleString()}</span></div>
          <div class="row"><span>Delivery Fee</span><span>$${deliveryFee.toLocaleString()}</span></div>
        ` : ""}
        <div class="line"></div>
        <div class="row bold" style="font-size:16px"><span>TOTAL</span><span>$${order.price.toLocaleString()} GYD</span></div>
        <div class="line"></div>
        <div class="center small" style="margin-top:12px">
          <p>Thank you for using MaceyRunners!</p>
          <p>Status: ${order.status.replace("_", " ").toUpperCase()}</p>
        </div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
            <Receipt className="h-3 w-3" /> Receipt
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" /> Receipt #{orderNum}
          </DialogTitle>
          <DialogDescription className="text-xs">Order details and payment summary</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div className="text-center pb-2 border-b border-dashed border-border">
            <h3 className="font-display font-bold text-lg text-foreground">MaceyRunners</h3>
            <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
          </div>

          {/* Customer info section */}
          <div className="bg-muted/40 rounded-xl p-3 space-y-1.5">
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-foreground">Customer Details</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium text-foreground">{displayName}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Phone</span>
              <span className="font-medium text-foreground">{displayPhone}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Delivery Address</span>
              <span className="text-right max-w-[55%] font-medium text-foreground">{displayAddress}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span className="capitalize font-medium text-foreground">{order.order_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">From</span>
              <span className="text-right max-w-[60%] font-medium text-foreground">{order.pickup_address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">To</span>
              <span className="text-right max-w-[60%] font-medium text-foreground">{displayAddress}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment</span>
              <span className="capitalize font-medium text-foreground">{order.payment_method}</span>
            </div>
          </div>

          {orderItems.length > 0 && (
            <>
              <div className="border-t border-dashed border-border pt-2 space-y-1">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{item.quantity}x {item.product_name}</span>
                    <span className="font-medium text-foreground">${(item.unit_price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-dashed border-border pt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">${itemsTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="text-foreground">${deliveryFee.toLocaleString()}</span>
                </div>
              </div>
            </>
          )}

          <div className="border-t border-dashed border-border pt-3 flex justify-between items-center">
            <span className="font-display font-bold text-base text-foreground">TOTAL</span>
            <span className="font-display font-bold text-lg text-primary">${order.price.toLocaleString()} GYD</span>
          </div>

          <div className="text-center pt-2 border-t border-dashed border-border">
            <p className="text-xs text-muted-foreground">Status: {order.status.replace("_", " ").toUpperCase()}</p>
            <p className="text-xs text-muted-foreground mt-1">Thank you for using MaceyRunners! 🏃</p>
          </div>

          <Button onClick={handlePrint} variant="outline" className="w-full gap-2 rounded-xl">
            <Download className="h-4 w-4" /> Print / Save Receipt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderReceipt;
