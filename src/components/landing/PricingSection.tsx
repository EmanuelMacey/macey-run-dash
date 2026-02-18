import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
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
    <section id="pricing" className="py-28 mesh-bg-dark relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-4">
            PRICING
          </div>
          <h2 className="font-display font-bold text-3xl md:text-5xl text-foreground mb-4">
            Transparent pricing
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            No hidden fees. Flat rates you can count on.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className={`relative rounded-3xl p-8 border backdrop-blur-sm transition-all duration-300 hover:shadow-2xl overflow-hidden ${
                plan.featured
                  ? "bg-gradient-to-br from-primary/5 via-card to-accent/5 border-primary/30 shadow-xl"
                  : "bg-card/90 border-border/50"
              }`}
            >
              {plan.featured && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />
                  <div className="relative inline-flex items-center gap-1.5 gradient-primary text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-full mb-5 shadow-lg">
                    <Sparkles size={12} />
                    Most Popular
                  </div>
                </>
              )}
              <div className="relative">
                <h3 className="font-display font-bold text-xl text-foreground mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="font-display font-extrabold text-5xl text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground ml-1">{plan.currency}</span>
                </div>
                <ul className="space-y-3.5 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full gradient-primary flex items-center justify-center shrink-0 shadow-sm">
                        <Check size={12} className="text-primary-foreground" />
                      </div>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/signup">
                  <Button
                    className={`w-full rounded-full h-12 font-semibold text-base ${
                      plan.featured
                        ? "gradient-primary text-primary-foreground shadow-xl shadow-primary/20 hover:shadow-2xl hover:scale-[1.02] transition-all"
                        : "bg-primary hover:bg-primary/90 text-primary-foreground"
                    }`}
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
