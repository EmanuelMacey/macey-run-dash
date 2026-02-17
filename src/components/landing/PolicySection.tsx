import { Shield, Clock, AlertTriangle, CreditCard } from "lucide-react";

const policies = [
  {
    icon: Clock,
    title: "Delivery Times",
    description: "We aim to deliver within 15-45 minutes depending on distance. Delays due to weather or traffic are communicated promptly.",
  },
  {
    icon: CreditCard,
    title: "Payment Policy",
    description: "We accept Cash on Delivery and MMG mobile payments. Payment is due upon delivery unless pre-paid via MMG.",
  },
  {
    icon: AlertTriangle,
    title: "Cancellation Policy",
    description: "Orders can be cancelled for free before a driver accepts. Once accepted, a cancellation fee may apply.",
  },
  {
    icon: Shield,
    title: "Privacy & Safety",
    description: "Your personal information is kept secure and never shared with third parties. All drivers are verified.",
  },
];

const PolicySection = () => {
  return (
    <section id="policies" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
            Our Policies
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Transparency and trust are at the core of MaceyRunners.
          </p>
        </div>

        <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-6">
          {policies.map(({ icon: Icon, title, description }) => (
            <div key={title} className="bg-card border border-border/50 rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PolicySection;
