import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import maceyLogo from "@/assets/maceyrunners-logo.png";

const HeroSection = () => {
  const [showRider, setShowRider] = useState(false);
  const [showSmoke, setShowSmoke] = useState(false);
  const [showName, setShowName] = useState(false);
  const [riderExited, setRiderExited] = useState(false);

  useEffect(() => {
    const runCycle = () => {
      setShowRider(false);
      setShowSmoke(false);
      setShowName(false);
      setRiderExited(false);

      const t1 = setTimeout(() => setShowRider(true), 1000);
      const t2 = setTimeout(() => {
        setShowSmoke(true);
        setRiderExited(true);
      }, 5000);
      const t3 = setTimeout(() => setShowName(true), 6000);
      const t4 = setTimeout(() => setShowSmoke(false), 8000);
      // Restart cycle every ~15s for a relaxed pace
      const t5 = setTimeout(() => runCycle(), 15000);
      return [t1, t2, t3, t4, t5];
    };
    const timers = runCycle();
    return () => timers.forEach(clearTimeout);
  }, []);

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

      {/* Animated orbs matching business card navy */}
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

      {/* Orange diagonal stripe like business card */}
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
          
          {/* Rider Animation Area */}
          <div className="relative h-40 md:h-52 mb-6 flex items-center justify-center">
            {/* Smoke effect */}
            <AnimatePresence>
              {showSmoke && (
                <>
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={`smoke-${i}`}
                      initial={{ opacity: 0, scale: 0.3, x: 0, y: 0 }}
                      animate={{ 
                        opacity: [0, 0.6, 0],
                        scale: [0.3, 1.5 + Math.random()],
                        x: (Math.random() - 0.5) * 200,
                        y: (Math.random() - 0.5) * 100 - 20,
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.5 + Math.random(), delay: i * 0.08 }}
                      className="absolute rounded-full"
                      style={{
                        width: 30 + Math.random() * 50,
                        height: 30 + Math.random() * 50,
                        background: `radial-gradient(circle, hsl(25, 80%, 55%, 0.4), hsl(220, 30%, 40%, 0.2), transparent)`,
                        filter: 'blur(8px)',
                      }}
                    />
                  ))}
                </>
              )}
            </AnimatePresence>

            {/* Rider - flashes in then zooms out */}
            <AnimatePresence>
              {showRider && !riderExited && (
                <motion.img
                  src={maceyLogo}
                  alt="MaceyRunners Logo"
                  initial={{ opacity: 0, scale: 0.1, x: 200 }}
                  animate={{ 
                    opacity: [0, 1, 1, 1],
                    scale: [0.1, 1.1, 1, 1],
                    x: [200, -20, 0, 0],
                  }}
                  exit={{ 
                    opacity: 0,
                    scale: 1.5,
                    x: -300,
                    transition: { duration: 0.5, ease: 'easeIn' }
                  }}
                  transition={{ duration: 2, ease: 'easeOut' }}
                  className="absolute w-36 h-36 md:w-48 md:h-48 object-contain drop-shadow-2xl z-10"
                  style={{ filter: 'drop-shadow(0 0 30px hsl(25, 95%, 53%, 0.5))' }}
                />
              )}
            </AnimatePresence>

            {/* MaceyRunners name pops in after rider exits */}
            <AnimatePresence>
              {showName && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="relative z-20"
                >
                  <motion.h2 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="font-display font-bold text-5xl sm:text-6xl md:text-8xl"
                    style={{
                      color: 'hsl(0, 0%, 100%)',
                      textShadow: '0 0 30px hsl(217, 91%, 50%, 0.5), 0 4px 20px hsl(25, 95%, 53%, 0.3)',
                    }}
                  >
                    MaceyRunners
                  </motion.h2>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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
