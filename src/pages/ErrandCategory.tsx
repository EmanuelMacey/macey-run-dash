import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight, Clock } from "lucide-react";
import { ERRAND_CATEGORIES } from "./ErrandServices";
import { useState } from "react";
import ErrandWizard from "@/components/customer/ErrandWizard";

// Pre-defined services per category
const CATEGORY_SERVICES: Record<string, Array<{ name: string; description: string; price: number; est: string }>> = {
  supermarket: [
    { name: "Grocery Shopping", description: "Full grocery list shopping at any supermarket", price: 2000, est: "1-2 hours" },
    { name: "Quick Pickup", description: "Pick up a few specific items", price: 1500, est: "30-60 min" },
    { name: "Bulk Shopping", description: "Large quantity shopping for events or stocking up", price: 3000, est: "2-3 hours" },
  ],
  pharmacy: [
    { name: "Prescription Pickup", description: "Pick up your prescription from any pharmacy", price: 2000, est: "30-60 min" },
    { name: "OTC Medicine Pickup", description: "Buy over-the-counter medicines for you", price: 1500, est: "30-60 min" },
    { name: "Medical Supplies", description: "Purchase medical supplies and equipment", price: 2000, est: "1-2 hours" },
  ],
  government: [
    { name: "GRA - TIN Application Pickup", description: "Pick up TIN application from GRA", price: 1500, est: "1-2 hours" },
    { name: "GRA - License Renewal Drop-off", description: "Drop off license renewal documents at GRA", price: 1200, est: "1-2 hours" },
    { name: "GRA - License Sticker Pickup", description: "Pick up license sticker from GRA", price: 1500, est: "1-2 hours" },
    { name: "GRA - Filing Documents", description: "File documents at GRA office", price: 1200, est: "1-2 hours" },
    { name: "NIS - Submit Documents", description: "Submit NIS-related documents", price: 1500, est: "1-2 hours" },
    { name: "GRO - Certificate Pickup", description: "Pick up birth/death/marriage certificate", price: 1500, est: "1-2 hours" },
    { name: "Police Clearance", description: "Apply for or pick up police clearance", price: 2000, est: "2-3 hours" },
  ],
  business: [
    { name: "Invoice Delivery", description: "Deliver invoices to clients or suppliers", price: 1500, est: "1-2 hours" },
    { name: "Document Delivery", description: "Deliver or pick up business documents", price: 1500, est: "1-2 hours" },
    { name: "Office Supplies", description: "Pick up office supplies from stores", price: 2000, est: "1-2 hours" },
    { name: "Bank Errands", description: "Handle bank deposits, withdrawals, or queries", price: 2000, est: "1-2 hours" },
  ],
  financial: [
    { name: "Bill Payments - GPL", description: "Pay your GPL electricity bill", price: 1500, est: "30-60 min" },
    { name: "Bill Payments - GWI", description: "Pay your GWI water bill", price: 1500, est: "30-60 min" },
    { name: "Bank Deposit", description: "Make a bank deposit on your behalf", price: 2000, est: "1-2 hours" },
    { name: "MMG Transaction", description: "Complete an MMG mobile money transaction", price: 1500, est: "30-60 min" },
  ],
  mail: [
    { name: "DHL Pickup/Drop-off", description: "Pick up or drop off DHL packages", price: 2000, est: "1-2 hours" },
    { name: "FedEx Pickup/Drop-off", description: "Pick up or drop off FedEx packages", price: 2000, est: "1-2 hours" },
    { name: "Post Office Errand", description: "Handle post office tasks - stamps, mail, etc.", price: 1500, est: "1-2 hours" },
    { name: "Bond Clearance", description: "Clear packages from customs bond", price: 3000, est: "2-4 hours" },
  ],
  medical: [
    { name: "Prescription Pickup", description: "Pick up prescriptions from hospital/clinic", price: 2000, est: "1-2 hours" },
    { name: "Lab Results Pickup", description: "Collect lab results from medical facility", price: 1500, est: "30-60 min" },
    { name: "Medical Appointment Check-in", description: "Pick up appointment cards or referrals", price: 2000, est: "1-2 hours" },
  ],
  shopping: [
    { name: "Market Run", description: "Shop at Stabroek or Bourda market", price: 2000, est: "1-2 hours" },
    { name: "Custom Purchase", description: "Buy specific items from any store", price: 2000, est: "1-2 hours" },
    { name: "Gift Shopping", description: "Shop for gifts based on your instructions", price: 2500, est: "1-3 hours" },
  ],
  package: [
    { name: "Standard Delivery", description: "Deliver a package within Georgetown", price: 1000, est: "30-60 min" },
    { name: "Express Delivery", description: "Priority delivery with fastest runner", price: 1500, est: "15-30 min" },
    { name: "Multi-stop Delivery", description: "Deliver to multiple locations in one trip", price: 2500, est: "1-2 hours" },
  ],
  custom: [
    { name: "Custom Errand", description: "Describe your custom errand and we'll handle it", price: 1500, est: "Varies" },
    { name: "Recurring Errand", description: "Set up a regularly scheduled errand", price: 2000, est: "Varies" },
  ],
};

const ErrandCategory = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<(typeof CATEGORY_SERVICES)[string][number] | null>(null);

  const category = ERRAND_CATEGORIES.find(c => c.id === categoryId);
  const services = CATEGORY_SERVICES[categoryId || ""] || [];

  if (!category) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Category not found</p>
          <button onClick={() => navigate("/errands")} className="text-accent font-semibold mt-2">Go back</button>
        </div>
      </div>
    );
  }

  if (selectedService) {
    return (
      <ErrandWizard
        category={category}
        service={selectedService}
        onBack={() => setSelectedService(null)}
        onComplete={() => navigate("/dashboard")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero header */}
      <header className="bg-gradient-to-br from-accent via-accent to-accent/85 text-accent-foreground safe-top">
        <div className="container mx-auto px-4 pt-4 pb-8">
          <button onClick={() => navigate("/errands")} className="flex items-center gap-1 text-accent-foreground/80 hover:text-accent-foreground text-sm font-medium mb-6">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center"
          >
            <div className="text-5xl mb-3">{category.emoji}</div>
            <h1 className="font-display text-3xl font-extrabold">{category.title}</h1>
            <p className="text-accent-foreground/80 text-sm mt-1">{category.locations}</p>
          </motion.div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <h2 className="font-display text-xl font-bold text-foreground mb-4">Select a Service</h2>
        <div className="space-y-3">
          {services.map((service, i) => (
            <motion.button
              key={service.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedService(service)}
              className="w-full bg-card rounded-2xl border border-border/50 p-5 text-left hover:border-accent/40 hover:shadow-lg transition-all group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-display font-bold text-base text-card-foreground group-hover:text-accent transition-colors">{service.name}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{service.description}</p>
                  <div className="flex items-center gap-1 mt-2 text-muted-foreground text-xs">
                    <Clock className="h-3 w-3" /> Est. {service.est}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="inline-block px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-bold">
                    GYD ${service.price.toLocaleString()}
                  </span>
                  <span className="text-accent text-sm font-semibold flex items-center gap-0.5">
                    Select <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ErrandCategory;
