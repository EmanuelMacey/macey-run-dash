import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center bg-secondary overflow-hidden pt-16">
      {/* Animated blobs */}
      <div className="absolute top-20 -left-32 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-20 -right-32 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[80px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
            <img src={logo} alt="MaceyRunners" className="w-20 h-20 rounded-2xl mx-auto mb-6 shadow-2xl float-animation" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm">
              <Zap size={14} className="text-primary" />
              <span className="text-sm text-primary font-semibold">Fast & Reliable Delivery in Guyana</span>
            </div>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
            className="font-display font-bold text-4xl sm:text-5xl md:text-7xl text-secondary-foreground leading-tight mb-6">
            Anything delivered.{" "}
            <span className="gradient-text">Anytime.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}
            className="text-lg md:text-xl text-secondary-foreground/60 mb-10 max-w-xl mx-auto">
            From food deliveries to errands — MaceyRunners gets it done fast across Georgetown and beyond.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}
            className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="gradient-primary text-primary-foreground rounded-full px-8 text-base h-12 w-full sm:w-auto shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                Place an Order <ArrowRight size={18} className="ml-1" />
              </Button>
            </Link>
            <Link to="/signup?role=driver">
              <Button size="lg" variant="outline" className="border-secondary-foreground/20 text-secondary-foreground hover:bg-secondary-foreground/5 rounded-full px-8 text-base h-12 w-full sm:w-auto backdrop-blur-sm">
                Become a Runner
              </Button>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}
            className="grid grid-cols-3 gap-8 mt-20 max-w-md mx-auto">
            {[
              { value: "15min", label: "Avg. Delivery" },
              { value: "500+", label: "Deliveries" },
              { value: "4.9", label: "Rating", icon: <Star className="h-4 w-4 fill-current inline" /> },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display font-bold text-2xl md:text-3xl gradient-text">
                  {stat.value}{stat.icon}
                </div>
                <div className="text-xs text-secondary-foreground/50 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
