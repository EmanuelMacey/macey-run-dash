import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Gift, Copy, Users, CheckCircle2, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ReferralSection = () => {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState("");
  const [creditBalance, setCreditBalance] = useState(0);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const [profileRes, referralsRes] = await Promise.all([
        supabase.from("profiles").select("referral_code, credit_balance").eq("user_id", user.id).single(),
        supabase.from("referrals").select("*").eq("referrer_id", user.id).order("created_at", { ascending: false }),
      ]);
      if (profileRes.data) {
        setReferralCode(profileRes.data.referral_code || "");
        setCreditBalance(profileRes.data.credit_balance || 0);
      }
      setReferrals(referralsRes.data || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success("Referral code copied!");
  };

  const shareLink = () => {
    const url = `${window.location.origin}/signup?ref=${referralCode}`;
    if (navigator.share) {
      navigator.share({ title: "Join MaceyRunners!", text: `Use my referral code ${referralCode} to sign up!`, url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Referral link copied!");
    }
  };

  if (loading) {
    return <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-20 bg-muted rounded-2xl animate-pulse" />)}</div>;
  }

  const credited = referrals.filter(r => r.status === "credited").length;
  const pending = referrals.filter(r => r.status === "pending").length;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
          <Gift className="h-6 w-6 text-primary" /> Refer & Earn
        </h2>
        <p className="text-muted-foreground text-sm">Invite friends and earn $500 GYD when they complete their first order</p>
      </div>

      {/* Credit Balance */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-5 border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Your Credit Balance</p>
            <p className="font-display text-3xl font-bold text-primary">${creditBalance.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">GYD</span></p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>

      {/* Referral Code */}
      <div className="bg-card rounded-2xl p-5 border border-border/50 space-y-3">
        <p className="text-sm font-semibold text-foreground">Your Referral Code</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-muted/50 rounded-xl px-4 py-3 text-center">
            <span className="font-display text-2xl font-bold tracking-widest text-foreground">{referralCode}</span>
          </div>
          <Button variant="outline" size="icon" onClick={copyCode} className="rounded-xl h-12 w-12 shrink-0">
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={shareLink} className="w-full rounded-full h-11 gradient-primary text-primary-foreground font-semibold">
          <Users className="h-4 w-4 mr-2" /> Share with Friends
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-2xl p-4 border border-border/50 text-center">
          <CheckCircle2 className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="font-display text-2xl font-bold text-foreground">{credited}</p>
          <p className="text-xs text-muted-foreground">Completed</p>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border/50 text-center">
          <Clock className="h-5 w-5 text-accent mx-auto mb-1" />
          <p className="font-display text-2xl font-bold text-foreground">{pending}</p>
          <p className="text-xs text-muted-foreground">Pending</p>
        </div>
      </div>

      {/* Referral History */}
      {referrals.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">Referral History</p>
          {referrals.map((r) => (
            <div key={r.id} className="flex items-center justify-between bg-card rounded-xl p-3 border border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Referral</p>
                  <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <Badge variant={r.status === "credited" ? "default" : "secondary"} className="rounded-full">
                {r.status === "credited" ? "Earned $500" : "Pending"}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReferralSection;
