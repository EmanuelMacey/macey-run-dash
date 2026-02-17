import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Shania R.",
    location: "Georgetown",
    rating: 5,
    text: "MaceyRunners delivered my lunch in under 15 minutes! The runner was super friendly and kept me updated the whole time.",
  },
  {
    name: "Kevin M.",
    location: "East Coast Demerara",
    rating: 5,
    text: "I use them for pharmacy runs every week. So convenient — I don't have to leave the house anymore. Highly recommend!",
  },
  {
    name: "Priya D.",
    location: "Kitty, Georgetown",
    rating: 4,
    text: "Great service for grocery shopping. They picked up everything on my list and delivered it fresh. Will definitely use again.",
  },
  {
    name: "Marcus T.",
    location: "Berbice",
    rating: 5,
    text: "Needed important documents couriered across town urgently. MaceyRunners came through fast — lifesaver!",
  },
];

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-24 mesh-bg relative overflow-hidden">
      <div className="particle w-2 h-2 bg-primary/20 top-16 right-[20%]" style={{ animationDelay: "2s" }} />
      <div className="particle w-3 h-3 bg-accent/15 bottom-20 left-[10%]" style={{ animationDelay: "5s" }} />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display font-bold text-3xl md:text-5xl text-foreground mb-4">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Real feedback from people who trust MaceyRunners every day.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card/90 backdrop-blur-sm rounded-3xl p-6 border border-border/50 hover:border-primary/30 transition-all hover:shadow-xl group"
            >
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, si) => (
                  <Star
                    key={si}
                    size={14}
                    className={si < t.rating ? "text-accent fill-accent" : "text-muted-foreground/30"}
                  />
                ))}
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-5">"{t.text}"</p>
              <div>
                <p className="font-display font-semibold text-sm text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.location}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
