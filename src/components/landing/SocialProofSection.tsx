import { motion } from "framer-motion";
import { Zap, Shield, Heart } from "lucide-react";

const values = [
  { icon: Zap, title: "Lightning Fast", description: "Average delivery in under 30 minutes across Georgetown" },
  { icon: Shield, title: "Trusted & Insured", description: "Every package is handled with care and fully insured" },
  { icon: Heart, title: "Community First", description: "Empowering youth and building opportunities in Guyana" },
];

const SocialProofSection = () => {
  return (
    <section className="py-20 mesh-bg-dark relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-2xl md:text-3xl font-bold text-center gradient-text mb-12"
        >
          Why Guyana Trusts MaceyRunners
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center group"
            >
              <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary/20 group-hover:scale-110 transition-transform">
                <v.icon size={24} className="text-primary-foreground" />
              </div>
              <h3 className="font-display font-bold text-lg text-foreground mb-2">{v.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{v.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProofSection;
