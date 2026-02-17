import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorks from "@/components/landing/HowItWorks";
import ServicesSection from "@/components/landing/ServicesSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import PricingSection from "@/components/landing/PricingSection";
import ContactSection from "@/components/landing/ContactSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import CookieConsent from "@/components/landing/CookieConsent";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <ServicesSection />
      <TestimonialsSection />
      <PricingSection />
      <ContactSection />
      <CTASection />
      <Footer />
      <CookieConsent />
    </div>
  );
};

export default Index;
