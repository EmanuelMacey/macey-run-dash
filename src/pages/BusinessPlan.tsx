import { ArrowLeft, Download, Building2, Target, Eye, Shield, DollarSign, Users, TrendingUp, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import logo from "@/assets/logo.png";

const BusinessPlan = () => {
  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-primary py-8 print:py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="MaceyRunners" className="w-12 h-12 rounded-xl object-cover ring-2 ring-primary-foreground/20" />
            <div>
              <span className="font-display font-bold text-xl text-primary-foreground block">MaceyRunners</span>
              <span className="text-xs text-primary-foreground/70">Confidential Business Document</span>
            </div>
          </div>
          <div className="flex gap-2 print:hidden">
            <Button variant="secondary" size="sm" onClick={handlePrint} className="gap-2">
              <Download className="h-4 w-4" /> Export PDF
            </Button>
            <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="text-primary-foreground hover:bg-primary-foreground/10 gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="space-y-8">
          {/* Title Card */}
          <Card className="border-primary/20 bg-gradient-to-br from-card to-muted/30">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-xs font-semibold mb-4">
                <Building2 className="h-3.5 w-3.5" /> INTERNAL DOCUMENT — CONFIDENTIAL
              </div>
              <h1 className="font-display text-4xl font-bold text-foreground mb-3">MaceyRunners Business Plan</h1>
              <p className="text-muted-foreground text-lg">On-Demand Delivery & Errand Services — Georgetown, Guyana</p>
              <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> 464 East Ruimveldt, Georgetown</span>
                <span>support@maceyrunners.org</span>
                <span>+592 721 9769</span>
              </div>
              <p className="text-muted-foreground text-xs mt-3">Effective Date: February 2026</p>
            </CardContent>
          </Card>

          {/* Executive Summary */}
          <Section icon={<Building2 className="h-5 w-5" />} title="Executive Summary">
            <p className="text-muted-foreground leading-relaxed">
              MaceyRunners is a professional on-demand delivery and errand service platform operating in Georgetown, Guyana. We connect customers with reliable, trained <strong className="text-foreground">team members</strong> who provide fast delivery and errand services at competitive rates. Our platform leverages technology to provide real-time tracking, instant notifications, and a seamless ordering experience through our Progressive Web App (PWA).
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              MaceyRunners operates on a <strong className="text-foreground">60/40 revenue-sharing model</strong>: team members receive 60% of each delivery or errand fee, while MaceyRunners retains 40% to cover platform operations, marketing, technology maintenance, and business growth initiatives.
            </p>
          </Section>

          {/* Mission Statement */}
          <Section icon={<Target className="h-5 w-5" />} title="Mission Statement">
            <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl">
              <p className="text-foreground leading-relaxed italic text-lg">
                "To deliver convenience, reliability, and opportunity — empowering communities across Guyana through professional on-demand services while creating meaningful economic opportunities for every member of our team."
              </p>
            </div>
          </Section>

          {/* Vision Statement */}
          <Section icon={<Eye className="h-5 w-5" />} title="Vision Statement">
            <div className="bg-accent/5 border border-accent/20 p-6 rounded-2xl">
              <p className="text-foreground leading-relaxed italic text-lg">
                "To become the Caribbean's most trusted and innovative delivery platform — setting the standard for speed, professionalism, and community impact while expanding economic opportunity for every team member who joins our organisation."
              </p>
            </div>
          </Section>

          {/* Quality Policies */}
          <Section icon={<Shield className="h-5 w-5" />} title="Quality Policies">
            <div className="grid gap-4">
              {[
                { num: 1, title: "Service Excellence", text: "All deliveries must be completed within the 15–30 minute target window. Team members are expected to maintain clear communication with customers and management throughout the delivery process." },
                { num: 2, title: "Professional Conduct", text: "All team members must present themselves professionally at all times — courteous interaction with customers, proper handling of items, and adherence to traffic laws. Any complaints of unprofessional behaviour will result in immediate review and potential suspension." },
                { num: 3, title: "Delivery Time Guarantee", text: "If a delivery exceeds the 15–30 minute window and the assigned team member fails to communicate the reason to both the customer and management with a logical explanation, the customer's delivery fee shall be waived entirely. The team member will not receive compensation for that delivery." },
                { num: 4, title: "Accountability & Transparency", text: "All deliveries are tracked in real-time. Team members must keep their location sharing active during active orders. Any attempt to manipulate delivery status or timing will result in immediate suspension." },
                { num: 5, title: "Customer Satisfaction", text: "Customer ratings below 3.5 stars averaged over 10 deliveries will trigger a performance review. Team members consistently rated below 3.0 will be subject to temporary suspension or permanent termination." },
              ].map((p) => (
                <Card key={p.num} className="border-border/50">
                  <CardContent className="p-5">
                    <h3 className="font-display font-bold text-foreground mb-2">{p.num}. {p.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{p.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Section>

          {/* Revenue Model */}
          <Section icon={<DollarSign className="h-5 w-5" />} title="Revenue Model — 60/40 Split">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-card rounded-xl overflow-hidden border border-border/50">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-4 font-display text-foreground text-sm">Component</th>
                    <th className="text-center p-4 font-display text-foreground text-sm">Team Member (60%)</th>
                    <th className="text-center p-4 font-display text-foreground text-sm">MaceyRunners (40%)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Delivery ($700 GYD base)", "$420 GYD", "$280 GYD"],
                    ["Errand ($1,000 GYD base)", "$600 GYD", "$400 GYD"],
                    ["Delivery ($1,500 GYD w/ distance)", "$900 GYD", "$600 GYD"],
                    ["Errand ($2,000 GYD w/ distance)", "$1,200 GYD", "$800 GYD"],
                  ].map(([service, member, company], i) => (
                    <tr key={i} className={`border-t border-border/30 ${i % 2 ? "bg-muted/20" : ""}`}>
                      <td className="p-4 text-muted-foreground text-sm">{service}</td>
                      <td className="p-4 text-center font-semibold text-foreground text-sm">{member}</td>
                      <td className="p-4 text-center font-semibold text-primary text-sm">{company}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground text-xs mt-3">
              * Prices increase based on distance at $150 GYD per kilometre. Minimum delivery fee: $700 GYD. Minimum errand fee: $1,000 GYD.
            </p>
          </Section>

          {/* Pricing Structure */}
          <Section icon={<DollarSign className="h-5 w-5" />} title="Pricing Structure">
            <ul className="space-y-3 text-muted-foreground text-sm">
              <li><strong className="text-foreground">Delivery Service:</strong> Starting from $700 GYD, based on distance ($150 GYD/km surcharge)</li>
              <li><strong className="text-foreground">Errand Service:</strong> Starting from $1,000 GYD, based on distance ($150 GYD/km surcharge)</li>
              <li><strong className="text-foreground">Marketplace Orders:</strong> Delivery fee applies in addition to product prices</li>
              <li><strong className="text-foreground">Payment Methods:</strong> Cash on Delivery (COD) and MMG Mobile Payments</li>
            </ul>
          </Section>

          {/* Target Market */}
          <Section icon={<Users className="h-5 w-5" />} title="Target Market">
            <ul className="space-y-3 text-muted-foreground text-sm">
              <li><strong className="text-foreground">Primary:</strong> Individuals and families in Georgetown needing fast, reliable delivery services</li>
              <li><strong className="text-foreground">Secondary:</strong> Small businesses requiring errand and courier services</li>
              <li><strong className="text-foreground">Tertiary:</strong> Restaurants and stores seeking delivery partnerships through our marketplace</li>
            </ul>
          </Section>

          {/* Competitive Advantage */}
          <Section icon={<TrendingUp className="h-5 w-5" />} title="Competitive Advantages">
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Real-time GPS tracking of all deliveries",
                "Installable PWA — works on Android, iPhone & desktop",
                "Loyalty rewards programme for repeat customers",
                "Referral system with cash credits",
                "AI-powered customer support assistant",
                "Scheduled deliveries for future orders",
                "Multi-language support (English & Spanish)",
                "Strong delivery time guarantee with customer protection",
                "Community-focused: mentorship, sponsorship & scholarships",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Growth Strategy */}
          <Section icon={<TrendingUp className="h-5 w-5" />} title="Growth Strategy">
            <div className="grid gap-3">
              {[
                { phase: "Phase 1 (Current)", desc: "Establish reliable service in Georgetown with a core team of trained delivery professionals" },
                { phase: "Phase 2 (Q3 2026)", desc: "Expand to East Bank Demerara and West Coast Demerara" },
                { phase: "Phase 3 (2027)", desc: "Expand to Berbice and Essequibo regions" },
                { phase: "Phase 4 (2028)", desc: "Caribbean expansion — Trinidad & Tobago, Suriname, and beyond" },
              ].map((p) => (
                <Card key={p.phase} className="border-border/50">
                  <CardContent className="p-4 flex gap-4 items-start">
                    <span className="bg-primary/10 text-primary text-xs font-bold rounded-full px-3 py-1 whitespace-nowrap">{p.phase}</span>
                    <p className="text-sm text-muted-foreground">{p.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Section>

          {/* Footer */}
          <div className="border-t border-border pt-6 text-center text-muted-foreground text-sm space-y-1">
            <p className="font-display font-semibold text-foreground">MaceyRunners — Delivering with Purpose 🏃</p>
            <p>© {new Date().getFullYear()} MaceyRunners. All rights reserved.</p>
            <p className="text-xs">464 East Ruimveldt, Georgetown, Guyana | support@maceyrunners.org</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Section = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
  <section>
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">{icon}</div>
      <h2 className="font-display text-2xl font-bold text-foreground">{title}</h2>
    </div>
    {children}
  </section>
);

export default BusinessPlan;
