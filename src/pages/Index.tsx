import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";
import { Zap, Smartphone, Store, ShoppingBag, MapPin, Truck } from "lucide-react";

const Index = () => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user && role) {
    if (role === "admin") return <Navigate to="/admin" replace />;
    if (role === "driver") return <Navigate to="/driver" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/8 via-background to-background flex flex-col items-center justify-between p-6 relative overflow-hidden">
      {/* Background orbs */}
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.06, 0.12, 0.06] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-accent/20 rounded-full blur-[150px]"
      />
      <motion.div
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.04, 0.1, 0.04] }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        className="absolute bottom-[-80px] right-[-80px] w-[400px] h-[400px] bg-primary/15 rounded-full blur-[120px]"
      />

      {/* Top section */}
      <div className="w-full max-w-sm flex flex-col items-center text-center relative z-10 pt-8">
        {/* Logo */}
        <motion.img
          src={logo}
          alt="MaceyRunners"
          className="w-24 h-24 rounded-3xl shadow-2xl ring-2 ring-accent/20 mb-5"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 180 }}
        />

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="font-display text-3xl font-extrabold text-accent tracking-tight">
            MaceyRunners
          </h1>
          <p className="text-muted-foreground text-sm font-medium mt-0.5">Guyana's #1 Delivery & Errand App 🇬🇾</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <h2 className="font-display text-2xl font-bold text-foreground leading-tight">
            Your Errands & Food,<br />
            <span className="text-accent">Delivered Fast</span>
          </h2>
          <p className="text-muted-foreground text-sm mt-2 max-w-xs mx-auto">
            Order food from local restaurants, get groceries, run errands — all from one app.
          </p>
        </motion.div>

        {/* Service cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-3 mt-7 w-full"
        >
          {[
            { icon: ShoppingBag, label: "Food Delivery", color: "bg-accent/10 text-accent" },
            { icon: MapPin, label: "Run Errands", color: "bg-primary/10 text-primary" },
            { icon: Truck, label: "Send Packages", color: "bg-green-500/10 text-green-600" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 + i * 0.08 }}
              className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-3 flex flex-col items-center gap-2"
            >
              <div className={`w-11 h-11 rounded-xl ${item.color} flex items-center justify-center`}>
                <item.icon className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-bold text-foreground text-center leading-tight">{item.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-4 mt-5 text-muted-foreground"
        >
          <div className="flex items-center gap-1 text-xs">
            <Zap className="h-3.5 w-3.5 text-accent" />
            <span>Fast Delivery</span>
          </div>
          <span className="text-border">•</span>
          <div className="flex items-center gap-1 text-xs">
            <Smartphone className="h-3.5 w-3.5 text-primary" />
            <span>Easy Payment</span>
          </div>
          <span className="text-border">•</span>
          <div className="flex items-center gap-1 text-xs">
            <Store className="h-3.5 w-3.5 text-accent" />
            <span>Local Stores</span>
          </div>
        </motion.div>
      </div>

      {/* Bottom CTA section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-sm relative z-10 space-y-3 pb-4"
      >
        <Link to="/login" className="block w-full">
          <Button className="w-full h-14 rounded-2xl text-base font-bold bg-accent hover:bg-accent/90 text-accent-foreground shadow-xl shadow-accent/25">
            Login
          </Button>
        </Link>
        <Link to="/signup" className="block w-full">
          <Button variant="outline" className="w-full h-14 rounded-2xl text-base font-bold border-2 border-accent/40 text-accent hover:bg-accent/5">
            Create Account
          </Button>
        </Link>
        <p className="text-muted-foreground text-xs text-center pt-2">
          Serving communities across Guyana 🇬🇾
        </p>
      </motion.div>
    </div>
  );
};

export default Index;
