import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin } from "lucide-react";
import logo from "@/assets/logo.png";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center mesh-bg relative overflow-hidden p-4">
      {/* Gradient orbs */}
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-0 -left-32 w-[500px] h-[500px] bg-destructive/15 rounded-full blur-[150px]"
      />
      <motion.div
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.08, 0.15, 0.08] }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        className="absolute bottom-0 -right-32 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px]"
      />

      <div className="particle w-3 h-3 bg-primary/15 top-24 left-[12%]" style={{ animationDelay: '0s' }} />
      <div className="particle w-2 h-2 bg-accent/15 top-48 right-[18%]" style={{ animationDelay: '3s' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center relative z-10"
      >
        <Link to="/" className="inline-flex items-center gap-2 mb-8">
          <img src={logo} alt="MaceyRunners" className="w-10 h-10 rounded-xl shadow-lg ring-1 ring-primary/20" />
          <span className="font-display font-bold text-xl text-foreground">MaceyRunners</span>
        </Link>

        <div className="w-20 h-20 gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/25">
          <MapPin className="h-10 w-10 text-primary-foreground" />
        </div>

        <h1 className="font-display text-7xl font-extrabold gradient-text mb-3">404</h1>
        <p className="text-xl text-foreground font-display font-semibold mb-2">Page not found</p>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
          Looks like this route doesn't exist. Let's get you back on track.
        </p>

        <Link to="/">
          <Button className="gradient-primary text-primary-foreground rounded-full px-8 h-12 shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-105 transition-all font-semibold">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
