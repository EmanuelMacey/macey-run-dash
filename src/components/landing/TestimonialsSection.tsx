import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
}

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    supabase
      .from("testimonials")
      .select("id, name, location, rating, text")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setTestimonials(data as Testimonial[]);
        }
      });
  }, []);

  if (testimonials.length === 0) return null;

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
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative bg-card/90 backdrop-blur-sm rounded-3xl p-7 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl group"
            >
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
