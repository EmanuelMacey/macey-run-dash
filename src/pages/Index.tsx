import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";
import deliveryRider from "@/assets/delivery-rider.png";
import { ArrowRight, Package, Utensils, Truck } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const Index = () => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center">
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
    <div className="min-h-[100dvh] bg-background flex flex-col relative overflow-hidden safe-all">
      {/* Subtle background glow */}
      <div className="absolute top-[-200px] right-[-100px] w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-accent/8 rounded-full blur-[120px] md:blur-[180px] pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-80px] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-primary/6 rounded-full blur-[100px] md:blur-[150px] pointer-events-none" />

      {/* Navbar — notch-safe */}
      <nav className="relative z-20 w-full px-4 sm:px-6 md:px-12 lg:px-20 pt-2 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={logo} alt="MaceyRunners" className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl shadow-sm" />
          <span className="font-display font-bold text-base sm:text-lg text-foreground">MaceyRunners</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          <Link to="/login">
            <Button variant="ghost" size="sm" className="rounded-full text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground px-3">
              Log in
            </Button>
          </Link>
          <Link to="/signup" className="hidden sm:block">
            <Button size="sm" className="rounded-full bg-foreground hover:bg-foreground/90 text-background text-xs sm:text-sm font-bold px-4 sm:px-5">
              Sign up
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center relative z-10 px-5 sm:px-6 md:px-12 lg:px-20 xl:px-28 gap-6 md:gap-12 lg:gap-16 py-6 md:py-0">
        {/* Left: Text */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex-1 max-w-lg text-center md:text-left"
        >
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-[1.1] tracking-tight">
            Delivery & errands,{" "}
            <span className="text-accent">done for you.</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg mt-3 sm:mt-4 max-w-md mx-auto md:mx-0 leading-relaxed">
            Order food, run errands, send packages — all handled by local runners across Guyana.
          </p>

          {/* Service pills — mobile-friendly */}
          <div className="flex flex-wrap gap-2 mt-4 sm:mt-5 justify-center md:justify-start">
            <div className="flex items-center gap-1.5 bg-muted/60 rounded-full px-3 py-1.5 text-xs sm:text-sm text-muted-foreground font-medium">
              <Utensils className="w-3.5 h-3.5 text-accent" />
              Food Delivery
            </div>
            <div className="flex items-center gap-1.5 bg-muted/60 rounded-full px-3 py-1.5 text-xs sm:text-sm text-muted-foreground font-medium">
              <Package className="w-3.5 h-3.5 text-primary" />
              Errands
            </div>
            <div className="flex items-center gap-1.5 bg-muted/60 rounded-full px-3 py-1.5 text-xs sm:text-sm text-muted-foreground font-medium">
              <Truck className="w-3.5 h-3.5 text-accent" />
              Packages
            </div>
          </div>

          {/* Pricing teaser */}
          <div className="mt-4 sm:mt-5 flex flex-wrap gap-2 justify-center md:justify-start">
            <span className="bg-accent/10 text-accent text-xs font-bold px-3 py-1 rounded-full">Deliveries from $800 GYD</span>
            <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">Errands from $1,200 GYD</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mt-5 sm:mt-6 justify-center md:justify-start">
            <Link to="/signup" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto h-12 sm:h-13 rounded-2xl text-sm sm:text-base font-bold bg-foreground hover:bg-foreground/90 text-background px-6 sm:px-8 shadow-lg">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto h-12 sm:h-13 rounded-2xl text-sm sm:text-base font-semibold border-2 border-border text-foreground hover:bg-muted/50 px-6 sm:px-8">
                I have an account
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Right: Illustration — scales gracefully */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.45 }}
          className="flex-1 max-w-[260px] sm:max-w-xs md:max-w-sm w-full flex items-center justify-center"
        >
          <div className="relative">
            <div className="w-48 h-48 sm:w-60 sm:h-60 md:w-64 md:h-64 lg:w-72 lg:h-72 rounded-full bg-accent/10 flex items-center justify-center">
              <img
                src={deliveryRider}
                alt="Fast delivery"
                className="w-36 sm:w-44 md:w-48 lg:w-56 h-auto object-contain drop-shadow-lg"
              />
            </div>
            {/* Floating stat */}
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-card border border-border rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 shadow-lg"
            >
              <p className="font-display font-extrabold text-lg sm:text-xl text-accent">15 min</p>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground font-medium">avg. delivery</p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Footer strip — notch-safe bottom */}
      <div className="relative z-10 py-3 sm:py-4 px-4 sm:px-6 text-center border-t border-border/30">
        <p className="text-[10px] sm:text-xs text-muted-foreground">
          🏃 Trusted by hundreds across Georgetown & beyond
        </p>
      </div>
    </div>
  );
};

export default Index;
