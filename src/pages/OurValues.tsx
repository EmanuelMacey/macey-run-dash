import { Link } from "react-router-dom";
import { ArrowLeft, Target, Eye, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const OurValues = () => (
  <div className="min-h-screen bg-background">
    <div className="gradient-primary py-8">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="MaceyRunners" className="w-10 h-10 rounded-xl object-cover" />
          <span className="font-display font-bold text-xl text-primary-foreground">MaceyRunners</span>
        </Link>
        <Link to="/">
          <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10 gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
      </div>
    </div>

    <div className="container mx-auto px-4 py-10 max-w-3xl space-y-8">
      <div className="text-center mb-8">
        <h1 className="font-display text-4xl font-bold text-foreground mb-2">Our Values & Standards</h1>
        <p className="text-muted-foreground">What drives us at MaceyRunners</p>
      </div>

      {/* Mission */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Target className="h-5 w-5" /></div>
          <h2 className="font-display text-2xl font-bold text-foreground">Our Mission</h2>
        </div>
        <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl">
          <p className="text-foreground leading-relaxed italic text-lg">
            "To deliver convenience, reliability, and opportunity — empowering communities across Guyana through professional on-demand services while creating meaningful economic opportunities for every member of our team."
          </p>
        </div>
      </section>

      {/* Vision */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent-foreground"><Eye className="h-5 w-5" /></div>
          <h2 className="font-display text-2xl font-bold text-foreground">Our Vision</h2>
        </div>
        <div className="bg-accent/5 border border-accent/20 p-6 rounded-2xl">
          <p className="text-foreground leading-relaxed italic text-lg">
            "To become the Caribbean's most trusted and innovative delivery platform — setting the standard for speed, professionalism, and community impact."
          </p>
        </div>
      </section>

      {/* Quality Policies */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Shield className="h-5 w-5" /></div>
          <h2 className="font-display text-2xl font-bold text-foreground">Quality Standards</h2>
        </div>
        <div className="grid gap-4">
          {[
            { title: "Service Excellence", text: "All deliveries completed within our 15–30 minute target. Clear communication at every step." },
            { title: "Professional Conduct", text: "Our team members represent the highest standards of courtesy, care, and accountability." },
            { title: "Customer Protection", text: "If a delivery is late without valid communication, the delivery fee is waived for the customer." },
            { title: "Accountability", text: "Real-time GPS tracking on every order. Full transparency in everything we do." },
            { title: "Customer Satisfaction", text: "We actively monitor feedback and continuously improve our service quality." },
          ].map((p) => (
            <Card key={p.title} className="border-border/50">
              <CardContent className="p-5">
                <h3 className="font-display font-bold text-foreground mb-1">{p.title}</h3>
                <p className="text-muted-foreground text-sm">{p.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="border-t border-border pt-6 text-center text-muted-foreground text-xs">
        <p>© {new Date().getFullYear()} MaceyRunners. 464 East Ruimveldt, Georgetown, Guyana</p>
      </div>
    </div>
  </div>
);

export default OurValues;
