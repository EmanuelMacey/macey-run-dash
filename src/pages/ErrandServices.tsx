import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight, ShoppingCart, Pill, Landmark, Briefcase, DollarSign, Mail, Stethoscope, Sparkles, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBell from "@/components/customer/NotificationBell";

const ERRAND_CATEGORIES = [
  {
    id: "supermarket",
    icon: ShoppingCart,
    emoji: "🛍️",
    title: "Supermarket Shopping",
    subtitle: "We'll shop for you at any supermarket",
    locations: "Massy Stores • Bounty • DSL • Survival • Nigel's • Chow's • Little Asia & more",
    rate: 2000,
    color: "from-accent to-accent/80",
  },
  {
    id: "pharmacy",
    icon: Pill,
    emoji: "💊",
    title: "Pharmacy Errands",
    subtitle: "Pick up prescriptions & pharmacy items",
    locations: "Mike's Pharmacy • Medicine Chest • Smart Aid 24hr • Dave's • Essential Care & more",
    rate: 2000,
    color: "from-destructive/80 to-destructive/60",
  },
  {
    id: "government",
    icon: Landmark,
    emoji: "🏛️",
    title: "Government Errands",
    subtitle: "GRA, NIS, GRO, Police services",
    locations: "GRA • NIS • GRO • Police Stations • Courts & more",
    rate: 1500,
    color: "from-primary to-primary/80",
  },
  {
    id: "business",
    icon: Briefcase,
    emoji: "💼",
    title: "Business Errands",
    subtitle: "Invoice payments, document delivery, corporate tasks",
    locations: "Banks • Offices • Business centres & more",
    rate: 2000,
    color: "from-secondary to-secondary/80",
  },
  {
    id: "financial",
    icon: DollarSign,
    emoji: "💰",
    title: "Financial / Transactions",
    subtitle: "Bill payments, bank errands, MMG transactions",
    locations: "Banks • GPL • GWI • Bill pay centres & more",
    rate: 1500,
    color: "from-accent to-warning",
  },
  {
    id: "mail",
    icon: Mail,
    emoji: "📮",
    title: "Mail / Post Office",
    subtitle: "DHL, FedEx, Post Office, Bond clearance",
    locations: "DHL • FedEx • Post Office • Customs & more",
    rate: 2000,
    color: "from-primary/80 to-accent/80",
  },
  {
    id: "medical",
    icon: Stethoscope,
    emoji: "⚕️",
    title: "Medical Errands",
    subtitle: "Prescription pickup, pharmacy delivery, lab results",
    locations: "Hospitals • Clinics • Labs • Pharmacies & more",
    rate: 2000,
    color: "from-success to-success/80",
  },
  {
    id: "shopping",
    icon: ShoppingCart,
    emoji: "🛒",
    title: "Shopping Errands",
    subtitle: "Custom purchases, grocery pickup, market runs",
    locations: "Markets • Stores • Shops & more",
    rate: 2000,
    color: "from-accent/90 to-accent/60",
  },
  {
    id: "package",
    icon: Package,
    emoji: "📦",
    title: "Package Delivery",
    subtitle: "Send parcels anywhere in Georgetown",
    locations: "Door to door delivery across GT",
    rate: 1000,
    color: "from-primary/70 to-accent/70",
  },
  {
    id: "custom",
    icon: Sparkles,
    emoji: "✨",
    title: "Custom Errands",
    subtitle: "Describe your custom errand request",
    locations: "Anything you need, we'll handle it",
    rate: 1500,
    color: "from-accent to-primary",
  },
];

const ErrandServices = () => {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);

  const popular = ERRAND_CATEGORIES.slice(0, 2);
  const allCategories = ERRAND_CATEGORIES.slice(2);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-br from-accent via-accent to-accent/85 text-accent-foreground safe-top">
        <div className="container mx-auto px-4 pt-4 pb-6">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigate("/dashboard")} className="flex items-center gap-1 text-accent-foreground/80 hover:text-accent-foreground text-sm font-medium">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <NotificationBell />
            </div>
          </div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl font-extrabold">Errand Services</h1>
            <p className="text-accent-foreground/80 text-sm mt-1">We'll handle your errands so you don't have to</p>
          </motion.div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Most Popular */}
        <section>
          <h2 className="font-display text-xl font-bold text-foreground mb-3">Most Popular</h2>
          <div className="space-y-3">
            {popular.map((cat, i) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => navigate(`/errands/${cat.id}`)}
                className="w-full bg-card rounded-2xl border-2 border-accent/30 p-5 text-left hover:border-accent hover:shadow-xl transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-2xl shrink-0">
                    {cat.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-lg text-card-foreground group-hover:text-accent transition-colors">{cat.title}</h3>
                    <p className="text-muted-foreground text-sm mt-0.5">{cat.subtitle}</p>
                    <p className="text-muted-foreground text-xs mt-2 flex items-start gap-1">
                      <span className="shrink-0">📍</span> {cat.locations}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-bold">
                        Fixed Rate: GYD${cat.rate.toLocaleString()}
                      </span>
                      <ChevronRight className="h-5 w-5 text-accent" />
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* All Categories Grid */}
        <section>
          <h2 className="font-display text-xl font-bold text-foreground mb-3">All Errand Categories</h2>
          <div className="grid grid-cols-2 gap-3">
            {(showAll ? allCategories : allCategories.slice(0, 4)).map((cat, i) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/errands/${cat.id}`)}
                className="bg-card rounded-2xl border border-border/50 p-4 text-center hover:border-accent/40 hover:shadow-lg transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3 text-2xl group-hover:scale-110 transition-transform">
                  {cat.emoji}
                </div>
                <h3 className="font-display font-bold text-sm text-card-foreground">{cat.title}</h3>
                <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{cat.subtitle}</p>
              </motion.button>
            ))}
          </div>
          {!showAll && allCategories.length > 4 && (
            <button onClick={() => setShowAll(true)} className="w-full mt-3 text-accent font-semibold text-sm py-2">
              Show all categories →
            </button>
          )}
        </section>

        {/* My Errands CTA */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => navigate("/dashboard")}
          className="w-full bg-card rounded-2xl border border-border/50 p-5 flex flex-col items-center gap-2 hover:border-accent/40 transition-all"
        >
          <span className="text-3xl">📋</span>
          <span className="font-display font-bold text-foreground">My Errands</span>
          <span className="text-muted-foreground text-xs">View your active & past errands</span>
        </motion.button>
      </main>
    </div>
  );
};

export { ERRAND_CATEGORIES };
export default ErrandServices;
