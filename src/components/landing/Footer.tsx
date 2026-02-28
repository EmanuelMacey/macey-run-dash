import { useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import logo from "@/assets/logo.png";

const policies = [
  { title: "Delivery Times", content: "MaceyRunners aims to complete all deliveries within 15–45 minutes depending on distance and order complexity. Estimated delivery times are provided at checkout but are not guaranteed. Delays caused by weather, traffic, or unforeseen circumstances will be communicated to the customer as promptly as possible. MaceyRunners shall not be held liable for delays beyond our reasonable control." },
  { title: "Payment Policy", content: "MaceyRunners accepts Cash on Delivery (COD) and MMG mobile payments. For COD orders, full payment is due upon delivery to the assigned runner. For MMG payments, customers must complete the transaction via WhatsApp (+592 721 9769) prior to or at the time of delivery. MaceyRunners reserves the right to cancel orders where payment cannot be verified. All prices are listed in Guyanese Dollars (GYD) and include applicable service fees unless otherwise stated." },
  { title: "Cancellation & Refund Policy", content: "Orders may be cancelled free of charge at any time before a runner accepts the order. Once a runner has been assigned, a cancellation fee of up to 50% of the order total may apply to cover preparation and transit costs. Refund requests must be submitted within 24 hours of delivery by contacting support@maceyrunners.org. Refunds are issued at MaceyRunners' sole discretion and may take 3–5 business days to process." },
  { title: "Privacy & Data Protection", content: "MaceyRunners collects and processes personal information (including name, phone number, email, and delivery address) solely for the purpose of fulfilling orders and improving our services. We do not sell, rent, or share your personal data with third parties except as required to complete your delivery or as mandated by law. All data is stored securely using industry-standard encryption. By using our services, you consent to the collection and use of your information in accordance with this policy." },
  { title: "Limitation of Liability", content: "MaceyRunners acts as a delivery and errand service provider. We are not responsible for the quality, safety, or accuracy of items purchased from third-party stores or restaurants. Our liability is limited to the delivery service fee paid. MaceyRunners shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services." },
  { title: "Terms of Use", content: "By creating an account or placing an order with MaceyRunners, you agree to abide by these policies and any additional terms communicated through our platform. MaceyRunners reserves the right to modify these policies at any time. Continued use of our services after changes constitutes acceptance of the revised terms. For questions or concerns, contact us at support@maceyrunners.org or +592 721 9769." },
];

const Footer = () => {
  const [showPolicies, setShowPolicies] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const { t } = useTranslation();

  return (
    <>
      <footer className="bg-secondary dark:bg-secondary border-t border-border/20 py-16 safe-bottom safe-x">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-10 items-start mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <img src={logo} alt="MaceyRunners" className="w-10 h-10 rounded-xl object-cover shadow-sm ring-1 ring-primary/20" />
                <span className="font-display font-bold text-xl text-secondary-foreground">MaceyRunners</span>
              </div>
              <p className="text-sm text-secondary-foreground/60 leading-relaxed max-w-xs">{t('footer.tagline')}</p>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="font-display font-semibold text-sm text-secondary-foreground mb-1">{t('footer.quickLinks')}</h4>
              <a href="#how-it-works" className="text-sm text-secondary-foreground/60 hover:text-primary transition-colors">{t('nav.howItWorks')}</a>
              <a href="#services" className="text-sm text-secondary-foreground/60 hover:text-primary transition-colors">{t('nav.services')}</a>
              <a href="#pricing" className="text-sm text-secondary-foreground/60 hover:text-primary transition-colors">{t('nav.pricing')}</a>
              <a href="#contact" className="text-sm text-secondary-foreground/60 hover:text-primary transition-colors">{t('footer.contact')}</a>
              <Link to="/about" className="text-sm text-secondary-foreground/60 hover:text-primary transition-colors">{t('footer.aboutUs')}</Link>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="font-display font-semibold text-sm text-secondary-foreground mb-1">{t('footer.legal')}</h4>
              <button onClick={() => setShowPolicies(true)} className="text-sm text-secondary-foreground/60 hover:text-primary transition-colors text-left">{t('footer.policies')}</button>
              <Link to="/our-values" className="text-sm text-secondary-foreground/60 hover:text-primary transition-colors">Our Values & Standards</Link>
              <Link to="/login" className="text-sm text-secondary-foreground/60 hover:text-primary transition-colors">{t('nav.login')}</Link>
              <Link to="/signup" className="text-sm text-secondary-foreground/60 hover:text-primary transition-colors">{t('nav.getStarted')}</Link>
            </div>
          </div>

          <div className="border-t border-secondary-foreground/10 pt-6 space-y-2">
            <p className="text-xs text-secondary-foreground/50 text-center">
              464 East Ruimveldt, Georgetown, Guyana
            </p>
            <p className="text-xs text-secondary-foreground/40 text-center">
              {t('footer.copyright', { year: new Date().getFullYear() })}
            </p>
          </div>
        </div>
      </footer>

      <Dialog open={showPolicies} onOpenChange={setShowPolicies}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{t('footer.policies')}</DialogTitle>
            <DialogDescription>Please review our policies below. By using MaceyRunners, you agree to these terms.</DialogDescription>
          </DialogHeader>
          <div className="divide-y divide-border border border-border rounded-2xl overflow-hidden bg-card">
            {policies.map((policy, i) => (
              <div key={policy.title}>
                <button onClick={() => setExpandedIndex(expandedIndex === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/50 transition-colors">
                  <span className="text-sm font-semibold text-foreground">{policy.title}</span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${expandedIndex === i ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {expandedIndex === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <p className="px-5 pb-4 text-xs leading-relaxed text-muted-foreground">{policy.content}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
          <p className="text-center text-[10px] text-muted-foreground/60 mt-2">
            Last updated: February 2026. For questions, contact support@maceyrunners.org.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Footer;
