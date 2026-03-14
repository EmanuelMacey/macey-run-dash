import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Phone, Upload, CheckCircle2, Clock, AlertTriangle, Copy } from "lucide-react";

interface MMGPaymentPageProps {
  orderId: string;
  amount: number;
  onComplete: () => void;
  onCancel: () => void;
}

const MMGPaymentPage = ({ orderId, amount, onComplete, onCancel }: MMGPaymentPageProps) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<{ mmg_number: string; account_name: string; payment_instructions: string } | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [mmgNumberUsed, setMmgNumberUsed] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutes

  useEffect(() => {
    supabase
      .from("payment_settings")
      .select("mmg_number, account_name, payment_instructions")
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) setSettings(data as any);
      });
  }, []);

  // Countdown timer
  useEffect(() => {
    if (submitted || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          toast.error("Payment verification time expired. Order cancelled.");
          onCancel();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [submitted, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async () => {
    if (!user || !transactionId.trim() || !mmgNumberUsed.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      let screenshotUrl: string | null = null;
      if (screenshot) {
        const ext = screenshot.name.split(".").pop();
        const path = `${user.id}/payment-${orderId}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("errand-attachments").upload(path, screenshot);
        if (!uploadErr) {
          const { data: urlData } = supabase.storage.from("errand-attachments").getPublicUrl(path);
          screenshotUrl = urlData.publicUrl;
        }
      }

      const { error } = await supabase.from("payment_verifications").insert({
        order_id: orderId,
        customer_id: user.id,
        transaction_id: transactionId.trim(),
        mmg_number_used: mmgNumberUsed.trim(),
        screenshot_url: screenshotUrl,
      } as any);

      if (error) {
        if (error.message?.includes("unique") || error.message?.includes("duplicate")) {
          toast.error("This Transaction ID has already been used. Please check and try again.");
        } else {
          throw error;
        }
        return;
      }

      setSubmitted(true);
      toast.success("Payment verification submitted! We'll verify shortly.");
      setTimeout(() => onComplete(), 2000);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit verification");
    } finally {
      setSubmitting(false);
    }
  };

  if (!settings) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="text-center space-y-4 p-6">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </div>
        <h3 className="font-display text-xl font-bold text-foreground">Payment Submitted!</h3>
        <p className="text-sm text-muted-foreground">
          Your payment verification is being reviewed. You'll be notified once confirmed.
        </p>
        <Badge variant="outline" className="text-primary border-primary/30">
          <Clock className="h-3 w-3 mr-1" /> Pending Payment Verification
        </Badge>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Timer warning */}
      <div className={`flex items-center gap-2 p-3 rounded-xl border ${timeLeft < 300 ? "bg-destructive/10 border-destructive/30" : "bg-accent/10 border-accent/30"}`}>
        <Clock className={`h-4 w-4 ${timeLeft < 300 ? "text-destructive" : "text-accent"}`} />
        <span className="text-sm font-semibold">
          Time remaining: <span className={timeLeft < 300 ? "text-destructive" : "text-primary"}>{formatTime(timeLeft)}</span>
        </span>
      </div>

      {/* Payment Instructions */}
      <Card className="p-5 space-y-4 border-primary/20 bg-primary/5">
        <div className="text-center space-y-1">
          <Badge className="bg-primary text-primary-foreground">MMG Payment</Badge>
          <h3 className="font-display text-lg font-bold text-foreground mt-2">Payment Instructions</h3>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center bg-card rounded-xl p-3 border border-border/50">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide">Account Name</p>
              <p className="font-display font-bold text-foreground">{settings.account_name}</p>
            </div>
          </div>

          <div className="flex justify-between items-center bg-card rounded-xl p-3 border border-border/50">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide">MMG Number</p>
              <p className="font-display font-bold text-primary text-lg">{settings.mmg_number}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(settings.mmg_number);
                toast.success("MMG number copied!");
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex justify-between items-center bg-card rounded-xl p-3 border border-border/50">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide">Amount to Pay</p>
              <p className="font-display font-bold text-green-600 text-xl">${amount.toLocaleString()} GYD</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-3 border border-border/50">
          <p className="text-xs text-muted-foreground leading-relaxed">{settings.payment_instructions}</p>
        </div>
      </Card>

      {/* Verification Form */}
      <div className="space-y-4">
        <h4 className="font-display font-bold text-foreground">Submit Payment Verification</h4>

        <div className="space-y-2">
          <Label className="text-sm font-semibold">Transaction ID *</Label>
          <Input
            placeholder="Enter your MMG Transaction ID"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            className="rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold">MMG Number Used *</Label>
          <Input
            placeholder="e.g. +592 6XX XXXX"
            value={mmgNumberUsed}
            onChange={(e) => setMmgNumberUsed(e.target.value)}
            className="rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold flex items-center gap-1">
            <Upload className="h-3.5 w-3.5" /> Payment Screenshot (optional)
          </Label>
          {screenshot ? (
            <div className="flex items-center gap-2 bg-muted/50 rounded-xl p-3">
              <span className="text-sm truncate flex-1">{screenshot.name}</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => setScreenshot(null)}>Remove</Button>
            </div>
          ) : (
            <label className="flex items-center gap-2 border border-dashed border-border rounded-xl p-3 cursor-pointer hover:border-primary/50 transition-colors">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Upload screenshot of payment</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setScreenshot(e.target.files?.[0] || null)} />
            </label>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={submitting || !transactionId.trim() || !mmgNumberUsed.trim()}
          className="w-full rounded-xl"
        >
          {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Submit Payment Verification
        </Button>
      </div>

      {/* Cash Exception */}
      <div className="bg-muted/50 rounded-xl p-4 border border-border/50 space-y-2">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-foreground">Need to pay by cash instead?</p>
            <p className="text-xs text-muted-foreground">Contact MaceyRunners support before submitting your order. Cash payments require admin approval.</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full rounded-xl text-xs"
          onClick={() => window.open("tel:+5927219769")}
        >
          <Phone className="h-3.5 w-3.5 mr-1.5" /> Contact Support: +592 721-9769
        </Button>
      </div>
    </div>
  );
};

export default MMGPaymentPage;
