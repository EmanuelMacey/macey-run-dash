import { motion } from "framer-motion";
import { MapPin, Package, Truck, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: MapPin,
    title: "Place Your Order",
    description: "Choose a delivery or errand, add your details, and select your payment method.",
    color: "from-primary to-primary/80",
  },
  {
    icon: Package,
    title: "Runner Accepts",
    description: "A nearby runner picks up your order and heads to your location.",
    color: "from-accent to-accent/80",
  },
  {
    icon: Truck,
    title: "Track & Receive",
    description: "Follow your runner live on the map and get notified when they arrive.",
    color: "from-primary to-accent/80",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-28 mesh-bg-dark relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
            HOW IT WORKS
          </div>
          <h2 className="font-display font-bold text-3xl md:text-5xl text-foreground mb-4">
            Three simple steps
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            From order to doorstep in minutes.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-[52px] left-[16%] right-[16%] h-[2px] bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30" />

          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="relative text-center group"
            >
              {/* Step number circle */}
              <div className="relative mx-auto mb-8">
                <div
                  className={`w-[104px] h-[104px] bg-gradient-to-br ${step.color} rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-all duration-300 shadow-2xl`}
                  style={{
                    boxShadow: i === 0
                      ? "0 20px 40px -10px hsl(217, 91%, 50%, 0.3)"
                      : i === 1
                      ? "0 20px 40px -10px hsl(25, 95%, 53%, 0.3)"
                      : "0 20px 40px -10px hsl(217, 91%, 50%, 0.2)",
                  }}
                >
                  <step.icon size={40} className="text-primary-foreground" />
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 gradient-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold shadow-lg">
                  {i + 1}
                </div>
              </div>

              <h3 className="font-display font-bold text-xl text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>

              {/* Arrow between steps (desktop) */}
              {i < 2 && (
                <div className="hidden md:block absolute top-[52px] -right-3 z-10">
                  <ArrowRight size={20} className="text-primary/40" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
