import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Phone, Upload, CheckCircle2, Clock, AlertTriangle, Copy, ShieldCheck, CreditCard, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

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
  const [timeLeft, setTimeLeft] = useState(20 * 60);

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

  const progressPercent = (timeLeft / (20 * 60)) * 100;

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
          toast.error("This Transaction ID has already been used.");
        } else {
          throw error;
        }
        return;
      }

      setSubmitted(true);
      toast.success("Payment verification submitted!");
      setTimeout(() => onComplete(), 2500);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit verification");
    } finally {
      setSubmitting(false);
    }
  };

  if (!settings) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-5 py-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mx-auto"
        >
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </motion.div>
        <h3 className="font-display text-2xl font-bold text-foreground">Payment Submitted!</h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Your payment verification is being reviewed by our team. You'll receive a notification once confirmed.
        </p>
        <Badge variant="outline" className="text-primary border-primary/30 px-4 py-1.5 text-sm">
          <Clock className="h-3.5 w-3.5 mr-1.5" /> Pending Verification
        </Badge>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Timer */}
      <div className={`relative overflow-hidden rounded-2xl border ${timeLeft < 300 ? "bg-destructive/5 border-destructive/30" : "bg-accent/5 border-accent/20"}`}>
        <div className="p-4 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <Clock className={`h-5 w-5 ${timeLeft < 300 ? "text-destructive animate-pulse" : "text-accent"}`} />
            <div>
              <p className="text-xs text-muted-foreground font-medium">Complete payment within</p>
              <p className={`text-2xl font-display font-bold tracking-tight ${timeLeft < 300 ? "text-destructive" : "text-foreground"}`}>
                {formatTime(timeLeft)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Order expires if not verified</p>
          </div>
        </div>
        <div className="h-1 bg-muted/30">
          <motion.div
            className={`h-full ${timeLeft < 300 ? "bg-destructive" : "bg-accent"}`}
            style={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Payment Card */}
      <div className="rounded-xl bg-card border border-border/60 p-4 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <CreditCard className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">MMG Payment</h3>
            <p className="text-[11px] text-muted-foreground">Send payment to the details below</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="bg-muted/30 rounded-lg px-3 py-2.5 border border-border/40">
            <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Account Name</p>
            <p className="font-semibold text-foreground text-sm">{settings.account_name}</p>
          </div>

          <div className="bg-muted/30 rounded-lg px-3 py-2.5 border border-border/40 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">MMG Number</p>
              <p className="font-bold text-primary text-lg tracking-wide">{settings.mmg_number}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs rounded-lg border-primary/30 hover:bg-primary/10"
              onClick={() => {
                navigator.clipboard.writeText(settings.mmg_number);
                toast.success("MMG number copied!");
              }}
            >
              <Copy className="h-3 w-3 mr-1" /> Copy
            </Button>
          </div>

          <div className="bg-accent/5 rounded-lg px-3 py-2.5 border border-accent/20">
            <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Amount to Pay</p>
            <p className="font-bold text-xl text-foreground">
              ${amount.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">GYD</span>
            </p>
          </div>
        </div>

        <div className="bg-muted/20 rounded-lg px-3 py-2.5 border border-border/30">
          <h4 className="text-[11px] font-bold text-foreground mb-1.5 flex items-center gap-1">
            <ArrowRight className="h-3 w-3 text-accent" /> How to Pay
          </h4>
          <ol className="text-[11px] text-muted-foreground space-y-1 list-decimal list-inside leading-relaxed">
            <li>Open your <span className="font-semibold text-foreground">MMG wallet</span> app</li>
            <li>Send <span className="font-semibold text-accent">${amount.toLocaleString()} GYD</span> to <span className="font-semibold text-primary">{settings.mmg_number}</span></li>
            <li>Copy the <span className="font-semibold text-foreground">Transaction ID</span> from MMG</li>
            <li>Come back here and <span className="font-semibold text-foreground">submit the ID below</span></li>
          </ol>
        </div>
      </div>

      {/* Verification Form */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-accent" />
          <h4 className="font-display font-bold text-lg text-foreground">Submit Verification</h4>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold flex items-center gap-1">
            Transaction ID <span className="text-destructive">*</span>
          </Label>
          <Input
            placeholder="Enter your MMG Transaction ID"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            className="rounded-xl h-12 text-base font-mono bg-muted/30 border-border/50"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold flex items-center gap-1">
            MMG Number Used <span className="text-destructive">*</span>
          </Label>
          <Input
            placeholder="e.g. +592 6XX XXXX"
            value={mmgNumberUsed}
            onChange={(e) => setMmgNumberUsed(e.target.value)}
            className="rounded-xl h-12 text-base bg-muted/30 border-border/50"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold flex items-center gap-1.5">
            <Upload className="h-3.5 w-3.5" /> Payment Screenshot <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          {screenshot ? (
            <div className="flex items-center gap-2 bg-accent/5 border border-accent/20 rounded-xl p-3">
              <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
              <span className="text-sm truncate flex-1 text-foreground">{screenshot.name}</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => setScreenshot(null)} className="text-muted-foreground hover:text-destructive">
                Remove
              </Button>
            </div>
          ) : (
            <label className="flex items-center gap-3 border-2 border-dashed border-border/50 rounded-xl p-4 cursor-pointer hover:border-accent/40 transition-colors">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Upload screenshot</p>
                <p className="text-xs text-muted-foreground">Helps speed up verification</p>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setScreenshot(e.target.files?.[0] || null)} />
            </label>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={submitting || !transactionId.trim() || !mmgNumberUsed.trim()}
          className="w-full h-14 rounded-2xl text-base font-bold bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg"
          size="lg"
        >
          {submitting ? (
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <ShieldCheck className="h-5 w-5 mr-2" />
          )}
          Submit Payment Verification
        </Button>
      </div>

      {/* Cash Exception */}
      <div className="bg-muted/30 rounded-2xl p-5 border border-border/30 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Need to pay by cash?</p>
            <p className="text-xs text-muted-foreground mt-1">
              Contact MaceyRunners support to arrange cash payment. Cash orders require admin approval before dispatch.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full rounded-xl border-amber-500/30 hover:bg-amber-500/5 font-semibold"
          onClick={() => window.open("tel:+5927219769")}
        >
          <Phone className="h-4 w-4 mr-2" /> Call Support: +592 721-9769
        </Button>
      </div>
    </motion.div>
  );
};

export default MMGPaymentPage;
