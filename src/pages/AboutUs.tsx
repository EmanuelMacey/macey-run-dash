import { Link } from "react-router-dom";
import { ArrowLeft, Target, Heart, Users, Rocket, Award, Globe } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const team = [
  {
    name: "Emanuel Macey",
    title: "Owner & Founder",
    initials: "EM",
    bio: "Emanuel Macey is the strategic visionary behind MaceyRunners, building a scalable and purpose-driven delivery brand rooted in operational excellence. He leads the company's long-term growth strategy while maintaining a strong commitment to youth empowerment.",
  },
  {
    name: "Jahquan Hinds",
    title: "Co-Founder & Chief Operations Officer",
    initials: "JH",
    bio: "Jahquan Hinds oversees operations and service performance at MaceyRunners. He ensures efficiency, reliability, and high service standards across the company's delivery network.",
  },
  {
    name: "Kathlyn Simpson",
    title: "Chief Financial Officer",
    initials: "KS",
    bio: "Kathlyn Simpson leads financial planning and oversight, ensuring fiscal stability and strategic resource management supporting long-term growth.",
  },
];

const values = [
  { icon: Rocket, title: "Speed & Reliability", desc: "Every delivery completed with urgency and precision." },
  { icon: Heart, title: "Community First", desc: "Empowering youth through mentorship and scholarships." },
  { icon: Award, title: "Excellence", desc: "High service standards across every interaction." },
  { icon: Globe, title: "Impact", desc: "Building a legacy that transforms communities." },
];

const stats = [
  { value: "1,000+", label: "Deliveries Completed" },
  { value: "500+", label: "Happy Customers" },
  { value: "50+", label: "Active Drivers" },
  { value: "24/7", label: "Service Available" },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 mesh-bg" />
        <div className="particle w-3 h-3 bg-primary/20 top-32 left-[10%]" style={{ animationDelay: '0s' }} />
        <div className="particle w-2 h-2 bg-accent/20 top-48 right-[15%]" style={{ animationDelay: '2s' }} />

        <div className="container mx-auto px-4 max-w-5xl relative">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>

          <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="text-center max-w-3xl mx-auto">
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Delivering</span> with Purpose
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
              MaceyRunners was founded with a clear mission: to deliver reliable, efficient, and professional logistics services while building a brand rooted in purpose and long-term impact.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 max-w-5xl py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                {...fadeUp}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="font-display text-3xl md:text-4xl font-bold gradient-text">{stat.value}</p>
                <p className="text-muted-foreground text-sm mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <main className="pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Mission */}
          <section className="py-16">
            <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                    <Target className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Our Mission</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We specialize in delivery and errand solutions designed to serve individuals, businesses, and communities with speed, integrity, and excellence.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Beyond operations, MaceyRunners is driven by a greater vision — to create opportunities for young people and contribute meaningfully to national development through mentorship, sponsorship, and scholarship initiatives.
                </p>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl p-8 border border-border/50 space-y-4">
                  <p className="text-foreground font-display font-bold text-xl">We are building more than a service.</p>
                  <p className="text-foreground font-display font-bold text-xl">We are building opportunity.</p>
                  <p className="text-foreground font-display font-bold text-xl">We are building legacy.</p>
                  <div className="pt-4 border-t border-border/50">
                    <p className="gradient-text font-display font-bold text-2xl">MaceyRunners</p>
                    <p className="text-muted-foreground text-sm">Delivering with Purpose 🏃</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Core Values */}
          <section className="py-16 border-t border-border/30">
            <motion.div {...fadeUp} transition={{ delay: 0.15 }} className="text-center mb-12">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">Our Core Values</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">The principles that drive everything we do</p>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {values.map((val, i) => (
                <motion.div
                  key={val.title}
                  {...fadeUp}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group glow-card"
                >
                  <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-primary/20">
                    <val.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h3 className="font-display font-bold text-foreground mb-2">{val.title}</h3>
                  <p className="text-muted-foreground text-sm">{val.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Leadership */}
          <section className="py-16 border-t border-border/30">
            <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Leadership Team</h2>
              </div>
              <p className="text-muted-foreground max-w-lg mx-auto">The people behind the mission</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {team.map((member, i) => (
                <motion.div
                  key={member.name}
                  {...fadeUp}
                  transition={{ delay: 0.25 + i * 0.1 }}
                  className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 text-center group"
                >
                  <div className="w-20 h-20 mx-auto gradient-primary rounded-full flex items-center justify-center mb-4 shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                    <span className="font-display text-2xl font-bold text-primary-foreground">{member.initials}</span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground">{member.name}</h3>
                  <p className="text-primary text-sm font-medium mb-3">{member.title}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">{member.bio}</p>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;
