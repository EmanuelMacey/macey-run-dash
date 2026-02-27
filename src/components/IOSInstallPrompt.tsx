import { useState, useEffect } from "react";
import { X, Share, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const IOSInstallPrompt = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show on iOS Safari that's NOT already installed as PWA
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches 
      || (navigator as any).standalone === true;
    const dismissed = localStorage.getItem("ios-install-dismissed");

    if (isIOS && !isStandalone && !dismissed) {
      // Delay showing the prompt
      const timer = setTimeout(() => setShow(true), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem("ios-install-dismissed", Date.now().toString());
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-[60] p-4 pb-[env(safe-area-inset-bottom,16px)]"
        >
          <div className="bg-card border border-border/50 rounded-2xl shadow-2xl p-5 mx-auto max-w-md relative">
            <button
              onClick={dismiss}
              className="absolute top-3 right-3 w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                <span className="text-2xl">🏃</span>
              </div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-foreground text-sm mb-1">Install MaceyRunners</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  Add MaceyRunners to your home screen for the best experience — fast access, notifications, and offline support!
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-xl p-3">
                  <span className="shrink-0">1. Tap</span>
                  <Share className="h-4 w-4 text-primary shrink-0" />
                  <span className="shrink-0">then tap</span>
                  <span className="flex items-center gap-1 font-semibold text-foreground">
                    <Plus className="h-3.5 w-3.5" /> Add to Home Screen
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={dismiss}
              className="w-full mt-3 text-xs"
            >
              Maybe later
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IOSInstallPrompt;
