import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-secondary/95 backdrop-blur-md border-b border-border/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="MaceyRunners" className="w-9 h-9 rounded-lg object-cover" />
            <span className="font-display font-bold text-lg text-secondary-foreground">
              MaceyRunners
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/marketplace" className="text-sm text-secondary-foreground/70 hover:text-accent transition-colors font-medium">Order Food</Link>
            <a href="#how-it-works" className="text-sm text-secondary-foreground/70 hover:text-accent transition-colors">How It Works</a>
            <a href="#services" className="text-sm text-secondary-foreground/70 hover:text-accent transition-colors">Services</a>
            <a href="#pricing" className="text-sm text-secondary-foreground/70 hover:text-accent transition-colors">Pricing</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="text-secondary-foreground/70 hover:text-secondary-foreground">Log In</Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-6">Get Started</Button>
            </Link>
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-secondary-foreground">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <Link to="/marketplace" className="block text-sm text-secondary-foreground/70 hover:text-accent py-2 font-medium">Order Food</Link>
            <a href="#how-it-works" className="block text-sm text-secondary-foreground/70 hover:text-accent py-2">How It Works</a>
            <a href="#services" className="block text-sm text-secondary-foreground/70 hover:text-accent py-2">Services</a>
            <a href="#pricing" className="block text-sm text-secondary-foreground/70 hover:text-accent py-2">Pricing</a>
            <div className="flex flex-col gap-2 pt-2">
              <Link to="/login"><Button variant="ghost" className="w-full text-secondary-foreground/70">Log In</Button></Link>
              <Link to="/signup"><Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-full">Get Started</Button></Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
