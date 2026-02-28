import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logo from "@/assets/logo.png";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy/70 dark:bg-secondary/70 backdrop-blur-2xl border-b border-navy/10 dark:border-white/10 safe-top">
      <div className="container mx-auto px-4 safe-x">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="MaceyRunners" className="w-9 h-9 rounded-xl object-cover shadow-sm ring-1 ring-primary/20" />
            <span className="font-display font-bold text-lg text-navy-foreground dark:text-white">MaceyRunners</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/marketplace" className="text-sm text-navy-foreground/70 dark:text-white/70 hover:text-primary transition-colors font-medium">{t('nav.orderFood')}</Link>
            <a href="#how-it-works" className="text-sm text-navy-foreground/70 dark:text-white/70 hover:text-primary transition-colors">{t('nav.howItWorks')}</a>
            <a href="#services" className="text-sm text-navy-foreground/70 dark:text-white/70 hover:text-primary transition-colors">{t('nav.services')}</a>
            <a href="#pricing" className="text-sm text-navy-foreground/70 dark:text-white/70 hover:text-primary transition-colors">{t('nav.pricing')}</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link to="/login">
              <Button variant="ghost" className="text-navy-foreground/70 hover:text-navy-foreground dark:text-white/70 dark:hover:text-white rounded-full">{t('nav.login')}</Button>
            </Link>
            <Link to="/signup">
              <Button className="gradient-primary text-primary-foreground rounded-full px-6 shadow-md shadow-primary/20 hover:shadow-lg hover:scale-105 transition-all">{t('nav.getStarted')}</Button>
            </Link>
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-navy-foreground dark:text-white">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-3 animate-fade-in">
            <Link to="/marketplace" className="block text-sm text-secondary-foreground/70 hover:text-primary py-2 font-medium">{t('nav.orderFood')}</Link>
            <a href="#how-it-works" className="block text-sm text-secondary-foreground/70 hover:text-primary py-2">{t('nav.howItWorks')}</a>
            <a href="#services" className="block text-sm text-secondary-foreground/70 hover:text-primary py-2">{t('nav.services')}</a>
            <a href="#pricing" className="block text-sm text-secondary-foreground/70 hover:text-primary py-2">{t('nav.pricing')}</a>
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center justify-between px-2 py-2">
                <span className="text-sm text-secondary-foreground/70">{t('nav.theme')}</span>
                <div className="flex items-center gap-2">
                  <LanguageSwitcher />
                  <ThemeToggle />
                </div>
              </div>
              <Link to="/login"><Button variant="ghost" className="w-full text-secondary-foreground/70 rounded-full">{t('nav.login')}</Button></Link>
              <Link to="/signup"><Button className="w-full gradient-primary text-primary-foreground rounded-full">{t('nav.getStarted')}</Button></Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
