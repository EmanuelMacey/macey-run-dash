import { Phone, Mail, MapPin } from "lucide-react";

const ContactSection = () => {
  return (
    <section id="contact" className="py-20 bg-muted/50 dark:bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
            Contact Us
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Have questions? Reach out to us anytime.
          </p>
        </div>

        <div className="max-w-2xl mx-auto grid sm:grid-cols-3 gap-6">
          <a
            href="tel:+5927219769"
            className="flex flex-col items-center gap-3 bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/50 transition-colors text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-display font-semibold text-foreground">Phone</h3>
            <p className="text-sm text-muted-foreground">+592 721 9769</p>
          </a>

          <a
            href="mailto:support@maceyrunners.org"
            className="flex flex-col items-center gap-3 bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/50 transition-colors text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-display font-semibold text-foreground">Email</h3>
            <p className="text-sm text-muted-foreground">support@maceyrunners.org</p>
          </a>

          <a
            href="https://wa.me/5927219769"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-3 bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/50 transition-colors text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-display font-semibold text-foreground">WhatsApp</h3>
            <p className="text-sm text-muted-foreground">+592 721 9769</p>
          </a>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground font-medium">MaceyRunners Delivery Service</p>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
