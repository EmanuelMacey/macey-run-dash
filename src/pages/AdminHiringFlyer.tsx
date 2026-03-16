import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import deliveryRider from "@/assets/delivery-rider.png";
import { useRef } from "react";

const AdminHiringFlyer = () => {
  const { role } = useAuth();
  const navigate = useNavigate();
  const flyerRef = useRef<HTMLDivElement>(null);

  if (role !== "admin") {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Access denied</div>;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Screen-only controls */}
      <div className="print:hidden bg-card border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => navigate("/admin")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Admin
        </button>
        <Button onClick={() => window.print()} variant="outline" className="gap-2">
          <Printer className="h-4 w-4" /> Print / Save PDF
        </Button>
      </div>

      {/* Flyer */}
      <div className="flex justify-center p-6 print:p-0">
        <div
          ref={flyerRef}
          className="w-full max-w-[8.5in] bg-white text-gray-900 shadow-2xl print:shadow-none overflow-hidden"
          style={{ aspectRatio: "8.5/11" }}
        >
          {/* Top Banner */}
          <div
            className="relative px-8 pt-10 pb-8"
            style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 60%, #f97316 100%)" }}
          >
            <div className="flex items-center gap-3 mb-6">
              <img src={logo} alt="MaceyRunners" className="w-14 h-14 rounded-2xl shadow-lg border-2 border-white/20" />
              <div>
                <h2 className="text-white font-bold text-2xl tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>MaceyRunners</h2>
                <p className="text-white/70 text-xs font-medium tracking-wider uppercase">Delivering with Purpose</p>
              </div>
            </div>

            <h1
              className="text-white font-extrabold leading-[1.1] mb-3"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "2.8rem" }}
            >
              We're Hiring<br />
              <span style={{ color: "#f97316" }}>Delivery Runners!</span>
            </h1>
            <p className="text-white/80 text-base max-w-md leading-relaxed">
              Join Guyana's fastest-growing delivery team. Earn on your own schedule — part-time or full-time.
            </p>

            {/* Rider illustration */}
            <img
              src={deliveryRider}
              alt=""
              className="absolute right-6 bottom-4 w-32 h-32 object-contain opacity-90 drop-shadow-lg hidden sm:block print:block"
            />
          </div>

          {/* Body */}
          <div className="px-8 py-6">
            {/* Positions */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="border-2 border-blue-600 rounded-2xl p-5 text-center">
                <div className="text-3xl mb-2">⏰</div>
                <h3 className="font-bold text-lg text-blue-700" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Part-Time</h3>
                <p className="text-gray-500 text-sm mt-1">Flexible hours. Perfect for students & side hustlers.</p>
                <p className="text-blue-600 font-bold text-sm mt-2">Choose your own shifts</p>
              </div>
              <div className="border-2 border-orange-500 rounded-2xl p-5 text-center">
                <div className="text-3xl mb-2">🚀</div>
                <h3 className="font-bold text-lg text-orange-600" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Full-Time</h3>
                <p className="text-gray-500 text-sm mt-1">Steady income. Priority orders & top earnings.</p>
                <p className="text-orange-600 font-bold text-sm mt-2">Monday–Saturday shifts</p>
              </div>
            </div>

            {/* Benefits */}
            <h3 className="font-bold text-lg text-gray-800 mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Why Run With Us?
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-6">
              {[
                "💰 Competitive pay per delivery",
                "📱 Easy-to-use runner app",
                "⏱️ Flexible scheduling",
                "🎯 Performance bonuses",
                "🛡️ Safe working environment",
                "📈 Growth opportunities",
                "🏍️ Motorcycle or bicycle accepted",
                "🎓 No experience needed",
              ].map((benefit) => (
                <div key={benefit} className="flex items-start gap-2 py-1">
                  <span className="text-sm leading-relaxed text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Requirements */}
            <div className="bg-gray-50 rounded-2xl p-5 mb-6">
              <h3 className="font-bold text-base text-gray-800 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Requirements
              </h3>
              <ul className="space-y-1.5 text-sm text-gray-600">
                <li>✅ Must be 18 years or older</li>
                <li>✅ Valid ID required</li>
                <li>✅ Own a motorcycle, bicycle, or reliable transportation</li>
                <li>✅ Smartphone with internet access</li>
                <li>✅ Know your way around Georgetown & surrounding areas</li>
              </ul>
            </div>

            {/* CTA */}
            <div
              className="rounded-2xl p-6 text-center"
              style={{ background: "linear-gradient(135deg, #1e3a5f, #2563eb)" }}
            >
              <h3 className="text-white font-extrabold text-xl mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Ready to Start Earning?
              </h3>
              <p className="text-white/80 text-sm mb-3">Apply now — it only takes 2 minutes!</p>
              <div className="inline-block bg-orange-500 text-white font-bold text-base px-8 py-3 rounded-full shadow-lg">
                Apply at macey-run-dash.lovable.app/signup
              </div>
              <div className="flex items-center justify-center gap-6 mt-4 text-white/70 text-sm">
                <span>📞 +592 721 9769</span>
                <span>💬 WhatsApp us</span>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="px-8 py-3 text-center border-t border-gray-100">
            <p className="text-[11px] text-gray-400">
              © {new Date().getFullYear()} MaceyRunners • 464 East Ruimveldt, Georgetown, Guyana
            </p>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; }
          @page { margin: 0; size: letter; }
        }
      `}</style>
    </div>
  );
};

export default AdminHiringFlyer;
