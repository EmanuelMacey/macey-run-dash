import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X, Sparkles, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

interface Banner {
  id: string;
  title: string;
  message: string;
}

const PromoBanner = () => {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchBanner = async () => {
      const { data } = await supabase
        .from("promotional_banners")
        .select("id, title, message")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (data) {
        setBanner(data as Banner);
        // Auto-show popup after a short delay
        const dismissedIds = JSON.parse(sessionStorage.getItem("dismissed-promos") || "[]");
        if (!dismissedIds.includes(data.id)) {
          setTimeout(() => setOpen(true), 800);
        }
      }
    };
    fetchBanner();
  }, []);

  const handleDismiss = () => {
    if (banner) {
      const dismissedIds = JSON.parse(sessionStorage.getItem("dismissed-promos") || "[]");
      sessionStorage.setItem("dismissed-promos", JSON.stringify([...dismissedIds, banner.id]));
      setDismissed((prev) => [...prev, banner.id]);
    }
    setOpen(false);
  };

  if (!banner || dismissed.includes(banner.id)) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleDismiss(); else setOpen(v); }}>
      <DialogContent className="sm:max-w-sm p-0 overflow-hidden border-0 rounded-3xl shadow-2xl">
        {/* Top gradient banner */}
        <div className="relative bg-gradient-to-br from-primary via-primary/90 to-accent p-6 pb-8 text-center overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 left-0 w-24 h-24 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-1/4 translate-y-1/4" />
          <div className="absolute top-4 right-6 w-8 h-8 bg-white/10 rounded-full" />

          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="h-3.5 w-3.5 text-white" />
          </button>

          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
              <Gift className="h-7 w-7 text-white" />
            </div>
            <h2 className="font-display font-bold text-xl text-white leading-tight">{banner.title}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 text-center space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{banner.message}</p>
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleDismiss}
              className="w-full rounded-full h-11 font-bold text-sm gradient-primary text-primary-foreground"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Got it!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PromoBanner;
