import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-muted dark:bg-secondary border-t border-border/30 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <img src={logo} alt="MaceyRunners" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-display font-bold text-lg text-foreground">MaceyRunners</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
            <a href="#services" className="hover:text-primary transition-colors">Services</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
            <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
            <a href="#policies" className="hover:text-primary transition-colors">Policies</a>
            <Link to="/login" className="hover:text-primary transition-colors">Login</Link>
          </div>

          <p className="text-xs text-muted-foreground/60">
            © {new Date().getFullYear()} MaceyRunners. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
