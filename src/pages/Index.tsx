import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";
import { Zap, Smartphone, Store } from "lucide-react";

const Index = () => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user && role) {
    if (role === "admin") return <Navigate to="/admin" replace />;
    if (role === "driver") return <Navigate to="/driver" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/10 via-background to-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background orbs */}
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.08, 0.15, 0.08] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-0 left-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[150px]"
      />
      <motion.div
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.06, 0.12, 0.06] }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/15 rounded-full blur-[120px]"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm flex flex-col items-center text-center relative z-10"
      >
        {/* Logo */}
        <motion.img
          src={logo}
          alt="MaceyRunners"
          className="w-20 h-20 rounded-2xl shadow-xl ring-2 ring-accent/30 mb-4"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        />

        <h1 className="font-display text-3xl font-extrabold text-accent">
          MaceyRunners
        </h1>
        <p className="text-muted-foreground text-sm font-medium mt-1">Guyana</p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 mb-2"
        >
          <h2 className="font-display text-2xl font-bold text-foreground leading-tight">
            Your Errands & Food,<br />Delivered Fast 🇬🇾
          </h2>
          <p className="text-muted-foreground text-sm mt-2">
            Shop from local stores and get delivery across Guyana
          </p>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-6 mt-5 mb-8"
        >
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-accent" />
            </div>
            <span className="text-[11px] font-semibold text-foreground">Fast Delivery</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>
            <span className="text-[11px] font-semibold text-foreground">MMG Payment</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <Store className="h-5 w-5 text-accent" />
            </div>
            <span className="text-[11px] font-semibold text-foreground">Local Stores</span>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full space-y-3"
        >
          <Link to="/login" className="block w-full">
            <Button className="w-full h-13 rounded-full text-base font-bold bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg shadow-accent/20">
              Login
            </Button>
          </Link>
          <Link to="/signup" className="block w-full">
            <Button variant="outline" className="w-full h-13 rounded-full text-base font-bold border-2 border-accent text-accent hover:bg-accent/5">
              Create Account
            </Button>
          </Link>
        </motion.div>

        <p className="text-muted-foreground text-xs mt-8">
          Serving communities across Guyana 🇬🇾
        </p>
      </motion.div>
    </div>
  );
};

export default Index;
