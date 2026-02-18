import { motion } from "framer-motion";
import { Truck, Clock, Shield, CreditCard, MessageCircle, MapPin } from "lucide-react";

const features = [
  { icon: Truck, label: "Same-Day Delivery" },
  { icon: Clock, label: "15 Min Average" },
  { icon: Shield, label: "Insured Packages" },
  { icon: CreditCard, label: "Cash or Card" },
  { icon: MessageCircle, label: "Live Chat Support" },
  { icon: MapPin, label: "Real-Time Tracking" },
];

const TrustMarquee = () => {
  const doubled = [...features, ...features];

  return (
    <section className="py-5 border-y border-border/30 bg-muted/30 dark:bg-secondary/30 overflow-hidden">
      <div className="relative">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="flex items-center gap-12 w-max"
        >
          {doubled.map((f, i) => (
            <div key={i} className="flex items-center gap-2.5 shrink-0">
              <f.icon size={16} className="text-primary" />
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">{f.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TrustMarquee;
