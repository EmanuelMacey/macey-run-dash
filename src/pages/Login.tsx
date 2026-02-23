import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, Eye, EyeOff, Wand2 } from "lucide-react";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";
import { lovable } from "@/integrations/lovable";

const Login = () => {
  const { signIn, signInWithMagicLink, user, role, loading } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [showMagicLink, setShowMagicLink] = useState(false);

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
      <div className="particle w-4 h-4 bg-primary/10 bottom-32 left-[20%]" style={{ animationDelay: '4s' }} />

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
          <h1 className="font-display text-3xl font-bold text-foreground">Welcome back</h1>
          <p className="text-muted-foreground mt-2">Sign in to your account</p>
        </div>

        {magicLinkSent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-border/50 text-center"
          >
            <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
              <Mail className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="font-display text-xl font-bold text-foreground mb-2">Check your email</h2>
            <p className="text-muted-foreground mb-6">We sent a magic link to <strong className="text-foreground">{email}</strong></p>
            <Button variant="outline" onClick={() => setMagicLinkSent(false)} className="rounded-full border-primary/30">
              Try another method
            </Button>
          </motion.div>
        ) : showMagicLink ? (
          <form onSubmit={handleMagicLink} className="bg-card/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-border/50 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 rounded-xl h-11" required />
              </div>
            </div>

            <Button type="submit" className="w-full gradient-primary text-primary-foreground rounded-full h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[1.02] transition-all" disabled={submitting}>
              <Wand2 className="h-4 w-4 mr-2" />
              {submitting ? "Sending..." : "Send Magic Link"}
            </Button>

            <button type="button" onClick={() => setShowMagicLink(false)} className="w-full text-center text-sm text-primary hover:underline">
              Sign in with password instead
            </button>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="bg-card/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-border/50 space-y-5">
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
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10 rounded-xl h-11" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full gradient-primary text-primary-foreground rounded-full h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[1.02] transition-all" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign In"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/50" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-card/80 px-3 text-muted-foreground">or</span></div>
            </div>

            <Button type="button" variant="outline" onClick={() => setShowMagicLink(true)} className="w-full rounded-full h-11 gap-2 border-primary/20 hover:bg-primary/5">
              <Wand2 className="h-4 w-4" /> Sign in with Magic Link
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                const result = await lovable.auth.signInWithOAuth("google");
                if (result?.error) {
                  toast({ title: "Google sign-in failed", description: String(result.error), variant: "destructive" });
                }
              }}
              className="w-full rounded-full h-11 gap-2 border-border/50 hover:bg-accent/50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Sign in with Google
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                const result = await lovable.auth.signInWithOAuth("apple");
                if (result?.error) {
                  toast({ title: "Apple sign-in failed", description: String(result.error), variant: "destructive" });
                }
              }}
              className="w-full rounded-full h-11 gap-2 border-border/50 hover:bg-accent/50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
              Sign in with Apple
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
            </p>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default Login;
