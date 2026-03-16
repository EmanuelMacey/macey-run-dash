import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";
import deliveryRider from "@/assets/delivery-rider.png";
import { ArrowRight } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

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
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-[-300px] right-[-200px] w-[600px] h-[600px] bg-accent/8 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-[-200px] left-[-150px] w-[500px] h-[500px] bg-primary/6 rounded-full blur-[150px] pointer-events-none" />

      {/* Minimal Navbar */}
      <nav className="relative z-20 w-full px-6 md:px-12 lg:px-20 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="MaceyRunners" className="w-9 h-9 rounded-xl shadow-sm" />
          <span className="font-display font-bold text-lg text-foreground">MaceyRunners</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/login">
            <Button variant="ghost" className="rounded-full text-sm font-semibold text-muted-foreground hover:text-foreground">
              Log in
            </Button>
          </Link>
          <Link to="/signup" className="hidden sm:block">
            <Button className="rounded-full bg-foreground hover:bg-foreground/90 text-background text-sm font-bold px-5">
              Sign up
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero — single focused message */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center relative z-10 px-6 md:px-12 lg:px-20 xl:px-28 gap-6 md:gap-16 pb-12 md:pb-0">
        {/* Left: Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 max-w-lg text-center md:text-left"
        >
          <h1 className="font-display text-[2.5rem] sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-[1.08] tracking-tight">
            Delivery & errands,{" "}
            <span className="text-accent">done for you.</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg mt-4 max-w-md mx-auto md:mx-0 leading-relaxed">
            Order food, run errands, send packages — all handled by local runners across Guyana.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center md:justify-start">
            <Link to="/signup" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto h-13 rounded-2xl text-base font-bold bg-foreground hover:bg-foreground/90 text-background px-8 shadow-lg">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto h-13 rounded-2xl text-base font-semibold border-2 border-border text-foreground hover:bg-muted/50 px-8">
                I have an account
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Right: Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex-1 max-w-sm w-full flex items-center justify-center"
        >
          <div className="relative">
            <div className="w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 rounded-full bg-accent/10 flex items-center justify-center">
              <img
                src={deliveryRider}
                alt="Fast delivery"
                className="w-48 sm:w-56 lg:w-64 h-auto object-contain drop-shadow-lg"
              />
            </div>
            {/* Floating stat */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-2 -right-2 bg-card border border-border rounded-2xl px-4 py-2.5 shadow-lg"
            >
              <p className="font-display font-extrabold text-xl text-accent">15 min</p>
              <p className="text-[10px] text-muted-foreground font-medium">avg. delivery</p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Minimal footer strip */}
      <div className="relative z-10 py-4 px-6 text-center border-t border-border/30">
        <p className="text-xs text-muted-foreground">
          🏃 Trusted by hundreds across Georgetown & beyond
        </p>
      </div>
    </div>
  );
};

export default Index;
