import { motion } from "framer-motion";
import { Phone, Mail, MessageCircle } from "lucide-react";

const contacts = [
  {
    icon: Phone,
    title: "Call Us",
    detail: "+592 721 9769",
    href: "tel:+5927219769",
    color: "from-primary to-primary/80",
  },
  {
    icon: Mail,
    title: "Email",
    detail: "support@maceyrunners.org",
    href: "mailto:support@maceyrunners.org",
    color: "from-accent to-accent/80",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    detail: "+592 721 9769",
    href: "https://wa.me/5927219769",
    color: "from-primary to-accent/80",
  },
];

const ContactSection = () => {
  return (
    <section id="contact" className="py-28 mesh-bg relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
            CONTACT
          </div>
          <h2 className="font-display font-bold text-3xl md:text-5xl text-foreground mb-4">
            Get in touch
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Have questions? We're always here to help.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto grid sm:grid-cols-3 gap-6">
          {contacts.map((c, i) => (
            <motion.a
              key={c.title}
              href={c.href}
              target={c.title === "WhatsApp" ? "_blank" : undefined}
              rel={c.title === "WhatsApp" ? "noopener noreferrer" : undefined}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group flex flex-col items-center gap-4 bg-card/80 backdrop-blur-sm border border-border/50 rounded-3xl p-8 hover:border-primary/40 hover:shadow-xl transition-all duration-300 text-center"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${c.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                <c.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-display font-bold text-foreground mb-1">{c.title}</h3>
                <p className="text-sm text-muted-foreground">{c.detail}</p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
