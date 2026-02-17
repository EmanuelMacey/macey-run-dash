import { motion } from "framer-motion";
import { ShoppingCart, Pill, FileText, ShoppingBag, MoreHorizontal, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const errandServices = [
  {
    icon: ShoppingCart,
    title: "Grocery Shopping",
    description: "We'll pick up your groceries from any store and deliver them fresh to your doorstep.",
    gradient: "from-primary to-primary/80",
  },
  {
    icon: Pill,
    title: "Pharmacy Pick-Up",
    description: "Get your prescriptions and pharmacy items collected and delivered safely to you.",
    gradient: "from-accent to-accent/80",
  },
  {
    icon: FileText,
    title: "Document Courier",
    description: "Fast and secure document delivery — contracts, forms, letters, and more.",
    gradient: "from-primary to-accent/80",
  },
  {
    icon: ShoppingBag,
    title: "Retail Shopping",
    description: "Need something from a store? We'll shop for you and bring it right to your door.",
    gradient: "from-accent to-primary/80",
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-24 mesh-bg relative">
      <div className="particle w-3 h-3 bg-primary/15 top-12 right-[15%]" style={{ animationDelay: '1s' }} />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="font-display font-bold text-3xl md:text-5xl text-foreground mb-4">Our Errand Services</h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">Let our runners handle your errands — fast and hassle-free.</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {errandServices.map((service, i) => (
            <motion.div key={service.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="bg-card/90 backdrop-blur-sm rounded-3xl p-6 border border-border/50 hover:border-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/5 group gradient-border">
              <div className={`w-12 h-12 bg-gradient-to-br ${service.gradient} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg`}>
                <service.icon size={22} className="text-primary-foreground" />
              </div>
              <h3 className="font-display font-semibold text-lg text-card-foreground mb-2">{service.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{service.description}</p>
            </motion.div>
          ))}
        </div>

        {/* And many more */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 }}
          className="text-center mt-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-5 py-2.5 mb-6">
            <MoreHorizontal size={18} className="text-primary" />
            <span className="text-sm text-primary font-semibold">And many more errands we can handle for you!</span>
          </div>
          <div className="block">
            <Link to="/signup">
              <Button className="gradient-primary text-primary-foreground rounded-full px-8 shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-105 transition-all">
                Get Started <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;
