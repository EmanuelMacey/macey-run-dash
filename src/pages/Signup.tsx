import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import logo from "@/assets/logo.png";

const Signup = () => {
  const { signUp, user, role, loading } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!loading && user && role) {
    if (role === "admin") return <Navigate to="/admin" replace />;
    if (role === "driver") return <Navigate to="/driver" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Must be at least 6 characters", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await signUp(email, password, fullName);
    if (error) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
    } else {
      setSuccess(true);
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 -left-32 w-[400px] h-[400px] bg-primary/15 rounded-full blur-[100px]" />
        <div className="w-full max-w-md text-center relative z-10">
          <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Mail className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold text-secondary-foreground mb-3">Check your email</h1>
          <p className="text-muted-foreground mb-6">We sent a verification link to <strong className="text-secondary-foreground">{email}</strong>. Click the link to activate your account.</p>
          <Link to="/login">
            <Button variant="outline" className="rounded-full">Back to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 -left-32 w-[400px] h-[400px] bg-primary/15 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 -right-32 w-[400px] h-[400px] bg-accent/15 rounded-full blur-[100px]" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img src={logo} alt="MaceyRunners" className="w-12 h-12 rounded-xl shadow-lg" />
            <span className="font-display font-bold text-2xl text-secondary-foreground">MaceyRunners</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-secondary-foreground">Create your account</h1>
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
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="password" type={showPassword ? "text" : "password"} placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10 rounded-xl h-11" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full gradient-primary text-primary-foreground rounded-full h-12 text-base font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all" disabled={submitting}>
            {submitting ? "Creating account..." : "Create Account"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
