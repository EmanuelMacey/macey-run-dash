import { Link } from "react-router-dom";
import { ArrowLeft, Target, Eye, Shield, Heart, Zap, Users, Award, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const coreValues = [
  { icon: Heart, title: "Community First", text: "Everything we do is rooted in uplifting our community — creating jobs, supporting families, and building a legacy in Guyana." },
  { icon: Zap, title: "Speed & Reliability", text: "We honour our promises. Our 15–30 minute delivery window is a commitment, not a suggestion." },
  { icon: Users, title: "People Over Profit", text: "Our team members are the heartbeat of MaceyRunners. We invest in their growth, training, and well-being." },
  { icon: Award, title: "Excellence in Every Mile", text: "From pickup to drop-off, every interaction reflects our dedication to professionalism and care." },
];

const qualityPolicies = [
  { title: "Service Excellence", text: "All deliveries completed within our 15–30 minute target. Clear communication at every step." },
  { title: "Professional Conduct", text: "Our team members represent the highest standards of courtesy, care, and accountability." },
  { title: "Customer Protection", text: "If a delivery is late without valid communication, the delivery fee is waived for the customer." },
  { title: "Accountability", text: "Real-time GPS tracking on every order. Full transparency in everything we do." },
  { title: "Customer Satisfaction", text: "We actively monitor feedback and continuously improve our service quality." },
];

const OurValues = () => (
  <div className="min-h-screen bg-background">
    {/* Hero Header */}
    <div className="gradient-primary relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="flex items-center justify-between mb-10">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="MaceyRunners" className="w-11 h-11 rounded-xl object-cover ring-2 ring-white/20" />
            <span className="font-display font-bold text-xl text-primary-foreground">MaceyRunners</span>
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10 gap-2 rounded-full">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Button>
          </Link>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">Our Values & Standards</h1>
          <p className="text-primary-foreground/80 text-lg leading-relaxed">
            Delivering with purpose — building opportunity, legacy, and trust across Guyana.
          </p>
        </motion.div>
      </div>
    </div>

    <div className="container mx-auto px-4 py-12 max-w-4xl space-y-16">
      {/* Mission */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Target className="h-6 w-6 text-primary-foreground" />
          </div>
          <h2 className="font-display text-3xl font-bold text-foreground">Our Mission</h2>
        </div>
        <div className="bg-primary/5 border border-primary/20 p-8 rounded-2xl">
          <p className="text-foreground leading-relaxed italic text-lg">
            "To deliver convenience, reliability, and opportunity — empowering communities across Guyana through professional on-demand services while creating meaningful economic opportunities for every member of our team."
          </p>
        </div>
      </motion.section>

      {/* Vision */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
            <Eye className="h-6 w-6 text-accent-foreground" />
          </div>
          <h2 className="font-display text-3xl font-bold text-foreground">Our Vision</h2>
        </div>
        <div className="bg-accent/5 border border-accent/20 p-8 rounded-2xl">
          <p className="text-foreground leading-relaxed italic text-lg">
            "To become the Caribbean's most trusted and innovative delivery platform — setting the standard for speed, professionalism, and community impact."
          </p>
        </div>
      </motion.section>

      {/* Core Values */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-success flex items-center justify-center shadow-lg shadow-success/20">
            <Heart className="h-6 w-6 text-success-foreground" />
          </div>
          <h2 className="font-display text-3xl font-bold text-foreground">Core Values</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {coreValues.map((v, i) => (
            <motion.div key={v.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i + 3}>
              <Card className="border-border/50 h-full hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <v.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-display font-bold text-foreground text-lg mb-2">{v.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{v.text}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Quality Standards */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={4}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <h2 className="font-display text-3xl font-bold text-foreground">Quality Standards</h2>
        </div>
        <div className="space-y-3">
          {qualityPolicies.map((p, i) => (
            <motion.div key={p.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i + 5}>
              <Card className="border-border/50 hover:shadow-md transition-all duration-300">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-foreground mb-1">{p.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{p.text}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={6} className="text-center py-8">
        <div className="gradient-primary rounded-3xl p-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
          <div className="relative z-10">
            <h3 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground mb-3">Ready to Experience the Difference?</h3>
            <p className="text-primary-foreground/80 mb-6 max-w-md mx-auto">Join thousands of satisfied customers and experience delivery done right.</p>
            <Link to="/signup">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 rounded-full px-8 font-semibold shadow-xl">
                Get Started Today
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      <div className="border-t border-border pt-6 text-center text-muted-foreground text-xs space-y-1">
        <p className="font-medium">MaceyRunners — Delivering with Purpose 🏃</p>
        <p>464 East Ruimveldt, Georgetown, Guyana</p>
        <p>© {new Date().getFullYear()} MaceyRunners. All rights reserved.</p>
      </div>
    </div>
  </div>
);

export default OurValues;
