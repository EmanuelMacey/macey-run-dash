import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Banner {
  id: string;
  title: string;
  message: string;
}

const PromoBanner = () => {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    const fetchBanner = async () => {
      const { data } = await supabase
        .from("promotional_banners")
        .select("id, title, message")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (data) setBanner(data as Banner);
    };
    fetchBanner();
  }, []);

  if (!banner || dismissed.includes(banner.id)) return null;

  return (
    <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-2xl p-4 mb-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="flex items-start gap-3 relative z-10">
        <Megaphone className="h-5 w-5 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-sm">{banner.title}</h3>
          <p className="text-xs mt-1 opacity-90">{banner.message}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0 text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10"
          onClick={() => setDismissed((prev) => [...prev, banner.id])}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default PromoBanner;
