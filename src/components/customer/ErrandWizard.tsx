import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, Navigation, Loader2, Paperclip, X, CheckCircle2, CreditCard, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import MMGPaymentPage from "./MMGPaymentPage";

const TOTAL_STEPS = 6;

interface ErrandWizardProps {
  category: { id: string; title: string; emoji: string };
  service: { name: string; description: string; price: number; est: string };
  onBack: () => void;
  onComplete: () => void;
}

const ErrandWizard = ({ category, service, onBack, onComplete }: ErrandWizardProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [locatingPickup, setLocatingPickup] = useState(false);
  const [locatingDropoff, setLocatingDropoff] = useState(false);

  // Form state
  const [instructions, setInstructions] = useState("");
  const [notes, setNotes] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [schedule, setSchedule] = useState<"asap" | "later">("asap");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [documents, setDocuments] = useState<File[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "mmg">("mmg");
  const [mmgStep, setMmgStep] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  const useCurrentLocation = async (target: "pickup" | "dropoff") => {
    const setLocating = target === "pickup" ? setLocatingPickup : setLocatingDropoff;
    setLocating(true);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true })
      );
      const { latitude, longitude } = pos.coords;
      if (target === "pickup") {
        setPickupCoords({ lat: latitude, lng: longitude });
      } else {
        setDropoffCoords({ lat: latitude, lng: longitude });
      }
      // Reverse geocode
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
      const data = await res.json();
      const addr = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      if (target === "pickup") setPickupAddress(addr);
      else setDropoffAddress(addr);
    } catch {
      toast.error("Could not get location. Please enter address manually.");
    } finally {
      setLocating(false);
    }
  };

  const canNext = () => {
    switch (step) {
      case 1: return instructions.trim().length >= 3;
      case 2: return pickupAddress.trim().length >= 3 && dropoffAddress.trim().length >= 3;
      case 3: return schedule === "asap" || (scheduledDate && scheduledTime);
      case 4: return true; // documents optional
      case 5: return true; // payment selected
      case 6: return true;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      let scheduledFor: string | null = null;
      if (schedule === "later" && scheduledDate && scheduledTime) {
        scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
      }

      const description = `[${category.title}] ${service.name}\n\nInstructions: ${instructions}${notes ? `\n\nNotes: ${notes}` : ""}`;

      const isMMG = paymentMethod === "mmg";

      const { data: orderData, error } = await supabase.from("orders").insert({
        customer_id: user.id,
        order_type: "errand" as const,
        pickup_address: pickupAddress,
        dropoff_address: dropoffAddress,
        description,
        payment_method: isMMG ? "mmg" : paymentMethod,
        price: service.price,
        status: "pending" as const,
        payment_status: "pending" as const,
        scheduled_for: scheduledFor,
      } as any).select("id").single();

      if (error) throw error;

      // Upload documents
      if (documents.length > 0 && orderData) {
        for (const file of documents) {
          const ext = file.name.split(".").pop();
          const path = `${user.id}/${orderData.id}/${Date.now()}.${ext}`;
          await supabase.storage.from("errand-attachments").upload(path, file);
        }
      }

      if (isMMG && orderData) {
        setCreatedOrderId(orderData.id);
        setMmgStep(true);
        toast.success("Errand created! Please complete MMG payment.");
      } else {
        toast.success("Errand submitted successfully! 🎉");
        onComplete();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to submit errand");
    } finally {
      setSubmitting(false);
    }
  };

  const stepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-5">
            <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">📝 Errand Details</h3>
            <div>
              <Label className="font-semibold">Instructions <span className="text-destructive">*</span></Label>
              <Textarea
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                placeholder="Provide detailed instructions for this errand..."
                className="mt-2 min-h-[120px] rounded-2xl bg-muted/30 border-border/50"
              />
            </div>
            <div>
              <Label className="font-semibold">Additional Notes (Optional)</Label>
              <Input
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any additional notes or preferences..."
                className="mt-2 rounded-2xl bg-muted/30 border-border/50"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-5">
            <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">📍 Pickup & Drop-off Locations</h3>
            <div className="space-y-3">
              <div>
                <Label className="font-semibold">Pickup Address <span className="text-destructive">*</span></Label>
                <p className="text-xs text-muted-foreground">Delivery Location</p>
                <Input
                  value={pickupAddress}
                  onChange={e => setPickupAddress(e.target.value)}
                  placeholder="Georgetown, Demerara-Mahaica, Guyana"
                  className="mt-2 rounded-2xl bg-muted/30 border-border/50"
                />
                {pickupCoords && (
                  <div className="mt-2 p-2 rounded-xl bg-muted/30 text-xs text-muted-foreground">
                    📍 Coordinates: <span className="text-accent font-mono">{pickupCoords.lat.toFixed(6)}, {pickupCoords.lng.toFixed(6)}</span>
                  </div>
                )}
                <Button
                  type="button"
                  onClick={() => useCurrentLocation("pickup")}
                  disabled={locatingPickup}
                  className="w-full mt-2 rounded-2xl bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
                >
                  {locatingPickup ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Navigation className="h-4 w-4 mr-2" />}
                  📍 Use Current Location
                </Button>
                <p className="text-xs text-muted-foreground mt-2">💡 Tip: Pin your exact location for accurate delivery</p>
              </div>

              <div className="pt-3">
                <Label className="font-semibold">Drop-off Address <span className="text-destructive">*</span></Label>
                <p className="text-xs text-muted-foreground">Delivery Location</p>
                <Input
                  value={dropoffAddress}
                  onChange={e => setDropoffAddress(e.target.value)}
                  placeholder="Enter drop-off address"
                  className="mt-2 rounded-2xl bg-muted/30 border-border/50"
                />
                {dropoffCoords && (
                  <div className="mt-2 p-2 rounded-xl bg-muted/30 text-xs text-muted-foreground">
                    📍 Coordinates: <span className="text-accent font-mono">{dropoffCoords.lat.toFixed(6)}, {dropoffCoords.lng.toFixed(6)}</span>
                  </div>
                )}
                <Button
                  type="button"
                  onClick={() => useCurrentLocation("dropoff")}
                  disabled={locatingDropoff}
                  variant="outline"
                  className="w-full mt-2 rounded-2xl border-accent/30 text-accent font-bold"
                >
                  {locatingDropoff ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Navigation className="h-4 w-4 mr-2" />}
                  📍 Use Current Location
                </Button>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-5">
            <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">⏰ Schedule</h3>
            <div className="space-y-3">
              <button
                onClick={() => setSchedule("asap")}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                  schedule === "asap" ? "border-accent bg-accent/5" : "border-border/50 bg-card"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    schedule === "asap" ? "border-accent" : "border-muted-foreground/40"
                  }`}>
                    {schedule === "asap" && <div className="w-2.5 h-2.5 rounded-full bg-accent" />}
                  </div>
                  <div>
                    <p className="font-display font-bold text-foreground">ASAP</p>
                    <p className="text-muted-foreground text-sm">Start this errand as soon as possible</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSchedule("later")}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                  schedule === "later" ? "border-accent bg-accent/5" : "border-border/50 bg-card"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    schedule === "later" ? "border-accent" : "border-muted-foreground/40"
                  }`}>
                    {schedule === "later" && <div className="w-2.5 h-2.5 rounded-full bg-accent" />}
                  </div>
                  <div>
                    <p className="font-display font-bold text-foreground">Schedule for Later</p>
                    <p className="text-muted-foreground text-sm">Choose a specific date and time</p>
                  </div>
                </div>
              </button>

              {schedule === "later" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="grid grid-cols-2 gap-3 pt-2"
                >
                  <Input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} min={new Date().toISOString().split("T")[0]} className="rounded-2xl" />
                  <Input type="time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} className="rounded-2xl" />
                </motion.div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-5">
            <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">📎 Documents (Optional)</h3>
            <p className="text-muted-foreground text-sm">Upload any relevant documents (PDF, images, Word). Max 10MB per file.</p>

            <label className="flex items-center justify-center border-2 border-dashed border-accent/40 rounded-2xl p-6 cursor-pointer hover:border-accent transition-colors">
              <span className="text-accent font-semibold">+ Add Document</span>
              <input
                type="file"
                accept="image/*,.pdf,.doc,.docx"
                className="hidden"
                multiple
                onChange={e => {
                  const files = Array.from(e.target.files || []);
                  setDocuments(prev => [...prev, ...files]);
                }}
              />
            </label>

            {documents.length > 0 ? (
              <div className="space-y-2">
                {documents.map((file, i) => (
                  <div key={i} className="flex items-center gap-2 bg-muted/30 rounded-xl p-3">
                    <Paperclip className="h-4 w-4 text-accent shrink-0" />
                    <span className="text-sm text-foreground truncate flex-1">{file.name}</span>
                    <button onClick={() => setDocuments(d => d.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground text-sm">No documents added</p>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-5">
            <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">💳 Payment Method</h3>
            <p className="text-muted-foreground text-sm">Select how you'd like to pay for this errand</p>

            <button
              onClick={() => setPaymentMethod("mmg")}
              className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                paymentMethod === "mmg" ? "border-accent bg-accent/5" : "border-border/50 bg-card"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-display font-bold text-foreground">MMG Pre-Payment</p>
                  <p className="text-muted-foreground text-sm">Pay via MMG before dispatch (required)</p>
                </div>
                {paymentMethod === "mmg" && <CheckCircle2 className="h-6 w-6 text-accent" />}
              </div>
            </button>

            <button
              onClick={() => setPaymentMethod("cash")}
              className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                paymentMethod === "cash" ? "border-accent bg-accent/5" : "border-border/50 bg-card"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center text-2xl">💵</div>
                <div className="flex-1">
                  <p className="font-display font-bold text-foreground">Cash on Delivery</p>
                  <p className="text-muted-foreground text-sm">Requires admin approval before dispatch</p>
                </div>
                {paymentMethod === "cash" && <CheckCircle2 className="h-6 w-6 text-accent" />}
              </div>
            </button>

            {paymentMethod === "cash" && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
                <span className="text-lg">⚠️</span>
                <div>
                  <p className="text-foreground text-sm font-semibold">Cash requires approval</p>
                  <p className="text-muted-foreground text-sm">
                    Contact support at{" "}
                    <a href="tel:+5927219769" className="text-primary underline font-semibold">+592 721-9769</a>{" "}
                    to arrange cash payment before submitting.
                  </p>
                </div>
              </div>
            )}

            <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4 flex items-start gap-3">
              <span className="text-lg">ℹ️</span>
              <p className="text-muted-foreground text-sm">
                Please have the exact amount ready for the driver. Additional payment methods will be available soon.
              </p>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-5">
            <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">✅ Confirm Your Errand</h3>

            <div className="bg-card rounded-2xl border border-border/50 p-5 space-y-3">
              <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                <span className="text-muted-foreground font-medium italic">Service:</span>
                <span className="text-foreground font-semibold">{service.name}</span>
                <span className="text-muted-foreground font-medium italic">Pickup:</span>
                <span className="text-foreground">{pickupAddress}</span>
                <span className="text-muted-foreground font-medium italic">Drop-off:</span>
                <span className="text-foreground">{dropoffAddress}</span>
                <span className="text-muted-foreground font-medium italic">Schedule:</span>
                <span className="text-foreground">{schedule === "asap" ? "ASAP" : `${scheduledDate} ${scheduledTime}`}</span>
                <span className="text-muted-foreground font-medium italic">Documents:</span>
                <span className="text-foreground">{documents.length} file(s)</span>
                <span className="text-muted-foreground font-medium italic">Payment:</span>
                <span className="text-foreground">{paymentMethod === "mmg" ? "MMG Pre-Payment" : "Cash (Admin Approval)"}</span>
              </div>
            </div>

            <div className="bg-card rounded-2xl border-2 border-accent/30 p-5 space-y-2">
              <h4 className="font-display font-bold text-foreground">Price Breakdown</h4>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base Price:</span>
                <span className="text-foreground">GYD ${service.price.toLocaleString()}.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service Fee:</span>
                <span className="text-foreground">GYD $0.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Distance Fee:</span>
                <span className="text-foreground">GYD $0.00</span>
              </div>
              <div className="border-t border-border/50 pt-2 mt-2 flex justify-between">
                <span className="font-display font-bold text-foreground">Total:</span>
                <span className="font-display font-bold text-accent text-lg">GYD ${service.price.toLocaleString()}.00</span>
              </div>
            </div>

            <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4">
              <h4 className="font-display font-bold text-foreground text-sm">Need Help?</h4>
              <p className="text-muted-foreground text-xs mt-1">Contact us on WhatsApp: <a href="https://wa.me/5927219769" className="text-accent underline">+592 721 9769</a></p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="bg-card border-b border-border/50 safe-top">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={step === 1 ? onBack : () => setStep(s => s - 1)} className="text-accent font-semibold text-sm flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h2 className="font-display font-bold text-foreground text-base truncate flex-1">{service.name}</h2>
        </div>
        {/* Progress */}
        <div className="container mx-auto px-4 pb-3">
          <p className="text-accent text-xs font-semibold text-center mb-2">Step {step} of {TOTAL_STEPS}</p>
          <div className="flex gap-1.5">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < step ? "bg-accent" : "bg-border"}`} />
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 container mx-auto px-4 py-6 max-w-2xl overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {stepContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom buttons */}
      <footer className="bg-card border-t border-border/50 safe-bottom">
        <div className="container mx-auto px-4 py-3 max-w-2xl flex gap-3">
          <Button
            variant="outline"
            onClick={step === 1 ? onBack : () => setStep(s => s - 1)}
            className="flex-1 h-12 rounded-2xl font-bold text-base border-accent/30"
          >
            {step === 1 ? "Cancel" : "Back"}
          </Button>
          {step < TOTAL_STEPS ? (
            <Button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              className="flex-1 h-12 rounded-2xl font-bold text-base bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 h-12 rounded-2xl font-bold text-base bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirm & Submit"}
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default ErrandWizard;
