import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Send, Megaphone, Lightbulb, Users, UserMinus, Loader2 } from "lucide-react";

const PRESETS = [
  { title: "🔥 Limited Time Offer!", message: "Get 20% off your next delivery! Use code SAVE20 at checkout. Valid for 48 hours only!", target: "all" },
  { title: "🍔 New Restaurant Alert!", message: "Check out our newest restaurant partner on the marketplace! Order now and earn double loyalty points.", target: "all" },
  { title: "👋 We Miss You!", message: "It's been a while! Come back and enjoy a special discount on your next order. We've got exciting new features waiting for you!", target: "inactive" },
  { title: "🎁 Refer & Earn!", message: "Share your referral code with friends and earn credits when they complete their first order! Check your profile for your code.", target: "all" },
];

const AdminPromotions = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("all");
  const [sending, setSending] = useState(false);
  const [sendingTip, setSendingTip] = useState(false);

  const sendPromotion = async () => {
    if (!title.trim() || !message.trim()) return toast.error("Title and message are required");
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-promotional-notifications", {
        body: { type: "custom", title: title.trim(), message: message.trim(), target },
      });
      if (error) throw error;
      toast.success(`Sent to ${data.sent} users! 🚀`);
      setTitle("");
      setMessage("");
    } catch (err: any) {
      toast.error(err.message || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  const sendDailyTip = async () => {
    setSendingTip(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-promotional-notifications", {
        body: { type: "daily_tip", target: "all" },
      });
      if (error) throw error;
      toast.success(`Daily tip sent to ${data.sent} users! 💡`);
    } catch (err: any) {
      toast.error(err.message || "Failed to send");
    } finally {
      setSendingTip(false);
    }
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setTitle(preset.title);
    setMessage(preset.message);
    setTarget(preset.target);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" /> Promotional Notifications
        </h2>
        <Button variant="outline" size="sm" onClick={sendDailyTip} disabled={sendingTip} className="gap-2">
          {sendingTip ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4" />}
          Send Daily Tip
        </Button>
      </div>

      {/* Quick presets */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Quick Templates</p>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => applyPreset(p)}
              className="text-left bg-card border border-border/50 rounded-xl p-3 hover:border-primary/30 hover:shadow-md transition-all text-xs"
            >
              <p className="font-semibold text-foreground truncate">{p.title}</p>
              <p className="text-muted-foreground mt-0.5 line-clamp-2">{p.message}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Custom notification form */}
      <div className="bg-card border border-border/50 rounded-2xl p-5 space-y-4">
        <div className="space-y-2">
          <Label>Notification Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. 🔥 Flash Sale Today!" />
        </div>
        <div className="space-y-2">
          <Label>Message</Label>
          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write your promotional message..." rows={3} />
        </div>
        <div className="space-y-2">
          <Label>Target Audience</Label>
          <Select value={target} onValueChange={setTarget}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <span className="flex items-center gap-2"><Users className="h-3.5 w-3.5" /> All Customers</span>
              </SelectItem>
              <SelectItem value="inactive">
                <span className="flex items-center gap-2"><UserMinus className="h-3.5 w-3.5" /> Inactive Users (7+ days)</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="w-full gap-2" onClick={sendPromotion} disabled={sending || !title.trim() || !message.trim()}>
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Send to {target === "all" ? "All Customers" : "Inactive Users"}
        </Button>
      </div>
    </div>
  );
};

export default AdminPromotions;
