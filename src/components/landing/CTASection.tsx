import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-24 mesh-bg-dark relative overflow-hidden">
      <motion.div 
        animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.15, 0.08] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-primary/15 rounded-full blur-[150px]" 
      />
      <div className="particle w-2 h-2 bg-accent/30 top-10 left-[20%]" style={{ animationDelay: '1s' }} />
      <div className="particle w-1.5 h-1.5 bg-primary/30 bottom-16 right-[25%]" style={{ animationDelay: '3s' }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm">
            <Sparkles size={14} className="text-primary animate-pulse" />
            <span className="text-sm text-primary font-semibold">Join the Movement</span>
          </div>
          <h2 className="font-display font-bold text-3xl md:text-5xl text-secondary-foreground mb-6">Ready to get started?</h2>
          <p className="text-secondary-foreground/60 text-lg mb-10">Join hundreds of customers across Guyana who trust MaceyRunners for fast, reliable delivery.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="gradient-primary text-primary-foreground rounded-full px-8 text-base h-12 w-full sm:w-auto shadow-xl shadow-primary/20 hover:shadow-2xl hover:scale-105 transition-all">
                Start Ordering <ArrowRight size={18} className="ml-1" />
              </Button>
            </Link>
            <Link to="/signup?role=driver">
              <Button size="lg" variant="outline" className="border-secondary-foreground/20 text-secondary-foreground hover:bg-secondary-foreground/5 rounded-full px-8 text-base h-12 w-full sm:w-auto">
                Join as a Runner
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
