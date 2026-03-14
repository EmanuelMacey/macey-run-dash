import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight, Clock } from "lucide-react";
import { ERRAND_CATEGORIES } from "./ErrandServices";
import { useState } from "react";
import ErrandWizard from "@/components/customer/ErrandWizard";

// Pre-defined services per category
const CATEGORY_SERVICES: Record<string, Array<{ name: string; description: string; price: number; est: string; tier: "standard" | "premium" }>> = {
  supermarket: [
    { name: "Grocery Shopping", description: "Full grocery list shopping at any supermarket", price: 1500, est: "1-2 hours", tier: "premium" },
    { name: "Quick Pickup (1-5 items)", description: "Pick up a few specific items quickly", price: 1200, est: "20-40 min", tier: "standard" },
    { name: "Weekly Grocery Run", description: "Complete weekly grocery shopping from your list", price: 1500, est: "1-2 hours", tier: "premium" },
    { name: "Bulk Shopping", description: "Large quantity shopping for events or stocking up", price: 1500, est: "2-3 hours", tier: "premium" },
    { name: "Baby Supplies Run", description: "Diapers, formula, baby food & essentials", price: 1200, est: "30-60 min", tier: "standard" },
    { name: "Household Supplies", description: "Cleaning products, toiletries, household items", price: 1200, est: "30-60 min", tier: "standard" },
    { name: "Beverage & Snack Run", description: "Drinks, snacks, ice & party supplies", price: 1200, est: "20-40 min", tier: "standard" },
    { name: "Fresh Produce Only", description: "Fruits, vegetables & fresh items from market", price: 1200, est: "30-60 min", tier: "standard" },
  ],
  pharmacy: [
    { name: "Prescription Pickup", description: "Pick up your prescription from any pharmacy", price: 1200, est: "30-60 min", tier: "standard" },
    { name: "OTC Medicine Pickup", description: "Buy over-the-counter medicines for you", price: 1200, est: "20-40 min", tier: "standard" },
    { name: "Medical Supplies", description: "Purchase medical supplies and equipment", price: 1500, est: "1-2 hours", tier: "premium" },
    { name: "Vitamins & Supplements", description: "Pick up vitamins, supplements & health products", price: 1200, est: "20-40 min", tier: "standard" },
    { name: "First Aid Supplies", description: "Bandages, antiseptic, first aid kit items", price: 1200, est: "20-40 min", tier: "standard" },
    { name: "Baby & Child Medicine", description: "Children's medications, thermometers, etc.", price: 1200, est: "30-60 min", tier: "standard" },
    { name: "Pharmacy Multi-stop", description: "Visit multiple pharmacies to find specific items", price: 1500, est: "1-2 hours", tier: "premium" },
  ],
  government: [
    { name: "GRA - TIN Application Pickup", description: "Pick up TIN application from GRA", price: 1500, est: "1-2 hours", tier: "premium" },
    { name: "GRA - License Renewal Drop-off", description: "Drop off license renewal documents at GRA", price: 1200, est: "1-2 hours", tier: "standard" },
    { name: "GRA - License Sticker Pickup", description: "Pick up license sticker from GRA", price: 1500, est: "1-2 hours", tier: "premium" },
    { name: "GRA - Filing Documents", description: "File documents at GRA office", price: 1200, est: "1-2 hours", tier: "standard" },
    { name: "GRA - Tax Payment", description: "Make tax payments at GRA on your behalf", price: 1500, est: "1-2 hours", tier: "premium" },
    { name: "NIS - Submit Documents", description: "Submit NIS-related documents", price: 1200, est: "1-2 hours", tier: "standard" },
    { name: "NIS - Card Collection", description: "Collect NIS card or replacement card", price: 1200, est: "1-2 hours", tier: "standard" },
    { name: "GRO - Certificate Pickup", description: "Pick up birth/death/marriage certificate", price: 1200, est: "1-2 hours", tier: "standard" },
    { name: "GRO - Certificate Application", description: "Submit application for birth/death/marriage certificate", price: 1500, est: "2-3 hours", tier: "premium" },
    { name: "Police Clearance - Apply", description: "Submit application for police clearance", price: 1500, est: "2-3 hours", tier: "premium" },
    { name: "Police Clearance - Pickup", description: "Collect completed police clearance certificate", price: 1200, est: "1-2 hours", tier: "standard" },
    { name: "Passport Office Errand", description: "Submit or collect passport documents", price: 1500, est: "2-4 hours", tier: "premium" },
    { name: "Court Filing", description: "File documents at the court registry", price: 1500, est: "2-3 hours", tier: "premium" },
  ],
  business: [
    { name: "Invoice Delivery", description: "Deliver invoices to clients or suppliers", price: 1200, est: "30-60 min", tier: "standard" },
    { name: "Document Delivery", description: "Deliver or pick up business documents", price: 1200, est: "30-60 min", tier: "standard" },
    { name: "Office Supplies Pickup", description: "Pick up office supplies from stores", price: 1500, est: "1-2 hours", tier: "premium" },
    { name: "Bank Deposit", description: "Make a bank deposit on your behalf", price: 1500, est: "1-2 hours", tier: "premium" },
    { name: "Bank Withdrawal", description: "Withdraw cash from the bank for you", price: 1500, est: "1-2 hours", tier: "premium" },
    { name: "Cheque Drop-off", description: "Deliver or deposit cheques at the bank", price: 1200, est: "30-60 min", tier: "standard" },
    { name: "Contract/Agreement Delivery", description: "Deliver contracts for signing and return", price: 1500, est: "1-2 hours", tier: "premium" },
    { name: "Notarize Documents", description: "Get documents notarized at a JP or notary", price: 1500, est: "1-3 hours", tier: "premium" },
    { name: "Company Registration Errand", description: "Submit or collect company registration documents", price: 1500, est: "2-4 hours", tier: "premium" },
  ],
  financial: [
    { name: "GPL Bill Payment", description: "Pay your GPL electricity bill at any location", price: 1200, est: "30-60 min", tier: "standard" },
    { name: "GWI Bill Payment", description: "Pay your GWI water bill", price: 1200, est: "30-60 min", tier: "standard" },
    { name: "GTT/Digicel Top-up", description: "Purchase phone credit or data plans", price: 1200, est: "15-30 min", tier: "standard" },
    { name: "Bank Deposit", description: "Make a bank deposit on your behalf", price: 1500, est: "1-2 hours", tier: "premium" },
    { name: "MMG Transaction", description: "Complete an MMG mobile money transaction", price: 1200, est: "30-60 min", tier: "standard" },
    { name: "Insurance Payment", description: "Pay insurance premiums at office or bank", price: 1200, est: "1-2 hours", tier: "standard" },
    { name: "Loan Payment", description: "Make loan payments at the bank or credit union", price: 1500, est: "1-2 hours", tier: "premium" },
    { name: "Money Transfer", description: "Send money via Western Union, MoneyGram, etc.", price: 1500, est: "1-2 hours", tier: "premium" },
    { name: "Multi-bill Payment", description: "Pay multiple bills in one errand run", price: 1500, est: "1-3 hours", tier: "premium" },
  ],
  mail: [
    { name: "DHL Pickup", description: "Pick up a DHL package for you", price: 1500, est: "1-2 hours", tier: "premium" },
    { name: "DHL Drop-off", description: "Drop off a package at DHL for shipping", price: 1200, est: "30-60 min", tier: "standard" },
    { name: "FedEx Pickup", description: "Pick up a FedEx package", price: 1500, est: "1-2 hours", tier: "premium" },
    { name: "FedEx Drop-off", description: "Drop off a package at FedEx", price: 1200, est: "30-60 min", tier: "standard" },
    { name: "Post Office - Send Mail", description: "Send letters or parcels via post office", price: 1200, est: "30-60 min", tier: "standard" },
    { name: "Post Office - Collect Mail", description: "Collect mail from your PO Box", price: 1200, est: "30-60 min", tier: "standard" },
    { name: "Bond Clearance (Small)", description: "Clear small packages from customs bond", price: 1500, est: "2-4 hours", tier: "premium" },
    { name: "Bond Clearance (Large)", description: "Clear large shipments from customs bond", price: 1500, est: "3-5 hours", tier: "premium" },
    { name: "Courier Service", description: "Same-day document courier within Georgetown", price: 1200, est: "30-60 min", tier: "standard" },
  ],
  medical: [
    { name: "Prescription Pickup - Hospital", description: "Pick up prescriptions from GPHC or any hospital", price: 1500, est: "1-2 hours", tier: "premium" },
    { name: "Prescription Pickup - Clinic", description: "Pick up prescriptions from private clinic", price: 1200, est: "30-60 min", tier: "standard" },
    { name: "Lab Results Pickup", description: "Collect lab results from medical facility", price: 1200, est: "30-60 min", tier: "standard" },
    { name: "Medical Appointment Check-in", description: "Pick up appointment cards or referrals", price: 1500, est: "1-2 hours", tier: "premium" },
    { name: "X-ray/Scan Collection", description: "Collect X-ray films, MRI scans, or reports", price: 1200, est: "30-60 min", tier: "standard" },
    { name: "Blood Test Scheduling", description: "Schedule and collect blood test kits or results", price: 1500, est: "1-2 hours", tier: "premium" },
    { name: "Medical Equipment Pickup", description: "Pick up crutches, braces, or medical devices", price: 1500, est: "1-2 hours", tier: "premium" },
    { name: "Eyeglasses/Contacts Pickup", description: "Collect prescription glasses or contacts", price: 1200, est: "30-60 min", tier: "standard" },
  ],
  shopping: [
    { name: "Stabroek Market Run", description: "Shop at Stabroek Market for specific items", price: 1500, est: "1-2 hours", tier: "premium" },
    { name: "Bourda Market Run", description: "Shop at Bourda Market for fresh produce & goods", price: 1500, est: "1-2 hours", tier: "premium" },
    { name: "Custom Store Purchase", description: "Buy specific items from any named store", price: 1200, est: "30-60 min", tier: "standard" },
    { name: "Gift Shopping", description: "Shop for gifts based on your instructions & budget", price: 1500, est: "1-3 hours", tier: "premium" },
    { name: "Clothing Shopping", description: "Purchase clothing items based on specifications", price: 1500, est: "1-3 hours", tier: "premium" },
    { name: "Electronics Pickup", description: "Purchase or pick up electronics from stores", price: 1500, est: "1-2 hours", tier: "premium" },
    { name: "Hardware Store Run", description: "Buy tools, paint, building materials, etc.", price: 1500, est: "1-2 hours", tier: "premium" },
    { name: "Pet Supplies", description: "Buy pet food, accessories & supplies", price: 1200, est: "30-60 min", tier: "standard" },
    { name: "School Supplies", description: "Purchase textbooks, uniforms & stationery", price: 1500, est: "1-2 hours", tier: "premium" },
    { name: "Multi-store Shopping", description: "Shop at multiple stores in one trip", price: 1500, est: "2-4 hours", tier: "premium" },
  ],
  package: [
    { name: "Standard Delivery", description: "Deliver a package within Georgetown", price: 1200, est: "30-60 min", tier: "standard" },
    { name: "Express Delivery", description: "Priority delivery with fastest runner", price: 1500, est: "15-30 min", tier: "premium" },
    { name: "Same-day Delivery (EBD)", description: "Deliver within East Bank Demerara", price: 1200, est: "1-2 hours", tier: "standard" },
    { name: "Same-day Delivery (ECD)", description: "Deliver within East Coast Demerara", price: 1500, est: "1-2 hours", tier: "premium" },
    { name: "Multi-stop Delivery", description: "Deliver to multiple locations in one trip", price: 1500, est: "1-3 hours", tier: "premium" },
    { name: "Fragile Item Delivery", description: "Careful delivery of fragile or delicate items", price: 1500, est: "30-60 min", tier: "premium" },
    { name: "Large Package Delivery", description: "Delivery of heavy or oversized items", price: 1500, est: "1-2 hours", tier: "premium" },
    { name: "Document Envelope", description: "Quick delivery of letters or thin documents", price: 1200, est: "15-30 min", tier: "standard" },
    { name: "Return Package", description: "Return an item to a store or individual", price: 1200, est: "30-60 min", tier: "standard" },
  ],
  custom: [
    { name: "Custom Errand", description: "Describe your custom errand and we'll handle it", price: 1200, est: "Varies", tier: "standard" },
    { name: "Recurring Daily Errand", description: "Set up a daily recurring errand task", price: 1500, est: "Varies", tier: "premium" },
    { name: "Recurring Weekly Errand", description: "Set up a weekly recurring errand task", price: 1500, est: "Varies", tier: "premium" },
    { name: "Personal Assistant (1hr)", description: "A runner at your service for 1 hour", price: 1500, est: "1 hour", tier: "premium" },
    { name: "Personal Assistant (2hr)", description: "A runner at your service for 2 hours", price: 1500, est: "2 hours", tier: "premium" },
    { name: "Queue/Line Waiting", description: "We wait in line so you don't have to", price: 1500, est: "1-3 hours", tier: "premium" },
    { name: "Key Pickup/Drop-off", description: "Collect or deliver keys for property/vehicle", price: 1200, est: "30-60 min", tier: "standard" },
    { name: "Vehicle Errand", description: "Car wash, fuel up, or tire shop errand", price: 1500, est: "1-2 hours", tier: "premium" },
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
