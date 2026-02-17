import { motion } from "framer-motion";
import { MapPin, Package, Truck } from "lucide-react";

const steps = [
  { icon: MapPin, title: "Place Your Order", description: "Choose a delivery or errand, add your details, and select your payment method." },
  { icon: Package, title: "Runner Accepts", description: "A nearby runner picks up your order and heads to your location." },
  { icon: Truck, title: "Track & Receive", description: "Follow your runner live on the map and get notified when they arrive." },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 mesh-bg-dark relative overflow-hidden">
      <div className="particle w-2 h-2 bg-primary/30 top-16 left-[20%]" style={{ animationDelay: '2s' }} />
      <div className="particle w-3 h-3 bg-accent/20 bottom-20 right-[15%]" style={{ animationDelay: '4s' }} />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="font-display font-bold text-3xl md:text-5xl text-foreground mb-4">How It Works</h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">Three simple steps to get anything delivered.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <motion.div key={step.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="text-center group">
              <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-xl shadow-primary/20">
                <step.icon size={28} className="text-primary-foreground" />
              </div>
              <div className="inline-block px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold mb-3 border border-primary/20">Step {i + 1}</div>
              <h3 className="font-display font-semibold text-xl text-foreground mb-3">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
