import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Delivery",
    price: "$1,000",
    currency: "GYD",
    description: "Food, groceries, and package delivery",
    features: ["Real-time tracking", "Live driver updates", "Pay with card or cash", "Order notifications", "Chat with your runner"],
    featured: false,
  },
  {
    name: "Errand",
    price: "$1,500",
    currency: "GYD",
    description: "Let us handle your errands",
    features: ["Everything in Delivery", "Upload errand images", "Custom task instructions", "Priority assignment", "Receipt confirmation"],
    featured: true,
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-24 mesh-bg relative">
      <div className="particle w-2 h-2 bg-accent/20 top-20 left-[25%]" style={{ animationDelay: '3s' }} />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="font-display font-bold text-3xl md:text-5xl text-foreground mb-4">Simple Pricing</h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">No hidden fees. Just flat rates you can count on.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
              className={`rounded-3xl p-8 border backdrop-blur-sm transition-all hover:shadow-xl ${
                plan.featured 
                  ? "bg-secondary/95 border-primary/30 text-secondary-foreground shadow-2xl shadow-primary/10 scale-[1.02] gradient-border" 
                  : "bg-card/90 border-border/50 text-card-foreground"
              }`}>
              {plan.featured && (
                <div className="inline-block gradient-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full mb-4 shadow-md">Popular</div>
              )}
              <h3 className="font-display font-semibold text-xl mb-2">{plan.name}</h3>
              <p className={`text-sm mb-6 ${plan.featured ? "text-secondary-foreground/60" : "text-muted-foreground"}`}>{plan.description}</p>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="font-display font-bold text-4xl">{plan.price}</span>
                <span className={`text-sm ${plan.featured ? "text-secondary-foreground/50" : "text-muted-foreground"}`}>{plan.currency}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full gradient-primary flex items-center justify-center shrink-0 shadow-sm">
                      <Check size={12} className="text-primary-foreground" />
                    </div>
                    <span className={plan.featured ? "text-secondary-foreground/80" : "text-muted-foreground"}>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link to="/signup">
                <Button className={`w-full rounded-full h-11 font-semibold ${plan.featured ? "gradient-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-primary hover:bg-primary/90 text-primary-foreground"}`}>
                  Get Started
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
