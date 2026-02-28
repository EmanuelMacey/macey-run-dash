import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X, Sparkles, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Banner {
  id: string;
  title: string;
  message: string;
  image_url: string | null;
  linked_product_id: string | null;
  linked_store_id: string | null;
}

interface PromoBannerProps {
  onNavigateToStore?: (storeId: string) => void;
}

const PromoBanner = ({ onNavigateToStore }: PromoBannerProps) => {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchBanner = async () => {
      const { data } = await supabase
        .from("promotional_banners")
        .select("id, title, message, image_url, linked_product_id, linked_store_id")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (data) {
        setBanner(data as Banner);
        const dismissedIds = JSON.parse(localStorage.getItem("dismissed-promos") || "[]");
        if (!dismissedIds.includes(data.id)) {
          setTimeout(() => setOpen(true), 800);
        }
      }
    };
    fetchBanner();
  }, []);

  const handleDismiss = () => {
    if (banner) {
      const dismissedIds = JSON.parse(localStorage.getItem("dismissed-promos") || "[]");
      localStorage.setItem("dismissed-promos", JSON.stringify([...dismissedIds, banner.id]));
      setDismissed((prev) => [...prev, banner.id]);
    }
    setOpen(false);
  };

  const handleShopNow = () => {
    if (banner?.linked_store_id && onNavigateToStore) {
      onNavigateToStore(banner.linked_store_id);
    }
    handleDismiss();
  };

  if (!banner || dismissed.includes(banner.id)) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleDismiss(); else setOpen(v); }}>
      <DialogContent className="sm:max-w-sm p-0 overflow-hidden border-0 rounded-3xl shadow-2xl [&>button]:hidden">
        {/* Featured image - full width, prominent display */}
        {banner.image_url && (
          <div className="relative w-full">
            <img
              src={banner.image_url}
              alt={banner.title}
              className="w-full max-h-[50vh] object-contain bg-black/5"
            />
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors z-10"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
        )}

        {/* Content area */}
        <div className="p-5 space-y-3">
          {!banner.image_url && (
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
          
          <h2 className="font-display font-bold text-xl text-foreground text-center leading-tight">{banner.title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed text-center">{banner.message}</p>
          
          <div className="flex gap-2">
            {banner.linked_store_id && onNavigateToStore ? (
              <>
                <Button
                  onClick={handleShopNow}
                  className="flex-1 rounded-full h-11 font-bold text-sm gradient-primary text-primary-foreground"
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Order Now
                </Button>
                <Button
                  onClick={handleDismiss}
                  variant="outline"
                  className="rounded-full h-11 text-sm px-4"
                >
                  Later
                </Button>
              </>
            ) : (
              <Button
                onClick={handleDismiss}
                className="w-full rounded-full h-11 font-bold text-sm gradient-primary text-primary-foreground"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Got it!
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PromoBanner;
