import { motion } from "framer-motion";
import { ShoppingCart, Pill, FileText, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ServicesSection = () => {
  const { t } = useTranslation();

  const errandServices = [
    { icon: ShoppingCart, title: t('services.grocery.title'), description: t('services.grocery.desc'), emoji: "🛒" },
    { icon: Pill, title: t('services.pharmacy.title'), description: t('services.pharmacy.desc'), emoji: "💊" },
    { icon: FileText, title: t('services.document.title'), description: t('services.document.desc'), emoji: "📄" },
    { icon: ShoppingBag, title: t('services.retail.title'), description: t('services.retail.desc'), emoji: "🛍️" },
  ];

  return (
    <section id="services" className="py-28 mesh-bg relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20">
          <div className="inline-block px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-4">{t('services.badge')}</div>
          <h2 className="font-display font-bold text-3xl md:text-5xl text-foreground mb-4">{t('services.title')}</h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">{t('services.subtitle')}</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {errandServices.map((service, i) => (
            <motion.div key={service.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="group relative bg-card/80 backdrop-blur-sm rounded-3xl p-8 border border-border/50 hover:border-primary/40 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-start gap-5">
                  <div className="text-4xl shrink-0">{service.emoji}</div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">{service.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{service.description}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="text-center mt-14">
          <Link to="/signup">
            <Button className="gradient-primary text-primary-foreground rounded-full px-10 h-12 shadow-xl shadow-primary/20 hover:shadow-2xl hover:scale-105 transition-all font-semibold">
              {t('common.getStarted')} <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;
