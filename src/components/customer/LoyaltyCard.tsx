import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Star, Gift, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const REDEEM_TIERS = [
  { points: 50, discount: 500, label: "$500 GYD off" },
  { points: 100, discount: 1000, label: "$1,000 GYD off" },
  { points: 200, discount: 2500, label: "$2,500 GYD off" },
];

const LoyaltyCard = () => {
  const { user } = useAuth();
  const [points, setPoints] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [redeeming, setRedeeming] = useState(false);

  const fetchLoyalty = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("loyalty_points")
      .select("points, total_earned, total_redeemed")
      .eq("user_id", user.id)
      .single();
    if (data) {
      setPoints(data.points);
      setTotalEarned(data.total_earned);
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("loyalty_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    setTransactions(data || []);
  };

  useEffect(() => {
    fetchLoyalty();
  }, [user]);

  useEffect(() => {
    if (showHistory) fetchTransactions();
  }, [showHistory, user]);

  // Realtime updates
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("loyalty-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "loyalty_points", filter: `user_id=eq.${user.id}` }, () => fetchLoyalty())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleRedeem = async (tier: typeof REDEEM_TIERS[0]) => {
    if (!user || points < tier.points) return;
    setRedeeming(true);
    try {
      // Deduct points
      const { error } = await supabase
        .from("loyalty_points")
        .update({
          points: points - tier.points,
          total_redeemed: totalEarned - (points - tier.points),
        })
        .eq("user_id", user.id);
      if (error) throw error;

      // Log transaction
      await supabase.from("loyalty_transactions").insert({
        user_id: user.id,
        points: -tier.points,
        type: "redeem",
        description: `Redeemed for ${tier.label}`,
      });

      // Create a promo code for the discount
      const code = `LOYAL${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      await supabase.from("promo_codes").insert({
        code,
        discount_amount: tier.discount,
        is_active: true,
        max_uses: 1,
        current_uses: 0,
      });

      toast.success(`Redeemed! Use promo code: ${code}`, { duration: 10000 });
      fetchLoyalty();
      if (showHistory) fetchTransactions();
    } catch (err: any) {
      toast.error(err.message || "Failed to redeem");
    } finally {
      setRedeeming(false);
    }
  };

  // Determine tier level
  const tierName = totalEarned >= 200 ? "Gold" : totalEarned >= 100 ? "Silver" : "Bronze";
  const tierColor = totalEarned >= 200 ? "text-yellow-500" : totalEarned >= 100 ? "text-gray-400" : "text-amber-600";
  const nextTier = totalEarned >= 200 ? null : totalEarned >= 100 ? { name: "Gold", needed: 200 - totalEarned } : { name: "Silver", needed: 100 - totalEarned };

  return (
    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Star className={`h-5 w-5 ${tierColor} fill-current`} />
            <h3 className="font-display font-bold text-foreground">Loyalty Rewards</h3>
          </div>
          <Badge variant="outline" className={`${tierColor} border-current text-xs font-bold`}>
            {tierName}
          </Badge>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="font-display text-3xl font-bold text-primary">{points}</span>
          <span className="text-sm text-muted-foreground">points available</span>
        </div>
        {nextTier && (
          <p className="text-xs text-muted-foreground mt-1">
            <TrendingUp className="inline h-3 w-3 mr-1" />
            {nextTier.needed} more points to {nextTier.name}
          </p>
        )}
      </div>

      {/* Redeem tiers */}
      <div className="p-4 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Redeem Points</p>
        <div className="grid grid-cols-3 gap-2">
          {REDEEM_TIERS.map((tier) => (
            <Button
              key={tier.points}
              variant={points >= tier.points ? "default" : "outline"}
              size="sm"
              disabled={points < tier.points || redeeming}
              onClick={() => handleRedeem(tier)}
              className="flex flex-col h-auto py-2 rounded-xl text-xs"
            >
              <Gift className="h-3.5 w-3.5 mb-0.5" />
              <span className="font-bold">{tier.points} pts</span>
              <span className="text-[10px] opacity-80">{tier.label}</span>
            </Button>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground">Earn ~10 points per $1,000 GYD spent</p>
      </div>

      {/* History toggle */}
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="w-full px-4 py-2 text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 border-t border-border/50 transition-colors"
      >
        {showHistory ? "Hide" : "View"} Points History
        {showHistory ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-1.5 max-h-48 overflow-y-auto">
              {transactions.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-3">No transactions yet</p>
              ) : (
                transactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-foreground">{t.description}</span>
                      <span className="text-muted-foreground ml-2">
                        {new Date(t.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <span className={`font-bold ${t.points > 0 ? "text-green-500" : "text-destructive"}`}>
                      {t.points > 0 ? "+" : ""}{t.points}
                    </span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoyaltyCard;
