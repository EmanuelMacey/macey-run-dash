import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface TipDialogProps {
  orderId: string;
  initialTip?: number;
  autoOpen?: boolean;
  onTipped?: (newTip: number) => void;
}

const PRESETS = [200, 500, 1000, 2000];

const TipDialog = ({ orderId, initialTip = 0, autoOpen = false, onTipped }: TipDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<number>(initialTip > 0 ? initialTip : 500);
  const [custom, setCustom] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [currentTip, setCurrentTip] = useState(initialTip);

  useEffect(() => {
    setCurrentTip(initialTip);
  }, [initialTip]);

  useEffect(() => {
    if (autoOpen && currentTip === 0) {
      const t = setTimeout(() => setOpen(true), 1400);
      return () => clearTimeout(t);
    }
  }, [autoOpen, currentTip]);

  const sendConfirmationEmail = async (newTip: number) => {
    if (!user?.email || newTip <= 0) return;
    try {
      // Pull order + driver context for the email
      const { data: order } = await (supabase as any)
        .from("orders")
        .select("order_number, price, driver_id")
        .eq("id", orderId)
        .maybeSingle();

      let driverName: string | undefined;
      if (order?.driver_id) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("user_id", order.driver_id)
          .maybeSingle();
        driverName = prof?.full_name ?? undefined;
      }

      const { data: me } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .maybeSingle();

      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "tip-confirmation",
          recipientEmail: user.email,
          idempotencyKey: `tip-confirm-${orderId}-${newTip}`,
          templateData: {
            customerName: me?.full_name ?? undefined,
            driverName,
            tipAmount: newTip,
            orderNumber: order?.order_number ?? orderId.slice(0, 8),
            orderTotal: order?.price ?? undefined,
          },
        },
      });
    } catch (err) {
      // Non-fatal — tip already saved
      console.warn("Tip confirmation email failed", err);
    }
  };

  const submit = async () => {
    if (amount < 0) return;
    setSubmitting(true);
    const { error } = await (supabase as any).rpc("customer_add_tip", {
      p_order_id: orderId,
      p_amount: amount,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message || "Could not add tip");
      return;
    }
    setCurrentTip(amount);
    onTipped?.(amount);
    toast.success(amount > 0 ? `Thanks! $${amount.toLocaleString()} GYD tip sent 💚` : "Tip removed");
    setOpen(false);
    if (amount > 0) {
      sendConfirmationEmail(amount);
      // Notify driver via email (best-effort)
      supabase.functions
        .invoke("notify-driver-tip", { body: { orderId, tipAmount: amount } })
        .catch((err) => console.warn("Driver tip email failed", err));
    }
  };

  if (currentTip > 0) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Heart className="h-3.5 w-3.5 text-primary fill-primary/30" />
            Tipped ${currentTip.toLocaleString()}
          </Button>
        </DialogTrigger>
        <TipBody
          amount={amount}
          setAmount={setAmount}
          custom={custom}
          setCustom={setCustom}
          submit={submit}
          submitting={submitting}
          editing
        />
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <Heart className="h-3.5 w-3.5 text-primary" />
          Tip Driver
        </Button>
      </DialogTrigger>
      <TipBody
        amount={amount}
        setAmount={setAmount}
        custom={custom}
        setCustom={setCustom}
        submit={submit}
        submitting={submitting}
      />
    </Dialog>
  );
};

const TipBody = ({
  amount, setAmount, custom, setCustom, submit, submitting, editing = false,
}: {
  amount: number;
  setAmount: (n: number) => void;
  custom: string;
  setCustom: (s: string) => void;
  submit: () => void;
  submitting: boolean;
  editing?: boolean;
}) => (
  <DialogContent className="sm:max-w-sm">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <Heart className="h-5 w-5 text-primary" />
        {editing ? "Update your tip" : "Tip your driver"}
      </DialogTitle>
      <DialogDescription>
        100% of tips go directly to your driver. Choose an amount or enter your own.
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-4 py-2">
      <div className="grid grid-cols-4 gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => { setAmount(p); setCustom(""); }}
            className={`rounded-xl border-2 py-2 text-sm font-semibold transition-all ${
              amount === p && !custom
                ? "border-primary bg-primary/5 text-primary"
                : "border-border hover:border-primary/40"
            }`}
          >
            ${p.toLocaleString()}
          </button>
        ))}
      </div>
      <Input
        type="number"
        min={0}
        max={50000}
        placeholder="Custom amount (GYD)"
        value={custom}
        onChange={(e) => {
          const v = e.target.value;
          setCustom(v);
          const n = Math.max(0, Math.floor(Number(v) || 0));
          setAmount(n);
        }}
      />
      <p className="text-center text-sm text-muted-foreground">
        Sending <span className="font-bold text-primary">${amount.toLocaleString()} GYD</span> to your driver
      </p>
    </div>

    <DialogFooter className="flex-row gap-2 sm:gap-2">
      {editing && (
        <Button
          variant="outline"
          className="flex-1"
          disabled={submitting}
          onClick={() => { setAmount(0); setCustom("0"); setTimeout(submit, 0); }}
        >
          Remove tip
        </Button>
      )}
      <Button onClick={submit} disabled={submitting || amount < 0} className="flex-1">
        {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Heart className="h-4 w-4 mr-2" />}
        {editing ? "Update tip" : "Send tip"}
      </Button>
    </DialogFooter>
  </DialogContent>
);

export default TipDialog;
