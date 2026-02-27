import { ArrowLeft, Download, FileText, Users, DollarSign, Clock, Briefcase, Building2, ShieldAlert, Lock, Scale, XCircle, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import logo from "@/assets/logo.png";

const RiderAgreement = () => {
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
              <span className="text-xs text-primary-foreground/70">Confidential — Team Member Agreement</span>
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
                <FileText className="h-3.5 w-3.5" /> INTERNAL DOCUMENT — CONFIDENTIAL
              </div>
              <h1 className="font-display text-4xl font-bold text-foreground mb-3">Team Member Service Agreement</h1>
              <p className="text-muted-foreground text-lg">MaceyRunners Delivery Professional Agreement</p>
              <p className="text-muted-foreground text-sm mt-2">464 East Ruimveldt, Georgetown, Guyana</p>
              <p className="text-muted-foreground text-xs mt-1">Effective Date: February 2026</p>
            </CardContent>
          </Card>

          {/* Preamble */}
          <Section icon={<FileText className="h-5 w-5" />} title="1. Preamble">
            <p className="text-muted-foreground leading-relaxed text-sm">
              This Team Member Service Agreement ("Agreement") is entered into between <strong className="text-foreground">MaceyRunners</strong> ("the Company"), located at 464 East Ruimveldt, Georgetown, Guyana, and the individual accepting this agreement ("the Team Member" or "Delivery Professional"). By accepting deliveries or errands through the MaceyRunners platform, the Team Member agrees to be bound by all terms and conditions outlined herein.
            </p>
          </Section>

          {/* Engagement */}
          <Section icon={<Users className="h-5 w-5" />} title="2. Nature of Engagement">
            <ul className="space-y-3 text-muted-foreground text-sm">
              <li>The Team Member is engaged as a <strong className="text-foreground">valued member of the MaceyRunners delivery team</strong> and is expected to uphold the company's standards of professionalism and excellence.</li>
              <li>The Team Member may accept or decline delivery assignments based on availability, though consistent reliability is expected and rewarded.</li>
              <li>MaceyRunners invests in its team through mentorship, branded equipment, and growth opportunities within the organisation.</li>
              <li>Compensation is performance-based under the 60/40 revenue-sharing model outlined below.</li>
            </ul>
          </Section>

          {/* Revenue Split */}
          <Section icon={<DollarSign className="h-5 w-5" />} title="3. Compensation — 60/40 Revenue Split">
            <Card className="border-border/50">
              <CardContent className="p-6 space-y-4">
                <p className="text-muted-foreground text-sm">The Team Member shall receive <strong className="text-foreground">60% (sixty percent)</strong> of the total delivery or errand fee for each completed order. MaceyRunners retains <strong className="text-foreground">40% (forty percent)</strong> to cover platform operations, technology, marketing, and administrative costs.</p>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 text-xs font-display text-foreground">Service</th>
                        <th className="text-center p-3 text-xs font-display text-foreground">Base Fee</th>
                        <th className="text-center p-3 text-xs font-display text-foreground">Team Member (60%)</th>
                        <th className="text-center p-3 text-xs font-display text-foreground">Company (40%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/30">
                        <td className="p-3 text-muted-foreground text-sm">Delivery</td>
                        <td className="p-3 text-center text-foreground text-sm">$700 GYD</td>
                        <td className="p-3 text-center font-semibold text-foreground text-sm">$420 GYD</td>
                        <td className="p-3 text-center text-primary text-sm">$280 GYD</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-muted-foreground text-sm">Errand</td>
                        <td className="p-3 text-center text-foreground text-sm">$1,000 GYD</td>
                        <td className="p-3 text-center font-semibold text-foreground text-sm">$600 GYD</td>
                        <td className="p-3 text-center text-primary text-sm">$400 GYD</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground">* Fees increase with distance at $150 GYD/km. The split applies to the total fee regardless of distance surcharges.</p>
              </CardContent>
            </Card>
          </Section>

          {/* Delivery Standards */}
          <Section icon={<Clock className="h-5 w-5" />} title="4. Delivery Time Standards & Guarantee">
            <div className="space-y-4">
              <Card className="border-destructive/30 bg-destructive/5">
                <CardContent className="p-5">
                  <h3 className="font-display font-bold text-foreground mb-2 flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-destructive" /> Critical Policy
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    The target delivery time is <strong className="text-foreground">15–30 minutes</strong> from order acceptance. If a delivery exceeds this timeframe and the Team Member <strong className="text-foreground">fails to communicate</strong> a logical reason to both the customer and management:
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2"><span className="text-destructive">•</span> The <strong className="text-foreground">customer's delivery will be free</strong> — the delivery fee is fully waived.</li>
                    <li className="flex items-start gap-2"><span className="text-destructive">•</span> The <strong className="text-foreground">Team Member will receive no compensation</strong> for that delivery.</li>
                    <li className="flex items-start gap-2"><span className="text-destructive">•</span> Repeated violations will result in <strong className="text-foreground">performance review and potential suspension</strong>.</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-5">
                  <h3 className="font-display font-bold text-foreground mb-2">Acceptable Delay Reasons</h3>
                  <p className="text-muted-foreground text-xs mb-2">The following may be accepted if communicated promptly to management and the customer:</p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>• Traffic congestion or road closures</li>
                    <li>• Severe weather conditions</li>
                    <li>• Extended wait times at pickup location</li>
                    <li>• Incorrect address provided by customer (documented in chat)</li>
                    <li>• Vehicle breakdown (with proof)</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </Section>

          {/* Team Member Obligations */}
          <Section icon={<Briefcase className="h-5 w-5" />} title="5. Team Member Obligations">
            <ul className="space-y-3 text-muted-foreground text-sm">
              <li><strong className="text-foreground">5.1 Professional Conduct:</strong> Team members shall conduct themselves with professionalism and courtesy at all times when representing MaceyRunners.</li>
              <li><strong className="text-foreground">5.2 Communication:</strong> Team members must maintain an active phone/data connection during active deliveries and respond to customer/management messages within 2 minutes.</li>
              <li><strong className="text-foreground">5.3 Location Sharing:</strong> Real-time GPS location sharing must be active during all active orders for customer tracking purposes.</li>
              <li><strong className="text-foreground">5.4 Item Care:</strong> Team members are responsible for the safe and secure transport of all items. Damaged, lost, or tampered items are the team member's liability.</li>
              <li><strong className="text-foreground">5.5 Cash Handling:</strong> For Cash on Delivery orders, team members must collect the full amount and remit MaceyRunners' 40% share within 24 hours via MMG or an approved payment method.</li>
              <li><strong className="text-foreground">5.6 Substance Policy:</strong> Team members shall not operate under the influence of alcohol or any controlled substance while performing deliveries.</li>
              <li><strong className="text-foreground">5.7 Appearance Standards:</strong> Team members must present a clean and professional appearance. MaceyRunners-branded items (when provided) should be worn during deliveries.</li>
            </ul>
          </Section>

          {/* Company Obligations */}
          <Section icon={<Building2 className="h-5 w-5" />} title="6. MaceyRunners Obligations">
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>• Provide a functional and reliable technology platform for order management</li>
              <li>• Process and distribute team member earnings promptly</li>
              <li>• Provide customer support to resolve disputes fairly</li>
              <li>• Maintain transparency in fee calculations and deductions</li>
              <li>• Offer mentorship, training, and growth opportunities within the organisation</li>
              <li>• Provide branded materials and equipment where applicable</li>
            </ul>
          </Section>

          {/* Grounds for Suspension */}
          <Section icon={<XCircle className="h-5 w-5" />} title="7. Grounds for Suspension or Termination">
            <p className="text-muted-foreground text-sm mb-3">MaceyRunners reserves the right to temporarily suspend or permanently terminate a team member's engagement for:</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {[
                "Consistent failure to meet delivery time standards without communication",
                "Customer rating consistently below 3.0 stars",
                "Theft, fraud, or dishonest behaviour",
                "Physical or verbal abuse toward customers, merchants, or staff",
                "Operating under the influence of substances",
                "Sharing customer personal information with unauthorised parties",
                "Manipulating GPS location or delivery status",
                "Failure to remit cash collections within 24 hours",
                "Three or more unexcused late deliveries within a 7-day period",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 text-xs text-muted-foreground bg-destructive/5 rounded-lg p-2.5">
                  <span className="text-destructive mt-0.5 shrink-0">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Confidentiality */}
          <Section icon={<Lock className="h-5 w-5" />} title="8. Confidentiality & Data Protection">
            <p className="text-muted-foreground text-sm leading-relaxed">
              The Team Member agrees to maintain strict confidentiality of all customer information including names, phone numbers, addresses, and order details. Customer data shall only be used for the purpose of completing active deliveries and must never be stored, shared, or used for personal gain. Violation of this clause constitutes grounds for immediate termination and may result in legal action.
            </p>
          </Section>

          {/* Dispute Resolution */}
          <Section icon={<Scale className="h-5 w-5" />} title="9. Dispute Resolution">
            <p className="text-muted-foreground text-sm leading-relaxed">
              Any disputes arising from this Agreement shall first be addressed through MaceyRunners' internal mediation process. The Team Member may raise concerns with the Operations Manager within 48 hours of the incident. If unresolved, disputes shall be escalated to the Founder/CEO for final determination. Both parties agree to act in good faith to resolve issues amicably.
            </p>
          </Section>

          {/* Termination */}
          <Section icon={<XCircle className="h-5 w-5" />} title="10. Termination">
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>• Either party may end this Agreement at any time with 7 days' written notice.</li>
              <li>• MaceyRunners may terminate immediately in cases of gross misconduct as outlined in Section 7.</li>
              <li>• Upon termination, the Team Member must settle all outstanding cash collections within 48 hours.</li>
              <li>• The Team Member shall immediately cease use of any MaceyRunners-branded materials upon termination.</li>
            </ul>
          </Section>

          {/* Amendments */}
          <Section icon={<PenTool className="h-5 w-5" />} title="11. Amendments">
            <p className="text-muted-foreground text-sm leading-relaxed">
              MaceyRunners reserves the right to amend this Agreement with 14 days' notice. Continued acceptance of deliveries after the notice period constitutes acceptance of the amended terms. Team members who do not accept amended terms may end this Agreement without penalty.
            </p>
          </Section>

          {/* Acknowledgment */}
          <Card className="border-primary/20 bg-gradient-to-br from-card to-muted/30">
            <CardContent className="p-8">
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">Acknowledgment</h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                By accepting deliveries through the MaceyRunners platform, I acknowledge that I have read, understood, and agree to all terms and conditions outlined in this Agreement. I understand the 60/40 revenue split, the delivery time guarantee policy, and the standards of professionalism expected of me as a MaceyRunners team member.
              </p>
              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground mb-10">Team Member Signature</p>
                  <div className="border-b border-foreground/50 w-full mb-2" />
                  <p className="text-xs text-muted-foreground">Full Name & Date</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-10">MaceyRunners Representative</p>
                  <div className="border-b border-foreground/50 w-full mb-2" />
                  <p className="text-xs text-muted-foreground">Name, Title & Date</p>
                </div>
              </div>
            </CardContent>
          </Card>

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
      <h2 className="font-display text-xl font-bold text-foreground">{title}</h2>
    </div>
    {children}
  </section>
);

export default RiderAgreement;
