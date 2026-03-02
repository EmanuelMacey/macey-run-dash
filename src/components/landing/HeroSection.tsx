import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Shield, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import maceyLogo from "@/assets/maceyrunners-logo.png";
import deliveryRider from "@/assets/delivery-rider.png";

const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20 pb-10 hero-section">
      {/* Animated gradient orbs */}
      <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.25, 0.15] }} transition={{ duration: 8, repeat: Infinity }} className="absolute -top-40 -left-40 w-[700px] h-[700px] bg-primary/20 rounded-full blur-[180px]" />
      <motion.div animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 10, repeat: Infinity, delay: 2 }} className="absolute -bottom-20 -right-40 w-[600px] h-[600px] bg-accent/15 rounded-full blur-[160px]" />
      <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.15, 0.08] }} transition={{ duration: 7, repeat: Infinity, delay: 1 }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px]" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[200%] h-24 bg-gradient-to-r from-accent/20 via-accent/40 to-accent/10 transform rotate-[-12deg] translate-y-[35vh] -translate-x-[20%] blur-[3px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="text-center md:text-left">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-5 py-2 mb-8 backdrop-blur-sm">
                <Zap size={14} className="text-accent fill-accent" />
                <span className="text-sm text-primary font-semibold">{t('hero.badge')}</span>
              </div>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }} className="font-display font-extrabold text-4xl sm:text-5xl md:text-4xl lg:text-6xl xl:text-7xl leading-[1.1] mb-6 text-foreground">
              {t('hero.title1')}<br />{t('hero.title2')}{" "}
              <span className="gradient-text relative">
                {t('hero.title3')}
                <motion.span className="absolute -bottom-2 left-0 w-full h-1 bg-accent rounded-full" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1, duration: 0.6 }} style={{ originX: 0 }} />
              </span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="text-lg md:text-xl mb-10 max-w-lg mx-auto md:mx-0 text-muted-foreground leading-relaxed">
              {t('hero.subtitle')}
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }} className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link to="/signup">
                <Button size="lg" className="gradient-primary text-primary-foreground rounded-full px-10 text-base h-14 w-full sm:w-auto shadow-2xl shadow-primary/25 hover:shadow-3xl hover:shadow-primary/40 hover:scale-105 transition-all font-semibold">
                  {t('hero.placeOrder')} <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
              <Link to="/signup?role=driver">
                <Button size="lg" variant="outline" className="border-2 border-primary/30 text-foreground hover:bg-primary/10 hover:border-primary/50 rounded-full px-10 text-base h-14 w-full sm:w-auto backdrop-blur-sm font-semibold">
                  {t('hero.becomeRunner')}
                </Button>
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.65 }} className="flex items-center gap-4 md:gap-6 mt-12 justify-center md:justify-start flex-wrap">
              {[
                { icon: Clock, text: t('hero.avgDelivery') },
                { icon: Shield, text: t('hero.safe') },
                { icon: Zap, text: t('hero.tracking') },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2">
                  <item.icon size={16} className="text-primary" />
                  <span className="text-xs text-muted-foreground font-medium">{item.text}</span>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.9, x: 40 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="relative hidden md:flex justify-center items-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-transparent rounded-full blur-[100px]" />
            <div className="relative z-10">
              <motion.img src={deliveryRider} alt="MaceyRunners Delivery" animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="w-[260px] lg:w-[340px] h-auto object-contain drop-shadow-2xl" style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.15))" }} />
              <motion.div animate={{ opacity: [0.15, 0.35, 0.15], x: [-8, 8, -8], scaleX: [1, 1.15, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[70%] h-8 bg-gradient-to-r from-transparent via-muted-foreground/15 to-transparent rounded-full blur-xl" />
              <motion.div animate={{ opacity: [0.1, 0.25, 0.1], x: [5, -5, 5] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="absolute bottom-6 left-[30%] w-[40%] h-6 bg-gradient-to-r from-transparent via-accent/10 to-transparent rounded-full blur-lg" />
            </div>

            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="absolute top-8 -left-4 bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl px-5 py-3 shadow-xl z-20">
              <p className="font-display font-bold text-2xl gradient-text">500+</p>
              <p className="text-[11px] text-muted-foreground">{t('hero.deliveriesDone')}</p>
            </motion.div>

            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-16 -right-4 bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl px-5 py-3 shadow-xl z-20">
              <p className="font-display font-bold text-2xl gradient-text">4.9★</p>
              <p className="text-[11px] text-muted-foreground">{t('hero.rating')}</p>
            </motion.div>

            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }} className="absolute bottom-4 left-8 bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl px-5 py-3 shadow-xl z-20">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <p className="text-xs font-semibold text-foreground">{t('hero.runnersOnline')}</p>
              </div>
            </motion.div>

            <motion.img src={maceyLogo} alt="" animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute top-0 right-8 w-16 h-16 opacity-30" />
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.8 }} className="grid grid-cols-3 gap-6 mt-16 max-w-sm mx-auto md:hidden">
          {[
            { value: "15min", label: t('hero.avgLabel') },
            { value: "500+", label: t('hero.deliveries') },
            { value: "4.9★", label: t('hero.rating') },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display font-bold text-xl gradient-text">{stat.value}</div>
              <div className="text-[10px] mt-1 text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
