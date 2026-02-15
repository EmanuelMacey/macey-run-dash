import { motion } from "framer-motion";
import { ShoppingBag, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const services = [
  {
    icon: ShoppingBag,
    title: "Food & Package Delivery",
    description: "Get your food, groceries, or packages delivered straight to your door — fast and reliable.",
    price: "$1,000 GYD",
    color: "bg-primary/10",
  },
  {
    icon: ClipboardList,
    title: "Errands",
    description: "Need something done? Our runners will handle your errands — shopping, pickups, drop-offs, and more.",
    price: "$1,500 GYD",
    color: "bg-secondary/80",
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display font-bold text-3xl md:text-5xl text-foreground mb-4">
            Our Services
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Two ways we can help you get things done.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-card rounded-2xl p-8 border border-border hover:border-primary/30 transition-all hover:shadow-lg"
            >
              <div className={`w-14 h-14 ${service.color} rounded-xl flex items-center justify-center mb-6`}>
                <service.icon size={26} className="text-primary" />
              </div>
              <h3 className="font-display font-semibold text-2xl text-card-foreground mb-3">{service.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">{service.description}</p>
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-2xl text-primary">{service.price}</span>
                <Link to="/signup">
                  <Button variant="outline" className="rounded-full border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground">
                    Order Now
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
