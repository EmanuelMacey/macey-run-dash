import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const team = [
  {
    name: "Emanuel Macey",
    title: "Owner & Founder",
    bio: "Emanuel Macey is the strategic visionary behind MaceyRunners, building a scalable and purpose-driven delivery brand rooted in operational excellence. He leads the company's long-term growth strategy while maintaining a strong commitment to youth empowerment. His vision extends beyond logistics — positioning MaceyRunners as a platform that will invest in mentorship, sponsorship, and scholarship initiatives for the next generation.",
  },
  {
    name: "Jahquan Hinds",
    title: "Co-Founder & Chief Operations Officer (COO)",
    bio: "Jahquan Hinds oversees operations and service performance at MaceyRunners. He ensures efficiency, reliability, and high service standards across the company's delivery network. His focus on structured growth and operational discipline strengthens the company's foundation for sustainable expansion.",
  },
  {
    name: "Kathlyn Simpson",
    title: "Chief Financial Officer (CFO)",
    bio: "Kathlyn Simpson leads financial planning and oversight, ensuring fiscal stability and strategic resource management. Her commitment to transparency and responsible financial governance supports MaceyRunners' long-term growth and investor confidence.",
  },
];

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">About MaceyRunners</h1>

            <div className="prose prose-sm dark:prose-invert max-w-none mb-16">
              <p className="text-muted-foreground text-base leading-relaxed">
                MaceyRunners was founded with a clear mission: to deliver reliable, efficient, and professional logistics services while building a brand rooted in purpose and long-term impact. We specialize in delivery and errand solutions designed to serve individuals, businesses, and communities with speed, integrity, and excellence.
              </p>
              <p className="text-muted-foreground text-base leading-relaxed">
                Beyond operations, MaceyRunners is driven by a greater vision — to create opportunities for young people and contribute meaningfully to national development. As we grow, our commitment extends toward empowering youth through mentorship, sponsorship, and scholarship initiatives that transform ambition into achievement.
              </p>

              <div className="bg-card border border-border/50 rounded-2xl p-6 my-8 space-y-2">
                <p className="text-foreground font-semibold text-base m-0">We are building more than a service.</p>
                <p className="text-foreground font-semibold text-base m-0">We are building opportunity.</p>
                <p className="text-foreground font-semibold text-base m-0">We are building legacy.</p>
                <p className="text-primary font-display font-bold text-lg mt-4 mb-0">MaceyRunners — Delivering with Purpose.</p>
              </div>
            </div>

            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8">Leadership Team</h2>

            <div className="space-y-8">
              {team.map((member, i) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 + 0.2 }}
                  className="bg-card border border-border/50 rounded-2xl p-6"
                >
                  <h3 className="font-display text-lg font-bold text-foreground">{member.name}</h3>
                  <p className="text-primary text-sm font-medium mb-3">{member.title}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">{member.bio}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;
