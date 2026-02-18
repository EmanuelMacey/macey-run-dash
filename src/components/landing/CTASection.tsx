import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Full gradient background */}
      <div className="absolute inset-0 gradient-primary opacity-95" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.08),transparent_50%)]" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-5 py-2 mb-8 backdrop-blur-sm"
          >
            <Sparkles size={14} className="text-white" />
            <span className="text-sm text-white font-semibold">Join the Movement</span>
          </motion.div>

          <h2 className="font-display font-extrabold text-3xl md:text-5xl lg:text-6xl text-white mb-6 leading-tight">
            Ready to experience<br />
            <span className="opacity-90">the fastest delivery?</span>
          </h2>
          <p className="text-white/80 text-lg mb-12 max-w-lg mx-auto">
            Join hundreds of customers across Guyana who trust MaceyRunners for fast, reliable delivery every day.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 rounded-full px-10 text-base h-14 w-full sm:w-auto shadow-2xl font-bold hover:scale-105 transition-all"
              >
                Start Ordering <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
            <Link to="/signup?role=driver">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white/40 text-white hover:bg-white/10 rounded-full px-10 text-base h-14 w-full sm:w-auto font-bold"
              >
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
