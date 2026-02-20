import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";

const ResetPassword = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    // Check for recovery token in URL hash
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }

    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    }
    setSubmitting(false);
  };

  if (!isRecovery) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center p-4 relative overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.12, 0.22, 0.12] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 -left-32 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[120px]"
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="bg-card/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-border/50 text-center">
            <h2 className="font-display text-xl font-bold text-foreground mb-2">Invalid Reset Link</h2>
            <p className="text-muted-foreground mb-6">This link has expired or is invalid. Please request a new password reset.</p>
            <Link to="/forgot-password">
              <Button className="gradient-primary text-primary-foreground rounded-full">Request New Link</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4 relative overflow-hidden">
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img src={logo} alt="MaceyRunners" className="w-12 h-12 rounded-xl shadow-lg ring-1 ring-primary/20" />
            <span className="font-display font-bold text-2xl text-foreground">MaceyRunners</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-foreground">Set New Password</h1>
          <p className="text-muted-foreground mt-2">Choose a strong password for your account</p>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-border/50 text-center"
          >
            <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle2 className="h-8 w-8 text-success-foreground" />
            </div>
            <h2 className="font-display text-xl font-bold text-foreground mb-2">Password Updated!</h2>
            <p className="text-muted-foreground mb-6">Redirecting you to login...</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-card/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-border/50 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 rounded-xl h-11"
                  required
                  minLength={6}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirm"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 rounded-xl h-11"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full gradient-primary text-primary-foreground rounded-full h-12 text-base font-semibold shadow-lg shadow-primary/20"
              disabled={submitting}
            >
              {submitting ? "Updating..." : "Update Password"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              <Link to="/login" className="text-primary font-medium hover:underline">
                <ArrowLeft className="inline h-3 w-3 mr-1" />Back to Login
              </Link>
            </p>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword;
