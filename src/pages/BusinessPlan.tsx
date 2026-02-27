import { Link } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const BusinessPlan = () => {
  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-primary py-6 print:py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="MaceyRunners" className="w-10 h-10 rounded-xl object-cover" />
            <span className="font-display font-bold text-xl text-primary-foreground">MaceyRunners</span>
          </Link>
          <div className="flex gap-2 print:hidden">
            <Button variant="secondary" size="sm" onClick={handlePrint} className="gap-2">
              <Download className="h-4 w-4" /> Download PDF
            </Button>
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10 gap-2">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          {/* Title */}
          <div className="text-center border-b border-border pb-8 mb-8">
            <h1 className="font-display text-4xl font-bold text-foreground mb-2">MaceyRunners Business Plan</h1>
            <p className="text-muted-foreground text-lg">On-Demand Delivery & Errand Services — Georgetown, Guyana</p>
            <p className="text-muted-foreground text-sm mt-2">464 East Ruimveldt, Georgetown, Guyana | support@maceyrunners.org | +592 721 9769</p>
            <p className="text-muted-foreground text-xs mt-1">Effective Date: February 2026</p>
          </div>

          {/* Executive Summary */}
          <section>
            <h2 className="font-display text-2xl font-bold text-foreground border-l-4 border-primary pl-4">Executive Summary</h2>
            <p className="text-muted-foreground leading-relaxed">
              MaceyRunners is a professional on-demand delivery and errand service platform operating in Georgetown, Guyana. We connect customers with reliable, vetted runners who provide fast delivery and errand services at competitive rates. Our platform leverages technology to provide real-time tracking, instant notifications, and a seamless ordering experience through our Progressive Web App (PWA).
            </p>
            <p className="text-muted-foreground leading-relaxed">
              MaceyRunners operates on a <strong className="text-foreground">60/40 revenue-sharing model</strong>: runners receive 60% of each delivery or errand fee, while MaceyRunners retains 40% to cover platform operations, marketing, technology maintenance, and business growth initiatives.
            </p>
          </section>

          {/* Mission Statement */}
          <section>
            <h2 className="font-display text-2xl font-bold text-foreground border-l-4 border-primary pl-4">Mission Statement</h2>
            <p className="text-muted-foreground leading-relaxed italic bg-muted/50 p-6 rounded-2xl border border-border/50">
              "To deliver convenience, reliability, and opportunity — empowering communities across Guyana through professional on-demand services while creating meaningful economic opportunities for our runners and partners."
            </p>
          </section>

          {/* Vision Statement */}
          <section>
            <h2 className="font-display text-2xl font-bold text-foreground border-l-4 border-primary pl-4">Vision Statement</h2>
            <p className="text-muted-foreground leading-relaxed italic bg-muted/50 p-6 rounded-2xl border border-border/50">
              "To become the Caribbean's most trusted and innovative delivery platform — setting the standard for speed, professionalism, and community impact while expanding economic opportunity for every runner who joins our team."
            </p>
          </section>

          {/* Quality Policies */}
          <section>
            <h2 className="font-display text-2xl font-bold text-foreground border-l-4 border-primary pl-4">Quality Policies</h2>
            <div className="space-y-4">
              <div className="bg-card border border-border/50 rounded-xl p-5">
                <h3 className="font-display font-bold text-foreground mb-2">1. Service Excellence</h3>
                <p className="text-muted-foreground text-sm">All deliveries must be completed within the 15–30 minute target window. Runners are expected to maintain clear communication with customers and administrators throughout the delivery process.</p>
              </div>
              <div className="bg-card border border-border/50 rounded-xl p-5">
                <h3 className="font-display font-bold text-foreground mb-2">2. Professional Conduct</h3>
                <p className="text-muted-foreground text-sm">Runners must present themselves professionally at all times — no foul language, respectful interaction with customers, proper handling of items, and adherence to traffic laws. Any complaints of unprofessional behavior will result in immediate review and potential deactivation.</p>
              </div>
              <div className="bg-card border border-border/50 rounded-xl p-5">
                <h3 className="font-display font-bold text-foreground mb-2">3. Delivery Time Guarantee</h3>
                <p className="text-muted-foreground text-sm">If a delivery exceeds the average 15–30 minute delivery window and the runner fails to communicate the reason to both the customer and admin with a logical explanation, the customer's delivery fee shall be waived entirely. The runner will not receive compensation for that delivery.</p>
              </div>
              <div className="bg-card border border-border/50 rounded-xl p-5">
                <h3 className="font-display font-bold text-foreground mb-2">4. Accountability & Transparency</h3>
                <p className="text-muted-foreground text-sm">All deliveries are tracked in real-time. Runners must keep their location sharing active during active orders. Any attempt to manipulate delivery status or timing will result in immediate deactivation.</p>
              </div>
              <div className="bg-card border border-border/50 rounded-xl p-5">
                <h3 className="font-display font-bold text-foreground mb-2">5. Customer Satisfaction</h3>
                <p className="text-muted-foreground text-sm">Customer ratings below 3.5 stars averaged over 10 deliveries will trigger a performance review. Runners consistently rated below 3.0 will be subject to temporary suspension or permanent deactivation.</p>
              </div>
            </div>
          </section>

          {/* Revenue Model */}
          <section>
            <h2 className="font-display text-2xl font-bold text-foreground border-l-4 border-primary pl-4">Revenue Model — 60/40 Split</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-card rounded-xl overflow-hidden border border-border/50">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-4 font-display text-foreground">Component</th>
                    <th className="text-center p-4 font-display text-foreground">Runner (60%)</th>
                    <th className="text-center p-4 font-display text-foreground">MaceyRunners (40%)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border/30">
                    <td className="p-4 text-muted-foreground">Delivery ($700 GYD base)</td>
                    <td className="p-4 text-center font-semibold text-foreground">$420 GYD</td>
                    <td className="p-4 text-center font-semibold text-primary">$280 GYD</td>
                  </tr>
                  <tr className="border-t border-border/30 bg-muted/20">
                    <td className="p-4 text-muted-foreground">Errand ($1,000 GYD base)</td>
                    <td className="p-4 text-center font-semibold text-foreground">$600 GYD</td>
                    <td className="p-4 text-center font-semibold text-primary">$400 GYD</td>
                  </tr>
                  <tr className="border-t border-border/30">
                    <td className="p-4 text-muted-foreground">Delivery ($1,500 GYD with distance)</td>
                    <td className="p-4 text-center font-semibold text-foreground">$900 GYD</td>
                    <td className="p-4 text-center font-semibold text-primary">$600 GYD</td>
                  </tr>
                  <tr className="border-t border-border/30 bg-muted/20">
                    <td className="p-4 text-muted-foreground">Errand ($2,000 GYD with distance)</td>
                    <td className="p-4 text-center font-semibold text-foreground">$1,200 GYD</td>
                    <td className="p-4 text-center font-semibold text-primary">$800 GYD</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground text-sm mt-3">
              * Prices increase based on distance at $150 GYD per kilometer. Minimum delivery fee: $700 GYD. Minimum errand fee: $1,000 GYD.
            </p>
          </section>

          {/* Pricing Structure */}
          <section>
            <h2 className="font-display text-2xl font-bold text-foreground border-l-4 border-primary pl-4">Pricing Structure</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Delivery Service:</strong> Starting from $700 GYD, based on distance ($150 GYD/km surcharge)</li>
              <li><strong className="text-foreground">Errand Service:</strong> Starting from $1,000 GYD, based on distance ($150 GYD/km surcharge)</li>
              <li><strong className="text-foreground">Marketplace Orders:</strong> Delivery fee applies in addition to product prices</li>
              <li><strong className="text-foreground">Payment Methods:</strong> Cash on Delivery (COD) and MMG Mobile Payments</li>
            </ul>
          </section>

          {/* Target Market */}
          <section>
            <h2 className="font-display text-2xl font-bold text-foreground border-l-4 border-primary pl-4">Target Market</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Primary:</strong> Individuals and families in Georgetown, Guyana needing fast, reliable delivery services</li>
              <li><strong className="text-foreground">Secondary:</strong> Small businesses requiring errand and courier services</li>
              <li><strong className="text-foreground">Tertiary:</strong> Restaurants and stores seeking delivery partnerships through our marketplace</li>
            </ul>
          </section>

          {/* Competitive Advantage */}
          <section>
            <h2 className="font-display text-2xl font-bold text-foreground border-l-4 border-primary pl-4">Competitive Advantages</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>✅ Real-time GPS tracking of all deliveries</li>
              <li>✅ Installable PWA app — works on Android, iPhone, and desktop</li>
              <li>✅ Loyalty rewards program for repeat customers</li>
              <li>✅ Referral system with cash credits</li>
              <li>✅ AI-powered customer support chatbot</li>
              <li>✅ Scheduled deliveries for future orders</li>
              <li>✅ Multi-language support (English & Spanish)</li>
              <li>✅ Strong delivery time guarantee with customer protection</li>
              <li>✅ Community-focused: mentorship, sponsorship, and scholarships</li>
            </ul>
          </section>

          {/* Growth Strategy */}
          <section>
            <h2 className="font-display text-2xl font-bold text-foreground border-l-4 border-primary pl-4">Growth Strategy</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Phase 1 (Current):</strong> Establish reliable service in Georgetown with a core team of vetted runners</li>
              <li><strong className="text-foreground">Phase 2 (Q3 2026):</strong> Expand to East Bank Demerara and West Coast Demerara</li>
              <li><strong className="text-foreground">Phase 3 (2027):</strong> Expand to Berbice and Essequibo regions</li>
              <li><strong className="text-foreground">Phase 4 (2028):</strong> Caribbean expansion — Trinidad & Tobago, Suriname, and beyond</li>
            </ul>
          </section>

          {/* Footer */}
          <div className="border-t border-border pt-6 text-center text-muted-foreground text-sm">
            <p>© {new Date().getFullYear()} MaceyRunners. All rights reserved.</p>
            <p>464 East Ruimveldt, Georgetown, Guyana | support@maceyrunners.org</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessPlan;
