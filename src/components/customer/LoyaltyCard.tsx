import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Star, Gift, TrendingUp, ChevronDown, ChevronUp, Crown, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const REDEEM_TIERS = [
  { points: 50, discount: 200, label: "$200 GYD off", emoji: "🎁" },
  { points: 100, discount: 400, label: "$400 GYD off", emoji: "🎉" },
  { points: 200, discount: 800, label: "$800 GYD off", emoji: "💎" },
];

const TIER_CONFIG = {
  Bronze: { icon: Star, color: "text-amber-600", bg: "from-amber-500/20 to-orange-500/10", border: "border-amber-500/30", min: 0, max: 100 },
  Silver: { icon: Trophy, color: "text-slate-400", bg: "from-slate-300/20 to-slate-500/10", border: "border-slate-400/30", min: 100, max: 200 },
  Gold: { icon: Crown, color: "text-yellow-500", bg: "from-yellow-400/20 to-amber-500/10", border: "border-yellow-500/30", min: 200, max: 500 },
} as const;

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

  useEffect(() => { fetchLoyalty(); }, [user]);
  useEffect(() => { if (showHistory) fetchTransactions(); }, [showHistory, user]);

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
      const { data, error } = await supabase.rpc("redeem_loyalty_points", {
        p_tier_points: tier.points,
        p_discount_amount: tier.discount,
      });
      if (error) throw error;

      const code = data as string;
      toast.success(`${tier.emoji} Redeemed! Use promo code: ${code}`, { duration: 10000 });
      fetchLoyalty();
      if (showHistory) fetchTransactions();
    } catch (err: any) {
      toast.error(err.message || "Failed to redeem");
    } finally {
      setRedeeming(false);
    }
  };

  const tierName = totalEarned >= 200 ? "Gold" : totalEarned >= 100 ? "Silver" : "Bronze";
  const tier = TIER_CONFIG[tierName];
  const TierIcon = tier.icon;
  const nextTier = tierName === "Gold" ? null : tierName === "Silver" ? { name: "Gold", needed: 200 - totalEarned, target: 200 } : { name: "Silver", needed: 100 - totalEarned, target: 100 };
  const tierProgress = nextTier ? ((totalEarned - tier.min) / (nextTier.target - tier.min)) * 100 : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border/50 rounded-2xl overflow-hidden relative"
    >
      {/* Decorative shimmer */}
      <div className="absolute inset-0 shimmer pointer-events-none opacity-50" />

      {/* Header with gradient */}
      <div className={`relative bg-gradient-to-r ${tier.bg} p-5 pb-4`}>
        <div className="absolute top-3 right-3 opacity-10">
          <Sparkles className="h-16 w-16" />
        </div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tier.bg} ${tier.border} border flex items-center justify-center`}>
              <TierIcon className={`h-5 w-5 ${tier.color} fill-current`} />
            </div>
            <div>
              <h3 className="font-display font-bold text-foreground text-base">Loyalty Rewards</h3>
              <Badge variant="outline" className={`${tier.color} border-current text-[10px] font-bold mt-0.5`}>
                {tierName} Member
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-baseline gap-1.5 mb-3">
          <span className="font-display text-4xl font-bold gradient-text">{points}</span>
          <span className="text-sm text-muted-foreground font-medium">points</span>
        </div>

        {/* Tier progress */}
        {nextTier && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {nextTier.needed} pts to {nextTier.name}
              </span>
              <span className="text-muted-foreground font-medium">{Math.round(tierProgress)}%</span>
            </div>
            <Progress value={tierProgress} className="h-2" />
          </div>
        )}
        {!nextTier && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Crown className="h-3 w-3 text-yellow-500" /> You've reached the highest tier! 🎉
          </p>
        )}
      </div>

      {/* Redeem section */}
      <div className="p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Redeem Rewards</p>
        <div className="grid grid-cols-3 gap-2">
          {REDEEM_TIERS.map((t) => {
            const canRedeem = points >= t.points;
            return (
              <motion.div key={t.points} whileHover={canRedeem ? { scale: 1.03 } : {}} whileTap={canRedeem ? { scale: 0.97 } : {}}>
                <Button
                  variant={canRedeem ? "default" : "outline"}
                  size="sm"
                  disabled={!canRedeem || redeeming}
                  onClick={() => handleRedeem(t)}
                  className={`flex flex-col h-auto py-3 rounded-xl text-xs w-full transition-all ${canRedeem ? "shadow-md shadow-primary/20 glow-card" : "opacity-60"}`}
                >
                  <span className="text-base mb-0.5">{t.emoji}</span>
                  <span className="font-bold">{t.points} pts</span>
                  <span className="text-[10px] opacity-80 mt-0.5">{t.label}</span>
                </Button>
              </motion.div>
            );
          })}
        </div>
        <p className="text-[10px] text-muted-foreground text-center">
          Earn ~10 points per $1,000 GYD spent • Points never expire
        </p>
      </div>

      {/* History toggle */}
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="w-full px-4 py-2.5 text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 border-t border-border/50 transition-colors font-medium"
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
            <div className="px-4 pb-4 space-y-2 max-h-48 overflow-y-auto">
              {transactions.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No transactions yet — place an order to start earning!</p>
              ) : (
                transactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between text-xs bg-muted/30 rounded-lg px-3 py-2">
                    <div>
                      <span className="text-foreground font-medium">{t.description}</span>
                      <span className="text-muted-foreground ml-2 text-[10px]">
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
    </motion.div>
  );
};

export default LoyaltyCard;
