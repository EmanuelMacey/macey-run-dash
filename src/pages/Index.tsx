import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";
import deliveryRider from "@/assets/delivery-rider.png";
import { Zap, Smartphone, Store, ShoppingBag, MapPin, Truck, ArrowRight, CheckCircle2 } from "lucide-react";
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
      {/* Background effects */}
      <div className="absolute inset-0 mesh-bg pointer-events-none" />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.04, 0.08, 0.04] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] bg-accent/20 rounded-full blur-[180px]"
      />
      <motion.div
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.03, 0.07, 0.03] }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        className="absolute bottom-[-150px] right-[-150px] w-[500px] h-[500px] bg-primary/15 rounded-full blur-[150px]"
      />

      {/* Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-20 w-full px-6 md:px-10 lg:px-16 py-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <img src={logo} alt="MaceyRunners" className="w-10 h-10 rounded-xl shadow-lg ring-1 ring-accent/20" />
          <span className="font-display font-bold text-xl text-foreground tracking-tight">MaceyRunners</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to="/login">
            <Button variant="ghost" className="rounded-full text-sm font-semibold text-muted-foreground hover:text-foreground">
              Login
            </Button>
          </Link>
          <Link to="/signup" className="hidden sm:block">
            <Button className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground text-sm font-bold px-6 shadow-lg shadow-accent/20">
              Get Started
            </Button>
          </Link>
        </div>
      </motion.nav>

      {/* Main content — horizontal on md+, stacked on mobile */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center relative z-10 px-6 md:px-10 lg:px-16 xl:px-24 gap-8 md:gap-12 lg:gap-20 pb-8 md:pb-0">
        {/* Left / Text side */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="flex-1 max-w-xl text-center md:text-left pt-4 md:pt-0"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-5"
          >
            <Zap className="h-3.5 w-3.5 text-accent" />
            <span className="text-xs font-bold text-accent">Guyana's #1 Delivery App 🇬🇾</span>
          </motion.div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-[1.1] tracking-tight">
            Your Errands & Food,{" "}
            <span className="text-accent">Delivered Fast</span>
          </h1>

          <p className="text-muted-foreground text-base sm:text-lg mt-4 md:mt-5 max-w-md mx-auto md:mx-0 leading-relaxed">
            Order food from local restaurants, get groceries, run errands — all from one app. Fast, reliable, and trusted across Guyana.
          </p>

          {/* Trust points */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center md:justify-start">
            {["Same-day delivery", "Real-time tracking", "Cash or card"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                <span className="font-medium">{item}</span>
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 mt-8 justify-center md:justify-start"
          >
            <Link to="/signup" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto h-13 rounded-2xl text-base font-bold bg-accent hover:bg-accent/90 text-accent-foreground shadow-xl shadow-accent/25 px-8">
                Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto h-13 rounded-2xl text-base font-bold border-2 border-border text-foreground hover:bg-muted/50 px-8">
                Sign In
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Right / Visual side */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex-1 max-w-lg w-full flex flex-col items-center"
        >
          {/* Service cards grid */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-sm md:max-w-md">
            {[
              { icon: ShoppingBag, label: "Food Delivery", desc: "Local restaurants", color: "bg-accent/10 text-accent" },
              { icon: MapPin, label: "Run Errands", desc: "Any task, anytime", color: "bg-primary/10 text-primary" },
              { icon: Truck, label: "Send Packages", desc: "Door to door", color: "bg-green-500/10 text-green-600 dark:text-green-400" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="glass rounded-2xl p-4 sm:p-5 flex flex-col items-center gap-2.5 text-center hover:shadow-lg transition-shadow"
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${item.color} flex items-center justify-center`}>
                  <item.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-foreground leading-tight">{item.label}</span>
                <span className="text-[10px] sm:text-xs text-muted-foreground leading-tight hidden sm:block">{item.desc}</span>
              </motion.div>
            ))}
          </div>

          {/* Delivery illustration / stats card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass rounded-2xl p-5 sm:p-6 mt-4 w-full max-w-sm md:max-w-md"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-accent/10 flex items-center justify-center overflow-hidden shrink-0">
                <img src={deliveryRider} alt="Delivery" className="w-14 h-14 sm:w-18 sm:h-18 object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-sm sm:text-base font-bold text-foreground">Lightning Fast Delivery</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Average delivery in 15–30 minutes across Georgetown & beyond</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border/50">
              {[
                { value: "15min", label: "Avg. Time" },
                { value: "500+", label: "Deliveries" },
                { value: "4.8★", label: "Rating" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-display text-lg sm:text-xl font-extrabold text-accent">{stat.value}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom trust strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="relative z-10 border-t border-border/30 bg-muted/20 backdrop-blur-sm"
      >
        <div className="flex items-center justify-center gap-6 sm:gap-10 py-4 px-6 overflow-x-auto">
          {[
            { icon: Zap, label: "Fast Delivery" },
            { icon: Smartphone, label: "Easy Payment" },
            { icon: Store, label: "Local Stores" },
            { icon: MapPin, label: "Live Tracking" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 shrink-0">
              <item.icon className="h-4 w-4 text-accent" />
              <span className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">{item.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Index;
