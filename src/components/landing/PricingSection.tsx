import { motion } from "framer-motion";
import { Check, Sparkles, TrendingUp, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const PricingSection = () => {
  const { t } = useTranslation();

  const plans = [
    {
      name: t('pricing.delivery.name'),
      price: t('pricing.delivery.price'),
      currency: "GYD",
      description: t('pricing.delivery.desc'),
      features: [t('pricing.feature.tracking'), t('pricing.feature.updates'), t('pricing.feature.payment'), t('pricing.feature.notifications'), t('pricing.feature.chat')],
      featured: false,
      note: t('pricing.delivery.note'),
      badge: null,
      icon: MapPin,
    },
    {
      name: t('pricing.errand.name'),
      price: t('pricing.errand.price'),
      currency: "GYD",
      description: t('pricing.errand.desc'),
      features: [t('pricing.feature.everything'), t('pricing.feature.images'), t('pricing.feature.instructions'), t('pricing.feature.notifications'), t('pricing.feature.chat')],
      featured: true,
      note: t('pricing.errand.note'),
      badge: t('pricing.mostPopular'),
      icon: Clock,
    },
    {
      name: t('pricing.premium.name'),
      price: t('pricing.premium.price'),
      currency: "GYD",
      description: t('pricing.premium.desc'),
      features: [t('pricing.feature.everything'), t('pricing.feature.images'), t('pricing.feature.instructions'), t('pricing.feature.priority'), t('pricing.feature.receipt')],
      featured: false,
      note: t('pricing.premium.note'),
      badge: null,
      icon: Sparkles,
    },
  ];

  return (
    <section id="pricing" className="py-28 mesh-bg-dark relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-4">{t('pricing.badge')}</div>
          <h2 className="font-display font-bold text-3xl md:text-5xl text-foreground mb-4">{t('pricing.title')}</h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">{t('pricing.subtitle')}</p>
        </motion.div>

        {/* Pricing type explainer */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 max-w-2xl mx-auto">
          <div className="flex-1 rounded-2xl border border-accent/20 bg-accent/5 p-4 text-center">
            <MapPin className="h-5 w-5 text-accent mx-auto mb-2" />
            <p className="text-sm font-bold text-foreground">Delivery = Distance-Based</p>
            <p className="text-xs text-muted-foreground mt-1">Price varies by pickup & dropoff distance</p>
          </div>
          <div className="flex-1 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-center">
            <Clock className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="text-sm font-bold text-foreground">Errands = Fixed Rate</p>
            <p className="text-xs text-muted-foreground mt-1">Same price regardless of distance</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
              className={`relative rounded-3xl p-7 border backdrop-blur-sm transition-all duration-300 hover:shadow-2xl overflow-hidden ${plan.featured ? "bg-gradient-to-br from-primary/5 via-card to-accent/5 border-primary/30 shadow-xl scale-[1.03]" : "bg-card/90 border-border/50"}`}>
              {plan.badge && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />
                  <div className="relative inline-flex items-center gap-1.5 gradient-primary text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-full mb-4 shadow-lg">
                    <Sparkles size={12} /> {plan.badge}
                  </div>
                </>
              )}
              <div className="relative">
                <h3 className="font-display font-bold text-xl text-foreground mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-5">{plan.description}</p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="font-display font-extrabold text-4xl text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground ml-1">{plan.currency}</span>
                </div>
                <div className="flex items-center gap-1.5 mb-7">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs text-muted-foreground">{plan.note}</span>
                </div>
                <ul className="space-y-3 mb-7">
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
                  <Button className={`w-full rounded-full h-12 font-semibold text-base ${plan.featured ? "gradient-primary text-primary-foreground shadow-xl shadow-primary/20 hover:shadow-2xl hover:scale-[1.02] transition-all" : "bg-primary hover:bg-primary/90 text-primary-foreground"}`}>
                    {t('common.getStarted')}
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Service fee note */}
        <p className="text-center text-xs text-muted-foreground mt-8">+ $100 GYD service fee applies to all orders</p>
      </div>
    </section>
  );
};

export default PricingSection;
