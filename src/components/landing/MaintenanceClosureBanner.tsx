import { useEffect } from "react";
import { Calendar, Mail, MessageCircle, Wrench } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CLOSURE_EMAIL, CLOSURE_WHATSAPP, CLOSURE_WHATSAPP_LINK } from "@/lib/closure";
import { useServiceStatus } from "@/hooks/useServiceStatus";
import logo from "@/assets/logo.png";

const MaintenanceClosureBanner = () => {
  const { isMaintenance: active } = useServiceStatus();

  useEffect(() => {
    document.body.style.overflow = active ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [active]);

  if (!active) return null;


  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-background/95 backdrop-blur-xl"
      >
        <motion.div
          initial={{ scale: 0.92, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
          className="relative w-full max-w-lg rounded-3xl bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto"
        >
          <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary-foreground/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-accent-foreground/10 blur-3xl" />

          <div className="relative p-8 sm:p-10 text-center">
            <div className="flex justify-center mb-5">
              <div className="relative">
                <img
                  src={logo}
                  alt="MaceyRunners"
                  className="h-16 w-16 rounded-2xl shadow-lg ring-2 ring-primary-foreground/30"
                />
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary-foreground text-primary shadow-md">
                  <Wrench className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider mb-4">
              <span className="h-2 w-2 rounded-full bg-primary-foreground animate-pulse" />
              Temporary Closure
            </span>

            <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight mb-3">
              Operations Temporarily Closed
            </h2>

            <div className="inline-flex items-center gap-2 rounded-2xl bg-primary-foreground/15 px-4 py-2 mb-4">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-semibold">
                Effective June 8th, 2026 — Until Further Notice
              </span>
            </div>

            <p className="text-sm sm:text-base opacity-95 leading-relaxed mb-6">
              We're temporarily pausing operations to prepare for new system
              upgrades and service improvements within the company. We sincerely
              apologize for any inconvenience this may cause and thank you for
              your continued patience and support.
            </p>

            <div className="space-y-2.5 text-left">
              <p className="text-xs uppercase tracking-wider text-primary-foreground/70 text-center mb-2">
                For urgent inquiries, contact us:
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
              Thank you for being part of the MaceyRunners family.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MaintenanceClosureBanner;
