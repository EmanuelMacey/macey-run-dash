import { useEffect } from "react";
import { Clock, Mail, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CLOSURE_EMAIL, CLOSURE_WHATSAPP, CLOSURE_WHATSAPP_LINK } from "@/lib/closure";
import { useServiceStatus } from "@/hooks/useServiceStatus";
import logo from "@/assets/logo.png";

const ClosureBanner = () => {
  const { isClosed, loading } = useServiceStatus();

  useEffect(() => {
    if (isClosed && !loading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isClosed, loading]);

  if (loading || !isClosed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/95 backdrop-blur-xl"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
          className="relative w-full max-w-lg rounded-3xl bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground shadow-2xl overflow-hidden"
        >
          <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary-foreground/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-accent-foreground/10 blur-3xl" />

          <div className="relative p-8 sm:p-10 text-center">
            <div className="flex justify-center mb-5">
              <div className="relative">
                <img src={logo} alt="MaceyRunners" className="h-16 w-16 rounded-2xl shadow-lg ring-2 ring-primary-foreground/30" />
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary-foreground text-primary shadow-md">
                  <Clock className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider mb-4">
              <span className="h-2 w-2 rounded-full bg-primary-foreground animate-pulse" />
              Temporarily Closed
            </span>

            <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight mb-3">
              We're on a short break
            </h2>

            <p className="text-sm sm:text-base opacity-95 leading-relaxed mb-6">
              MaceyRunners is paused between{" "}
              <span className="font-semibold">7:00 AM – 3:30 PM</span>.
              <br />
              Operations resume at <span className="font-semibold">3:30 PM</span>.
            </p>

            <div className="space-y-2.5 text-left">
              <p className="text-xs uppercase tracking-wider text-primary-foreground/70 text-center mb-2">
                Need us urgently? Reach out:
              </p>
              <a
                href={`mailto:${CLOSURE_EMAIL}`}
                className="flex items-center gap-3 rounded-2xl bg-primary-foreground/15 hover:bg-primary-foreground/25 transition px-4 py-3 group"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/20 group-hover:scale-105 transition">
                  <Mail className="h-5 w-5" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[11px] uppercase tracking-wider opacity-75">Email</span>
                  <span className="block text-sm font-semibold truncate">{CLOSURE_EMAIL}</span>
                </span>
              </a>
              <a
                href={CLOSURE_WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-2xl bg-primary-foreground/15 hover:bg-primary-foreground/25 transition px-4 py-3 group"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/20 group-hover:scale-105 transition">
                  <MessageCircle className="h-5 w-5" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[11px] uppercase tracking-wider opacity-75">WhatsApp</span>
                  <span className="block text-sm font-semibold">{CLOSURE_WHATSAPP}</span>
                </span>
              </a>
            </div>

            <p className="mt-6 text-[11px] opacity-70">
              Thank you for your patience — see you at 3:30 PM!
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ClosureBanner;
