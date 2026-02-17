import { useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

  return (
    <>
      <footer className="bg-muted dark:bg-secondary border-t border-border/30 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <img src={logo} alt="MaceyRunners" className="w-8 h-8 rounded-lg object-cover" />
              <span className="font-display font-bold text-lg text-foreground">MaceyRunners</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
              <a href="#services" className="hover:text-primary transition-colors">Services</a>
              <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
              <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
              <button onClick={() => setShowPolicies(true)} className="hover:text-primary transition-colors">Policies</button>
              <Link to="/login" className="hover:text-primary transition-colors">Login</Link>
            </div>

            <p className="text-xs text-muted-foreground/60">
              © {new Date().getFullYear()} MaceyRunners. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <Dialog open={showPolicies} onOpenChange={setShowPolicies}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Policies & Terms</DialogTitle>
            <DialogDescription>Please review our policies below. By using MaceyRunners, you agree to these terms.</DialogDescription>
          </DialogHeader>
          <div className="divide-y divide-border border border-border rounded-2xl overflow-hidden bg-card">
            {policies.map((policy, i) => (
              <div key={policy.title}>
                <button
                  onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm font-semibold text-foreground">{policy.title}</span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${expandedIndex === i ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {expandedIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
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
