import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useServiceStatus } from "@/hooks/useServiceStatus";
import flyer from "@/assets/closure-flyer.jpeg.asset.json";

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
        className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-background/95 backdrop-blur-xl overflow-y-auto"
      >
        <motion.img
          initial={{ scale: 0.94, y: 16 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
          src={flyer.url}
          alt="MaceyRunners temporary closure — effective June 8th, 2026 until further notice"
          className="w-full max-w-md rounded-3xl shadow-2xl"
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default MaintenanceClosureBanner;
