import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import maceyLogo from "@/assets/maceyrunners-logo.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16 hero-section">
      {/* Speed lines */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: '-100%', opacity: [0, 0.4, 0] }}
          transition={{ duration: 1.5, delay: 0.5 + i * 0.15, ease: 'easeOut' }}
          className="absolute h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent"
          style={{
            top: `${20 + i * 8}%`,
            width: `${30 + Math.random() * 40}%`,
          }}
        />
      ))}

      {/* Animated orbs */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.12, 0.22, 0.12] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute top-10 -left-32 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px]" 
      />
      <motion.div 
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.08, 0.18, 0.08] }}
        transition={{ duration: 8, repeat: Infinity, delay: 1 }}
        className="absolute bottom-10 -right-32 w-[500px] h-[500px] bg-accent/15 rounded-full blur-[130px]" 
      />

      {/* Orange diagonal stripe */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[200%] h-16 bg-gradient-to-r from-accent/30 via-accent/50 to-accent/20 transform rotate-[-15deg] translate-y-[30vh] -translate-x-[20%] blur-[2px]" />
        <div className="absolute top-0 right-0 w-[200%] h-[2px] bg-accent/60 transform rotate-[-15deg] translate-y-[30vh] -translate-x-[20%]" />
      </div>

      {/* Sparkle stars */}
      {[
        { top: '15%', left: '10%', delay: 0, size: 'w-1 h-1' },
        { top: '25%', right: '15%', delay: 1.5, size: 'w-1.5 h-1.5' },
        { top: '55%', left: '75%', delay: 3, size: 'w-1 h-1' },
        { top: '70%', left: '20%', delay: 4.5, size: 'w-2 h-2' },
        { top: '35%', right: '8%', delay: 2, size: 'w-1 h-1' },
        { top: '80%', right: '30%', delay: 5, size: 'w-1.5 h-1.5' },
      ].map((sparkle, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, delay: sparkle.delay }}
          className={`absolute ${sparkle.size} bg-accent rounded-full`}
          style={{ top: sparkle.top, left: sparkle.left, right: sparkle.right }}
        />
      ))}

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          
          {/* Small bouncing logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex justify-center mb-6"
          >
            <motion.img
              src={maceyLogo}
              alt="MaceyRunners Logo"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-20 h-20 md:w-28 md:h-28 object-contain drop-shadow-2xl"
              style={{ filter: 'drop-shadow(0 0 20px hsl(25, 95%, 53%, 0.4))' }}
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 3 }}>
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-5 py-2 mb-6 backdrop-blur-sm">
              <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
                <Star size={14} className="text-accent fill-accent" />
              </motion.div>
              <span className="text-sm text-primary font-semibold">Fast & Reliable Delivery in Guyana</span>
            </div>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 3.1 }}
            className="font-display font-bold text-3xl sm:text-4xl md:text-6xl leading-tight mb-6 text-foreground">
            Anything delivered.{" "}
            <span className="gradient-text">Anytime.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 3.2 }}
            className="text-lg md:text-xl mb-10 max-w-xl mx-auto text-muted-foreground">
            From food deliveries to errands — MaceyRunners gets it done fast across Georgetown and beyond.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 3.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="gradient-primary text-primary-foreground rounded-full px-8 text-base h-13 w-full sm:w-auto shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:scale-105 transition-all">
                Place an Order <ArrowRight size={18} className="ml-1" />
              </Button>
            </Link>
            <Link to="/signup?role=driver">
              <Button size="lg" variant="outline" className="border-primary/30 text-primary-foreground hover:bg-primary/10 rounded-full px-8 text-base h-13 w-full sm:w-auto backdrop-blur-sm">
                Become a Runner
              </Button>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 3.5 }}
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
                <div className="text-xs mt-1 text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
