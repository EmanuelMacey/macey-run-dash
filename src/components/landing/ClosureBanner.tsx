import { useEffect, useState } from "react";
import { Clock, Mail, MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const isWithinClosure = () => {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  return minutes >= 7 * 60 && minutes < 15 * 60 + 30;
};

const ClosureBanner = () => {
  const [closed, setClosed] = useState(isWithinClosure());
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setClosed(isWithinClosure()), 60_000);
    return () => clearInterval(interval);
  }, []);

  if (!closed || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed inset-x-0 top-0 z-[100] bg-gradient-to-r from-primary via-primary to-accent text-primary-foreground shadow-lg"
      >
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Clock className="h-5 w-5 shrink-0 animate-pulse" />
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-semibold leading-tight">
              Temporarily closed (7:00 AM – 3:30 PM). Operations resume at 3:30 PM.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-[11px] sm:text-xs opacity-95">
              <a href="mailto:maceyrunners@gmail.com" className="flex items-center gap-1 hover:underline">
                <Mail className="h-3 w-3" /> maceyrunners@gmail.com
              </a>
              <a href="https://wa.me/5927219769" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                <MessageCircle className="h-3 w-3" /> WhatsApp +592 721 9769
              </a>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 p-1 rounded-full hover:bg-primary-foreground/20 transition"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ClosureBanner;
