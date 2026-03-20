import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { CheckCircle, Truck, User, Mail, Phone, MapPin, Car, FileText } from "lucide-react";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";
import ThemeToggle from "@/components/ThemeToggle";

const DriverApplication = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [vehicleType, setVehicleType] = useState("motorcycle");
  const [licensePlate, setLicensePlate] = useState("");
  const [hasLicense, setHasLicense] = useState(false);
  const [availability, setAvailability] = useState("full_time");
  const [experience, setExperience] = useState("");
  const [whyJoin, setWhyJoin] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("driver_applications" as any).insert({
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      address: address.trim(),
      vehicle_type: vehicleType,
      license_plate: licensePlate.trim() || null,
      has_license: hasLicense,
      availability,
      experience: experience.trim() || null,
      why_join: whyJoin.trim() || null,
    } as any);

    setLoading(false);
    if (error) {
      toast.error("Failed to submit application. Please try again.");
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-3">Application Submitted!</h1>
          <p className="text-muted-foreground mb-2">
            Thank you for your interest in joining MaceyRunners.
          </p>
          <p className="text-muted-foreground text-sm mb-8">
            Our team will review your application and contact you within 1–3 business days via phone or email.
          </p>
          <Link to="/">
            <Button variant="outline" className="rounded-full">Back to Home</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="MaceyRunners" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-display font-bold text-foreground">MaceyRunners</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Hero */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Truck className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Drive with MaceyRunners
            </h1>
            <p className="text-muted-foreground text-sm">
              Earn money on your own schedule. Part-time or full-time — you choose.
            </p>
          </div>

          <Card className="p-6 border-border/50">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Personal Info */}
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" /> Personal Information
                </h2>
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required className="pl-10" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+592 XXX-XXXX" required className="pl-10" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="address" value={address} onChange={e => setAddress(e.target.value)} placeholder="Your area / address" className="pl-10" />
                  </div>
                </div>
              </div>

              {/* Vehicle Info */}
              <div className="space-y-4 pt-2 border-t border-border/50">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 pt-2">
                  <Car className="h-4 w-4 text-primary" /> Vehicle Information
                </h2>
                <div>
                  <Label>Vehicle Type</Label>
                  <Select value={vehicleType} onValueChange={setVehicleType}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="motorcycle">Motorcycle</SelectItem>
                      <SelectItem value="car">Car</SelectItem>
                      <SelectItem value="bicycle">Bicycle</SelectItem>
                      <SelectItem value="on_foot">On Foot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="licensePlate">License Plate (if applicable)</Label>
                  <Input id="licensePlate" value={licensePlate} onChange={e => setLicensePlate(e.target.value)} placeholder="e.g. PAA 1234" className="mt-1" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="hasLicense" className="cursor-pointer">Do you have a valid driver's license?</Label>
                  <Switch id="hasLicense" checked={hasLicense} onCheckedChange={setHasLicense} />
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-4 pt-2 border-t border-border/50">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 pt-2">
                  <FileText className="h-4 w-4 text-primary" /> Availability & Experience
                </h2>
                <div>
                  <Label>Availability</Label>
                  <Select value={availability} onValueChange={setAvailability}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Full Time</SelectItem>
                      <SelectItem value="part_time">Part Time</SelectItem>
                      <SelectItem value="weekends">Weekends Only</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="experience">Delivery / Driving Experience</Label>
                  <Textarea id="experience" value={experience} onChange={e => setExperience(e.target.value)} placeholder="Any previous delivery or driving experience..." className="mt-1" rows={3} />
                </div>
                <div>
                  <Label htmlFor="whyJoin">Why do you want to join MaceyRunners?</Label>
                  <Textarea id="whyJoin" value={whyJoin} onChange={e => setWhyJoin(e.target.value)} placeholder="Tell us a bit about yourself..." className="mt-1" rows={3} />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full h-12 rounded-full gradient-primary text-primary-foreground font-bold">
                {loading ? "Submitting..." : "Submit Application"}
              </Button>

              <p className="text-[11px] text-muted-foreground text-center">
                By submitting, you agree to MaceyRunners' terms and conditions.
              </p>
            </form>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default DriverApplication;
