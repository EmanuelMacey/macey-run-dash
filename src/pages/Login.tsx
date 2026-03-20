import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, Eye, EyeOff, Wand2, ArrowRight, User, Phone } from "lucide-react";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";
import ThemeToggle from "@/components/ThemeToggle";

const Login = () => {
  const { signIn, signInWithMagicLink, signInAsGuest, user, role, loading } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [showGuest, setShowGuest] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  if (!loading && user && role) {
    if (role === "admin") return <Navigate to="/admin" replace />;
    if (role === "driver") return <Navigate to="/driver" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "Enter your email", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await signInWithMagicLink(email);
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } else {
      setMagicLinkSent(true);
    }
    setSubmitting(false);
  };

  const handleGuestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestPhone.trim()) {
      toast({ title: "Please enter your name and phone number", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await signInAsGuest(guestName.trim(), guestPhone.trim());
    if (error) {
      toast({ title: "Guest login failed", description: error.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

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
          <Link to="/signup">
            <Button size="sm" className="rounded-full bg-foreground hover:bg-foreground/90 text-background text-xs sm:text-sm font-bold px-4 sm:px-5">
              Sign up
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
              Welcome <span className="text-accent">back.</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base mt-2">Sign in to your account</p>
          </div>

          {magicLinkSent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-border/50 rounded-2xl p-8 shadow-lg text-center"
            >
              <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-5">
                <Mail className="h-7 w-7 text-accent" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground mb-2">Check your email</h2>
              <p className="text-muted-foreground text-sm mb-6">We sent a magic link to <strong className="text-foreground">{email}</strong></p>
              <Button variant="outline" onClick={() => setMagicLinkSent(false)} className="rounded-full border-2 border-border text-foreground hover:bg-muted/50">
                Try another method
              </Button>
            </motion.div>
          ) : showMagicLink ? (
            <form onSubmit={handleMagicLink} className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8 shadow-lg space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 rounded-xl h-11" required />
                </div>
              </div>

              <Button type="submit" className="w-full h-12 rounded-2xl text-sm font-bold bg-foreground hover:bg-foreground/90 text-background shadow-lg" disabled={submitting}>
                <Wand2 className="h-4 w-4 mr-2" />
                {submitting ? "Sending..." : "Send Magic Link"}
              </Button>

              <button type="button" onClick={() => setShowMagicLink(false)} className="w-full text-center text-sm text-accent font-medium hover:underline">
                Sign in with password instead
              </button>

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/signup" className="text-accent font-medium hover:underline">Sign up</Link>
              </p>
            </form>
          ) : showGuest ? (
            <form onSubmit={handleGuestLogin} className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8 shadow-lg space-y-5">
              <div className="text-center mb-2">
                <p className="text-sm text-muted-foreground">Quick order — no account needed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guestName">Your Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="guestName" placeholder="Enter your full name" value={guestName} onChange={(e) => setGuestName(e.target.value)} className="pl-10 rounded-xl h-11" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guestPhone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="guestPhone" type="tel" placeholder="+592 600-0000" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} className="pl-10 rounded-xl h-11" required />
                </div>
              </div>

              <Button type="submit" className="w-full h-12 rounded-2xl text-sm font-bold bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg" disabled={submitting}>
                {submitting ? "Setting up..." : "Continue as Guest"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <button type="button" onClick={() => setShowGuest(false)} className="w-full text-center text-sm text-accent font-medium hover:underline">
                Sign in with account instead
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8 shadow-lg space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 rounded-xl h-11" required />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-xs text-accent hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10 rounded-xl h-11" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full h-12 rounded-2xl text-sm font-bold bg-foreground hover:bg-foreground/90 text-background shadow-lg" disabled={submitting}>
                {submitting ? "Signing in..." : "Sign In"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/50" /></div>
                <div className="relative flex justify-center text-xs"><span className="bg-card px-3 text-muted-foreground">or</span></div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant="outline" onClick={() => setShowMagicLink(true)} className="h-11 rounded-2xl gap-1.5 border-2 border-border text-foreground hover:bg-muted/50 font-semibold text-xs">
                  <Wand2 className="h-3.5 w-3.5" /> Magic Link
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowGuest(true)} className="h-11 rounded-2xl gap-1.5 border-2 border-accent/30 text-accent hover:bg-accent/5 font-semibold text-xs">
                  <User className="h-3.5 w-3.5" /> Guest Order
                </Button>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/signup" className="text-accent font-medium hover:underline">Sign up</Link>
              </p>
            </form>
          )}
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

export default Login;
