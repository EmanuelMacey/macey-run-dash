import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-secondary border-t border-border/10 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-sm">M</span>
            </div>
            <span className="font-display font-bold text-lg text-secondary-foreground">
              MaceyRunners
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm text-secondary-foreground/50">
            <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
            <a href="#services" className="hover:text-primary transition-colors">Services</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
            <Link to="/login" className="hover:text-primary transition-colors">Login</Link>
          </div>

          <p className="text-xs text-secondary-foreground/30">
            © {new Date().getFullYear()} MaceyRunners. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
