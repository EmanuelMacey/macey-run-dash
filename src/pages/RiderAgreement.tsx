import { Link } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const RiderAgreement = () => {
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
            <h1 className="font-display text-4xl font-bold text-foreground mb-2">Runner / Rider Agreement</h1>
            <p className="text-muted-foreground text-lg">MaceyRunners Independent Contractor Agreement</p>
            <p className="text-muted-foreground text-sm mt-2">464 East Ruimveldt, Georgetown, Guyana</p>
            <p className="text-muted-foreground text-xs mt-1">Effective Date: February 2026</p>
          </div>

          {/* Preamble */}
          <section>
            <h2 className="font-display text-2xl font-bold text-foreground border-l-4 border-primary pl-4">1. Preamble</h2>
            <p className="text-muted-foreground leading-relaxed">
              This Runner/Rider Agreement ("Agreement") is entered into between <strong className="text-foreground">MaceyRunners</strong> ("the Company"), located at 464 East Ruimveldt, Georgetown, Guyana, and the individual accepting this agreement ("the Runner" or "Rider"). By accepting deliveries or errands through the MaceyRunners platform, the Runner agrees to be bound by all terms and conditions outlined herein.
            </p>
          </section>

          {/* Engagement */}
          <section>
            <h2 className="font-display text-2xl font-bold text-foreground border-l-4 border-primary pl-4">2. Nature of Engagement</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>The Runner is engaged as an <strong className="text-foreground">independent contractor</strong>, not an employee of MaceyRunners.</li>
              <li>The Runner is free to accept or decline any delivery or errand offered through the platform.</li>
              <li>The Runner may work for other delivery services simultaneously, provided it does not interfere with active MaceyRunners orders.</li>
              <li>MaceyRunners does not guarantee a minimum number of deliveries or earnings.</li>
            </ul>
          </section>

          {/* Revenue Split */}
          <section>
            <h2 className="font-display text-2xl font-bold text-foreground border-l-4 border-primary pl-4">3. Compensation — 60/40 Revenue Split</h2>
            <div className="bg-card border border-border/50 rounded-xl p-6 space-y-4">
              <p className="text-muted-foreground">The Runner shall receive <strong className="text-foreground">60% (sixty percent)</strong> of the total delivery or errand fee for each completed order. MaceyRunners retains <strong className="text-foreground">40% (forty percent)</strong> to cover platform operations, technology, marketing, and administrative costs.</p>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-sm font-display text-foreground">Service</th>
                      <th className="text-center p-3 text-sm font-display text-foreground">Base Fee</th>
                      <th className="text-center p-3 text-sm font-display text-foreground">Runner (60%)</th>
                      <th className="text-center p-3 text-sm font-display text-foreground">Company (40%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/30">
                      <td className="p-3 text-muted-foreground">Delivery</td>
                      <td className="p-3 text-center text-foreground">$700 GYD</td>
                      <td className="p-3 text-center font-semibold text-foreground">$420 GYD</td>
                      <td className="p-3 text-center text-primary">$280 GYD</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-muted-foreground">Errand</td>
                      <td className="p-3 text-center text-foreground">$1,000 GYD</td>
                      <td className="p-3 text-center font-semibold text-foreground">$600 GYD</td>
                      <td className="p-3 text-center text-primary">$400 GYD</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-muted-foreground">* Fees increase with distance at $150 GYD/km. The split applies to the total fee regardless of distance surcharges.</p>
            </div>
          </section>

          {/* Delivery Standards */}
          <section>
            <h2 className="font-display text-2xl font-bold text-foreground border-l-4 border-primary pl-4">4. Delivery Time Standards & Guarantee</h2>
            <div className="space-y-4">
              <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-5">
                <h3 className="font-display font-bold text-foreground mb-2">⚠️ Critical Policy</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  The average delivery time target is <strong className="text-foreground">15–30 minutes</strong> from order acceptance. If a delivery exceeds this timeframe and the Runner <strong className="text-foreground">fails to communicate</strong> a logical reason for the delay to both the customer and the MaceyRunners admin team:
                </p>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li>🔴 The <strong className="text-foreground">customer's delivery will be FREE</strong> — the delivery fee is fully waived.</li>
                  <li>🔴 The <strong className="text-foreground">Runner will receive NO compensation</strong> for that delivery.</li>
                  <li>🔴 Repeated violations will result in <strong className="text-foreground">performance review and potential deactivation</strong>.</li>
                </ul>
              </div>
              <div className="bg-card border border-border/50 rounded-xl p-5">
                <h3 className="font-display font-bold text-foreground mb-2">✅ Acceptable Delay Reasons</h3>
                <p className="text-muted-foreground text-sm">The following reasons may be accepted if communicated promptly to admin and customer:</p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>• Traffic congestion or road closures</li>
                  <li>• Severe weather conditions</li>
                  <li>• Long wait times at pickup location (restaurant/store)</li>
                  <li>• Incorrect address provided by customer (documented in chat)</li>
                  <li>• Vehicle breakdown (with proof)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Runner Obligations */}
          <section>
            <h2 className="font-display text-2xl font-bold text-foreground border-l-4 border-primary pl-4">5. Runner Obligations</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li><strong className="text-foreground">5.1 Professional Conduct:</strong> The Runner shall conduct themselves in a professional and courteous manner at all times when interacting with customers, merchants, and MaceyRunners staff.</li>
              <li><strong className="text-foreground">5.2 Communication:</strong> The Runner must maintain an active phone/data connection during active deliveries and respond to customer/admin messages within 2 minutes.</li>
              <li><strong className="text-foreground">5.3 Location Sharing:</strong> The Runner must keep real-time GPS location sharing active during all active orders for customer tracking purposes.</li>
              <li><strong className="text-foreground">5.4 Item Care:</strong> The Runner is responsible for the safe and secure transport of all items. Damaged, lost, or tampered items are the Runner's liability and may result in deductions from future earnings.</li>
              <li><strong className="text-foreground">5.5 Cash Handling:</strong> For Cash on Delivery orders, the Runner must collect the full amount and remit MaceyRunners' 40% share within 24 hours via MMG or approved payment method.</li>
              <li><strong className="text-foreground">5.6 No Substance Use:</strong> The Runner shall not operate under the influence of alcohol or any controlled substance while performing deliveries.</li>
              <li><strong className="text-foreground">5.7 Dress Code:</strong> While formal uniforms are not required, Runners must present a clean and presentable appearance. MaceyRunners-branded items (when provided) should be worn during deliveries.</li>
            </ul>
          </section>

          {/* Company Obligations */}
          <section>
            <h2 className="font-display text-2xl font-bold text-foreground border-l-4 border-primary pl-4">6. MaceyRunners Obligations</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>Provide a functional and reliable technology platform for order management</li>
              <li>Process and distribute Runner earnings promptly</li>
              <li>Provide customer support to resolve disputes fairly</li>
              <li>Maintain transparency in fee calculations and deductions</li>
              <li>Offer mentorship and growth opportunities within the organization</li>
            </ul>
          </section>

          {/* Deactivation */}
          <section>
            <h2 className="font-display text-2xl font-bold text-foreground border-l-4 border-primary pl-4">7. Grounds for Deactivation</h2>
            <p className="text-muted-foreground mb-3">MaceyRunners reserves the right to temporarily suspend or permanently deactivate a Runner for:</p>
            <ul className="space-y-2 text-muted-foreground">
              <li>🔴 Consistent failure to meet delivery time standards without communication</li>
              <li>🔴 Customer rating consistently below 3.0 stars</li>
              <li>🔴 Theft, fraud, or dishonest behavior</li>
              <li>🔴 Physical or verbal abuse toward customers, merchants, or staff</li>
              <li>🔴 Operating under the influence of substances</li>
              <li>🔴 Sharing customer personal information with unauthorized parties</li>
              <li>🔴 Manipulating GPS location or delivery status</li>
              <li>🔴 Failure to remit cash collections within 24 hours</li>
              <li>🔴 Three or more unexcused late deliveries within a 7-day period</li>
            </ul>
          </section>

          {/* Confidentiality */}
          <section>
            <h2 className="font-display text-2xl font-bold text-foreground border-l-4 border-primary pl-4">8. Confidentiality & Data Protection</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Runner agrees to maintain strict confidentiality of all customer information including names, phone numbers, addresses, and order details. Customer data shall only be used for the purpose of completing active deliveries and must never be stored, shared, or used for personal gain. Violation of this clause constitutes grounds for immediate deactivation and may result in legal action.
            </p>
          </section>

          {/* Dispute Resolution */}
          <section>
            <h2 className="font-display text-2xl font-bold text-foreground border-l-4 border-primary pl-4">9. Dispute Resolution</h2>
            <p className="text-muted-foreground leading-relaxed">
              Any disputes arising from this Agreement shall first be addressed through MaceyRunners' internal mediation process. The Runner may raise concerns with the Operations Manager within 48 hours of the incident. If unresolved, disputes shall be escalated to the Founder/CEO for final determination. Both parties agree to act in good faith to resolve issues amicably before pursuing external remedies.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="font-display text-2xl font-bold text-foreground border-l-4 border-primary pl-4">10. Termination</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>Either party may terminate this Agreement at any time with 7 days' written notice.</li>
              <li>MaceyRunners may terminate immediately in cases of gross misconduct as outlined in Section 7.</li>
              <li>Upon termination, the Runner must settle all outstanding cash collections within 48 hours.</li>
              <li>The Runner shall immediately cease use of any MaceyRunners-branded materials upon termination.</li>
            </ul>
          </section>

          {/* Amendments */}
          <section>
            <h2 className="font-display text-2xl font-bold text-foreground border-l-4 border-primary pl-4">11. Amendments</h2>
            <p className="text-muted-foreground leading-relaxed">
              MaceyRunners reserves the right to amend this Agreement with 14 days' notice to the Runner. Continued acceptance of deliveries after the notice period constitutes acceptance of the amended terms. Runners who do not accept amended terms may terminate this Agreement without penalty.
            </p>
          </section>

          {/* Acknowledgment */}
          <section className="bg-card border border-border/50 rounded-2xl p-8">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">Acknowledgment</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              By accepting deliveries through the MaceyRunners platform, I acknowledge that I have read, understood, and agree to all terms and conditions outlined in this Agreement. I understand the 60/40 revenue split, the delivery time guarantee policy, and the grounds for deactivation.
            </p>
            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-border">
              <div>
                <p className="text-sm text-muted-foreground mb-8">Runner Signature</p>
                <div className="border-b border-foreground w-full mb-2" />
                <p className="text-xs text-muted-foreground">Name & Date</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-8">MaceyRunners Representative</p>
                <div className="border-b border-foreground w-full mb-2" />
                <p className="text-xs text-muted-foreground">Name, Title & Date</p>
              </div>
            </div>
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

export default RiderAgreement;
