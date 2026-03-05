import { useRef } from "react";
import logo from "@/assets/maceyrunners-logo.png";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, Package, MapPin, UtensilsCrossed, Zap, Users, Star, Shield, Clock, TrendingUp, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Portfolio = () => {
  const printRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Print-hidden controls */}
      <div className="print:hidden sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button onClick={handlePrint} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <Printer className="h-4 w-4" /> Print / Save PDF
        </Button>
      </div>

      <div ref={printRef} className="max-w-[800px] mx-auto px-6 py-8 print:p-0 print:max-w-none">
        {/* Cover / Header */}
        <header className="text-center mb-12 print:mb-8">
          <img src={logo} alt="MaceyRunners Logo" className="h-20 w-auto mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            MaceyRunners
          </h1>
          <p className="text-lg text-blue-600 font-semibold mb-1">
            Guyana's Premier Delivery & Errand Service
          </p>
          <p className="text-sm text-gray-500">464 East Ruimveldt, Georgetown, Guyana</p>
          <div className="mt-4 w-24 h-1 bg-gradient-to-r from-blue-600 to-orange-500 mx-auto rounded-full" />
        </header>

        {/* Mission */}
        <section className="mb-10 print:mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 border-b-2 border-blue-600 pb-2 inline-block">Our Mission</h2>
          <p className="text-gray-700 leading-relaxed text-base">
            MaceyRunners is redefining convenience in Guyana. We connect everyday people with fast, reliable delivery 
            and errand services — from food delivery to picking up documents, packages, groceries, and more. 
            Our vision is to become Guyana's most trusted on-demand delivery platform, empowering both customers 
            and local riders to thrive.
          </p>
        </section>

        {/* What We Offer */}
        <section className="mb-10 print:mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-600 pb-2 inline-block">What We Offer</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-xl p-5 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Package Delivery</h3>
              <p className="text-sm text-gray-600">Point A to Point B delivery across Georgetown and beyond. Starting at $700 GYD.</p>
            </div>
            <div className="border border-gray-200 rounded-xl p-5 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <MapPin className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Errand Running</h3>
              <p className="text-sm text-gray-600">Need something picked up? We'll handle it for you. Starting at $1,000 GYD.</p>
            </div>
            <div className="border border-gray-200 rounded-xl p-5 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <UtensilsCrossed className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Food Delivery</h3>
              <p className="text-sm text-gray-600">Order from your favourite local restaurants and we deliver straight to your door.</p>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="mb-10 print:mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-600 pb-2 inline-block">Key Features</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Clock, text: "15-30 minute delivery guarantee", color: "text-blue-600" },
              { icon: Smartphone, text: "Real-time GPS driver tracking", color: "text-blue-600" },
              { icon: Star, text: "Loyalty rewards program", color: "text-orange-600" },
              { icon: Users, text: "Referral program ($500 GYD credit)", color: "text-orange-600" },
              { icon: Shield, text: "Secure payments (cash & card)", color: "text-green-600" },
              { icon: Zap, text: "Push notifications & live chat", color: "text-green-600" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                <f.icon className={`h-5 w-5 ${f.color} shrink-0`} />
                <span className="text-sm text-gray-700 font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Revenue Model */}
        <section className="mb-10 print:mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 border-b-2 border-blue-600 pb-2 inline-block">Revenue Model</h2>
          <div className="bg-gradient-to-r from-blue-50 to-orange-50 rounded-xl p-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-bold text-gray-900 mb-1">Platform Fee</p>
                <p className="text-gray-600">40% of delivery fee per completed order</p>
              </div>
              <div>
                <p className="font-bold text-gray-900 mb-1">Driver Earnings</p>
                <p className="text-gray-600">60% goes directly to the rider</p>
              </div>
              <div>
                <p className="font-bold text-gray-900 mb-1">Food Orders</p>
                <p className="text-gray-600">Delivery fee + potential partner commissions</p>
              </div>
              <div>
                <p className="font-bold text-gray-900 mb-1">Growth</p>
                <p className="text-gray-600">Expanding to Linden, New Amsterdam & more</p>
              </div>
            </div>
          </div>
        </section>

        {/* Market Opportunity */}
        <section className="mb-10 print:mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 border-b-2 border-blue-600 pb-2 inline-block">Market Opportunity</h2>
          <p className="text-gray-700 leading-relaxed text-base mb-3">
            Guyana is experiencing unprecedented economic growth with the oil and gas sector driving 
            increased spending power. Yet the on-demand delivery market remains largely untapped — 
            there is no dominant local delivery app. MaceyRunners is positioned to capture this market 
            first, building brand loyalty before competitors enter the space.
          </p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-blue-600">800K+</p>
              <p className="text-xs text-gray-600">Population</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-orange-600">60%</p>
              <p className="text-xs text-gray-600">Urban Population</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-green-600">#1</p>
              <p className="text-xs text-gray-600">GDP Growth CARICOM</p>
            </div>
          </div>
        </section>

        {/* Technology */}
        <section className="mb-10 print:mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 border-b-2 border-blue-600 pb-2 inline-block">Technology Stack</h2>
          <p className="text-gray-700 leading-relaxed text-base">
            Built as a Progressive Web App (PWA), MaceyRunners works seamlessly on any smartphone 
            without needing to download from an app store. Our technology includes real-time GPS tracking, 
            push notifications, in-app chat between customers and riders, automated invoice generation, 
            and a full admin dashboard for business operations. The platform is designed to scale with 
            Guyana's growing digital economy.
          </p>
        </section>

        {/* Ad Script Section */}
        <section className="mb-10 print:mb-6 break-before-page">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 border-b-2 border-orange-500 pb-2 inline-block">
            📺 Advertisement Script — "Life Made Easy"
          </h2>
          <p className="text-xs text-gray-500 italic mb-4">30-60 second video ad script for social media and TV</p>

          <div className="bg-gray-50 rounded-xl p-5 space-y-4 text-sm leading-relaxed border border-gray-200">
            <div>
              <p className="font-bold text-blue-600 text-xs uppercase tracking-wider mb-1">Scene 1 — The Struggle (5 sec)</p>
              <p className="text-gray-700 italic">
                [Close-up of a young woman at her desk, fanning herself, looking stressed. Papers everywhere. Her phone rings.]
              </p>
              <p className="text-gray-900 font-medium mt-1">
                <strong>VOICEOVER:</strong> "You ever gah one ah dem days where everything need to get done... 
                but you can't move from where you deh?"
              </p>
            </div>

            <div>
              <p className="font-bold text-blue-600 text-xs uppercase tracking-wider mb-1">Scene 2 — The Solution (8 sec)</p>
              <p className="text-gray-700 italic">
                [She picks up her phone, opens MaceyRunners. Taps a few buttons. Smiles.]
              </p>
              <p className="text-gray-900 font-medium mt-1">
                <strong>VOICEOVER:</strong> "That's where MaceyRunners come in. You need something pick up? 
                Food deliver? A package send cross town? We handle it. Fast."
              </p>
            </div>

            <div>
              <p className="font-bold text-blue-600 text-xs uppercase tracking-wider mb-1">Scene 3 — The Rider (8 sec)</p>
              <p className="text-gray-700 italic">
                [Cut to a MaceyRunners rider on a motorcycle, zipping through Georgetown streets with a branded bag. 
                The rider waves at a vendor while picking up a package. Upbeat soca/dancehall music playing.]
              </p>
              <p className="text-gray-900 font-medium mt-1">
                <strong>VOICEOVER:</strong> "Our runners deh all over Georgetown — East Ruimveldt, Kitty, 
                Campbellville, Sophia — wherever you need we, we deh there."
              </p>
            </div>

            <div>
              <p className="font-bold text-blue-600 text-xs uppercase tracking-wider mb-1">Scene 4 — Happy Customer (7 sec)</p>
              <p className="text-gray-700 italic">
                [The rider delivers food to a family at their gate. Kids running out excited. Mom smiling, 
                checking her phone — the app shows "Delivered ✓".]
              </p>
              <p className="text-gray-900 font-medium mt-1">
                <strong>VOICEOVER:</strong> "From your favourite restaurant to your front door — 
                hot food, on time, every time. And you can track your rider live on the app!"
              </p>
            </div>

            <div>
              <p className="font-bold text-blue-600 text-xs uppercase tracking-wider mb-1">Scene 5 — Earn With Us (5 sec)</p>
              <p className="text-gray-700 italic">
                [Quick montage: A young man signing up as a rider on his phone. Him earning money. 
                Buying something nice. Big smile.]
              </p>
              <p className="text-gray-900 font-medium mt-1">
                <strong>VOICEOVER:</strong> "And if you got a bike or a car and want to make money on your 
                own time — sign up as a MaceyRunner. Flexible hours, good pay, you in charge."
              </p>
            </div>

            <div>
              <p className="font-bold text-orange-600 text-xs uppercase tracking-wider mb-1">Scene 6 — The Close (7 sec)</p>
              <p className="text-gray-700 italic">
                [MaceyRunners logo fills the screen with a gradient background. App screenshots fly in. 
                The tagline appears below the logo.]
              </p>
              <p className="text-gray-900 font-medium mt-1">
                <strong>VOICEOVER:</strong> "MaceyRunners — Life Made Easy. Download the app now or 
                visit macey-run-dash.lovable.app. Your first delivery? Use code <strong>FIRSTRUN</strong> 
                and get $500 off!"
              </p>
            </div>

            <div className="border-t border-gray-300 pt-3 mt-3">
              <p className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-1">End Card (3 sec)</p>
              <p className="text-gray-700">
                MaceyRunners Logo | "Life Made Easy" | Website URL | Social Media Handles | 
                "Available Now — No Download Needed"
              </p>
            </div>
          </div>
        </section>

        {/* Video Production Notes */}
        <section className="mb-10 print:mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 border-b-2 border-orange-500 pb-2 inline-block">
            🎬 Video Production Notes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="font-bold text-gray-900 mb-2">Visual Style</p>
              <ul className="space-y-1 text-gray-700">
                <li>• Bright, warm colour grading (Guyana sunshine vibes)</li>
                <li>• Mix of lifestyle shots and app screen recordings</li>
                <li>• Locations: Georgetown streets, popular food spots</li>
                <li>• Real people, not actors — authentic Guyanese feel</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="font-bold text-gray-900 mb-2">Audio Direction</p>
              <ul className="space-y-1 text-gray-700">
                <li>• Background: Upbeat soca or modern dancehall instrumental</li>
                <li>• Voiceover: Young Guyanese male or female, natural tone</li>
                <li>• Creolese mixed with standard English for authenticity</li>
                <li>• End with a catchy jingle or memorable tagline</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="font-bold text-gray-900 mb-2">Target Platforms</p>
              <ul className="space-y-1 text-gray-700">
                <li>• Instagram Reels (9:16 vertical, 30 sec)</li>
                <li>• Facebook Video (16:9 horizontal, 60 sec)</li>
                <li>• TikTok (9:16 vertical, 30-45 sec)</li>
                <li>• YouTube Pre-roll (16:9, 15 sec cut)</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="font-bold text-gray-900 mb-2">Key Messages</p>
              <ul className="space-y-1 text-gray-700">
                <li>• Convenience — life made easy</li>
                <li>• Speed — 15-30 minute delivery</li>
                <li>• Local — by Guyanese, for Guyanese</li>
                <li>• Opportunity — earn money as a rider</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="text-center border-t border-gray-200 pt-6">
          <img src={logo} alt="MaceyRunners" className="h-12 w-auto mx-auto mb-3" />
          <p className="font-bold text-gray-900 text-lg">MaceyRunners</p>
          <p className="text-sm text-gray-600">464 East Ruimveldt, Georgetown, Guyana</p>
          <p className="text-sm text-blue-600 font-medium mt-1">macey-run-dash.lovable.app</p>
          <p className="text-xs text-gray-400 mt-4">© {new Date().getFullYear()} MaceyRunners. All rights reserved.</p>
        </section>
      </div>
    </div>
  );
};

export default Portfolio;
