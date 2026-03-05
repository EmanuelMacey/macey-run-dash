import { useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, Eye, EyeOff, User, Gift, Phone } from "lucide-react";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";


const Signup = () => {
  const { signUp, user, role, loading } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [referralCode, setReferralCode] = useState(searchParams.get("ref") || "");

  if (!loading && user && role) {
    if (role === "admin") return <Navigate to="/admin" replace />;
    if (role === "driver") return <Navigate to="/driver" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  // Disposable/temporary email domain blocklist
  const BLOCKED_DOMAINS = [
    "tempmail.com", "throwaway.email", "guerrillamail.com", "mailinator.com",
    "yopmail.com", "sharklasers.com", "guerrillamailblock.com", "grr.la",
    "dispostable.com", "trashmail.com", "fakeinbox.com", "temp-mail.org",
    "getnada.com", "maildrop.cc", "10minutemail.com", "minutemail.com",
    "emailondeck.com", "tempr.email", "discard.email", "tmpmail.net",
    "tmpmail.org", "bupmail.com", "mailnesia.com", "mohmal.com",
  ];

  const validateInputs = (): boolean => {
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();

    // Name validation: at least first + last name, letters/spaces/hyphens only, min 3 chars
    if (trimmedName.length < 3) {
      toast({ title: "Invalid name", description: "Please enter your full name (at least 3 characters).", variant: "destructive" });
      return false;
    }
    if (!/^[a-zA-ZÀ-ÿ' -]{2,}\s+[a-zA-ZÀ-ÿ' -]{2,}/.test(trimmedName)) {
      toast({ title: "Full name required", description: "Please enter your first and last name (e.g. John Doe).", variant: "destructive" });
      return false;
    }
    if (/(.)\1{4,}/.test(trimmedName) || /^(test|fake|asdf|qwer|user|name|abc)/i.test(trimmedName)) {
      toast({ title: "Invalid name", description: "Please enter your real full name.", variant: "destructive" });
      return false;
    }

    // Email validation: reject disposable domains
    const emailDomain = trimmedEmail.split("@")[1];
    if (!emailDomain || BLOCKED_DOMAINS.includes(emailDomain)) {
      toast({ title: "Invalid email", description: "Please use a real email address. Temporary/disposable emails are not allowed.", variant: "destructive" });
      return false;
    }
    // Reject emails that look fake (e.g. test@test.com, a@b.com)
    const localPart = trimmedEmail.split("@")[0];
    if (localPart.length < 3 || /^(test|fake|asdf|qwer|noreply|nobody|abc)$/i.test(localPart)) {
      toast({ title: "Invalid email", description: "Please use a real email address.", variant: "destructive" });
      return false;
    }

    // Phone validation: mandatory, must be at least 7 digits
    if (!trimmedPhone) {
      toast({ title: "Phone required", description: "A phone number is required to sign up.", variant: "destructive" });
      return false;
    }
    const digitsOnly = trimmedPhone.replace(/\D/g, "");
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      toast({ title: "Invalid phone", description: "Please enter a valid phone number (7–15 digits).", variant: "destructive" });
      return false;
    }

    if (password.length < 6) {
      toast({ title: "Password too short", description: "Must be at least 6 characters.", variant: "destructive" });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;
    setSubmitting(true);
    const { error } = await signUp(email, password, fullName);
    if (error) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
    } else {
      // Store phone number in profile after signup
      if (phone.trim()) {
        try {
          const { data: { user: newUser } } = await supabase.auth.getUser();
          if (newUser) {
            await supabase.from("profiles").update({ phone: phone.trim() }).eq("user_id", newUser.id);
          }
        } catch {
          // Silently fail - phone update is not critical
        }
      }

      if (referralCode.trim()) {
        try {
          const { data: referrer } = await supabase
            .from("profiles")
            .select("user_id")
            .eq("referral_code", referralCode.trim().toUpperCase())
            .single();
          if (referrer) {
            const { data: { user: newUser } } = await supabase.auth.getUser();
            if (newUser) {
              await supabase.from("referrals").insert({
                referrer_id: referrer.user_id,
                referred_id: newUser.id,
                referral_code: referralCode.trim().toUpperCase(),
              });
            }
          }
        } catch {
          // Silently fail - referral is bonus
        }
      }
      setSuccess(true);
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center p-4 relative overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.12, 0.22, 0.12] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 -left-32 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[120px]"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center relative z-10"
        >
          <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
            <Mail className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-3">Check your email</h1>
          <p className="text-muted-foreground mb-6">We sent a verification link to <strong className="text-foreground">{email}</strong>. Click the link to activate your account.</p>
          <Link to="/login">
            <Button variant="outline" className="rounded-full border-primary/30 hover:bg-primary/10">Back to Login</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Gradient orbs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.12, 0.22, 0.12] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-0 -left-32 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[120px]"
      />
      <motion.div
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.1, 0.18, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        className="absolute bottom-0 -right-32 w-[400px] h-[400px] bg-accent/15 rounded-full blur-[120px]"
      />

      {/* Particles */}
      <div className="particle w-3 h-3 bg-primary/15 top-20 left-[10%]" style={{ animationDelay: '0s' }} />
      <div className="particle w-2 h-2 bg-accent/15 top-40 right-[15%]" style={{ animationDelay: '2s' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img src={logo} alt="MaceyRunners" className="w-12 h-12 rounded-xl shadow-lg ring-1 ring-primary/20" />
            <span className="font-display font-bold text-2xl text-foreground">MaceyRunners</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-foreground">Create your account</h1>
          <p className="text-muted-foreground mt-2">Start getting deliveries today</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-border/50 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="fullName" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10 rounded-xl h-11" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 rounded-xl h-11" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="phone" type="tel" placeholder="+592 600 0000" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-10 rounded-xl h-11" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="password" type={showPassword ? "text" : "password"} placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10 rounded-xl h-11" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="referral">Referral Code (optional)</Label>
            <div className="relative">
              <Gift className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="referral" placeholder="Enter referral code" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} className="pl-10 rounded-xl h-11" />
            </div>
          </div>

          <Button type="submit" className="w-full gradient-primary text-primary-foreground rounded-full h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[1.02] transition-all" disabled={submitting}>
            {submitting ? "Creating account..." : "Create Account"}
          </Button>


          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default Signup;
