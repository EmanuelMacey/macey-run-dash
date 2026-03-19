import { useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, Eye, EyeOff, User, Gift, Phone, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";
import ThemeToggle from "@/components/ThemeToggle";

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

    const emailDomain = trimmedEmail.split("@")[1];
    if (!emailDomain || BLOCKED_DOMAINS.includes(emailDomain)) {
      toast({ title: "Invalid email", description: "Please use a real email address. Temporary/disposable emails are not allowed.", variant: "destructive" });
      return false;
    }
    const localPart = trimmedEmail.split("@")[0];
    if (localPart.length < 3 || /^(test|fake|asdf|qwer|noreply|nobody|abc)$/i.test(localPart)) {
      toast({ title: "Invalid email", description: "Please use a real email address.", variant: "destructive" });
      return false;
    }

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
      if (phone.trim()) {
        try {
          const { data: { user: newUser } } = await supabase.auth.getUser();
          if (newUser) {
            await supabase.from("profiles").update({ phone: phone.trim() }).eq("user_id", newUser.id);
          }
        } catch {
          // Silently fail
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
          // Silently fail
        }
      }
      setSuccess(true);
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="min-h-[100dvh] bg-background flex flex-col relative overflow-hidden safe-all">
        <div className="absolute top-[-200px] right-[-100px] w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-accent/8 rounded-full blur-[120px] md:blur-[180px] pointer-events-none" />
        <div className="absolute bottom-[-100px] left-[-80px] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-primary/6 rounded-full blur-[100px] md:blur-[150px] pointer-events-none" />

        <nav className="relative z-20 w-full px-4 sm:px-6 md:px-12 lg:px-20 pt-2 pb-2 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="MaceyRunners" className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl shadow-sm" />
            <span className="font-display font-bold text-base sm:text-lg text-foreground">MaceyRunners</span>
          </Link>
          <ThemeToggle />
        </nav>

        <div className="flex-1 flex items-center justify-center relative z-10 px-5 sm:px-6 py-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md text-center"
          >
            <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <Mail className="h-7 w-7 text-accent" />
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-foreground mb-3">Check your email</h1>
            <p className="text-muted-foreground text-sm mb-6">We sent a verification link to <strong className="text-foreground">{email}</strong>. Click the link to activate your account.</p>
            <Link to="/login">
              <Button variant="outline" className="rounded-full border-2 border-border text-foreground hover:bg-muted/50 font-semibold">Back to Login</Button>
            </Link>
          </motion.div>
        </div>

        <div className="relative z-10 py-3 sm:py-4 px-4 sm:px-6 text-center border-t border-border/30">
          <p className="text-[10px] sm:text-xs text-muted-foreground">🏃 Trusted by hundreds across Georgetown & beyond</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col relative overflow-hidden safe-all">
      {/* Subtle background glow — same as landing */}
      <div className="absolute top-[-200px] right-[-100px] w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-accent/8 rounded-full blur-[120px] md:blur-[180px] pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-80px] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-primary/6 rounded-full blur-[100px] md:blur-[150px] pointer-events-none" />

      {/* Navbar — same as landing */}
      <nav className="relative z-20 w-full px-4 sm:px-6 md:px-12 lg:px-20 pt-2 pb-2 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="MaceyRunners" className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl shadow-sm" />
          <span className="font-display font-bold text-base sm:text-lg text-foreground">MaceyRunners</span>
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          <Link to="/login">
            <Button variant="ghost" size="sm" className="rounded-full text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground px-3">
              Log in
            </Button>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center relative z-10 px-5 sm:px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-6">
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-foreground leading-[1.1] tracking-tight">
              Get started <span className="text-accent">today.</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base mt-2">Create your account and start ordering</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8 shadow-lg space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="fullName" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10 rounded-xl h-11" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 rounded-xl h-11" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="phone" type="tel" placeholder="+592 600 0000" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-10 rounded-xl h-11" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10 rounded-xl h-11" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="referral">Referral Code (optional)</Label>
              <div className="relative">
                <Gift className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="referral" placeholder="Enter referral code" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} className="pl-10 rounded-xl h-11" />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 rounded-2xl text-sm font-bold bg-foreground hover:bg-foreground/90 text-background shadow-lg" disabled={submitting}>
              {submitting ? "Creating account..." : "Create Account"} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-accent font-medium hover:underline">Sign in</Link>
            </p>
          </form>
        </motion.div>
      </div>

      {/* Footer strip — same as landing */}
      <div className="relative z-10 py-3 sm:py-4 px-4 sm:px-6 text-center border-t border-border/30">
        <p className="text-[10px] sm:text-xs text-muted-foreground">
          🏃 Trusted by hundreds across Georgetown & beyond
        </p>
      </div>
    </div>
  );
};

export default Signup;
