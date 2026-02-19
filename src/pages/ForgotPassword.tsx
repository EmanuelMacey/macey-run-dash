import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";

const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await resetPassword(email);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
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
      <div className="particle w-3 h-3 bg-primary/15 top-20 left-[15%]" style={{ animationDelay: '0s' }} />
      <div className="particle w-2 h-2 bg-accent/15 top-40 right-[20%]" style={{ animationDelay: '2s' }} />

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
          <h1 className="font-display text-3xl font-bold text-foreground">Reset password</h1>
          <p className="text-muted-foreground mt-2">We'll send you a reset link</p>
        </div>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-border/50 text-center"
          >
            <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
              <Mail className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="font-display text-xl font-bold text-foreground mb-2">Check your email</h2>
            <p className="text-muted-foreground mb-6">We sent a reset link to <strong className="text-foreground">{email}</strong></p>
            <Link to="/login">
              <Button variant="outline" className="rounded-full border-primary/30 hover:bg-primary/10">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
              </Button>
            </Link>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-card/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-border/50 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 rounded-xl h-11" required />
              </div>
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground rounded-full h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[1.02] transition-all" disabled={submitting}>
              {submitting ? "Sending..." : "Send Reset Link"}
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

export default ForgotPassword;
