import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

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
    <section id="testimonials" className="py-28 mesh-bg relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
            TESTIMONIALS
          </div>
          <h2 className="font-display font-bold text-3xl md:text-5xl text-foreground mb-4">
            Loved by customers
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Real stories from people who trust MaceyRunners every day.
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
              className="relative bg-card/90 backdrop-blur-sm rounded-3xl p-7 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl group"
            >
              {/* Quote icon */}
              <Quote size={28} className="text-primary/10 absolute top-5 right-5" />

              <div className="flex gap-0.5 mb-5">
                {[...Array(5)].map((_, si) => (
                  <Star
                    key={si}
                    size={14}
                    className={si < t.rating ? "text-accent fill-accent" : "text-muted-foreground/20"}
                  />
                ))}
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                "{t.text}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold shadow-md">
                  {t.name[0]}
                </div>
                <div>
                  <p className="font-display font-semibold text-sm text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
