import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import { ERRAND_CATEGORIES } from "@/pages/ErrandServices";

interface StoreWithProducts {
  id: string;
  name: string;
  category: string;
  products: { name: string; price: number; category: string | null }[];
}

const AdminPriceList = () => {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [stores, setStores] = useState<StoreWithProducts[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: storesData } = await supabase
        .from("marketplace_stores")
        .select("id, name, category")
        .order("name");

      if (!storesData) { setLoading(false); return; }

      const storesWithProducts: StoreWithProducts[] = [];
      for (const store of storesData) {
        const { data: products } = await supabase
          .from("marketplace_products")
          .select("name, price, category")
          .eq("store_id", store.id)
          .eq("is_available", true)
          .order("category")
          .order("name");
        storesWithProducts.push({ ...store, products: products || [] });
      }
      setStores(storesWithProducts);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (role !== "admin") {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Access denied</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Screen-only header */}
      <div className="print:hidden bg-card border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => navigate("/admin")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Admin
        </button>
        <Button onClick={() => window.print()} variant="outline" className="gap-2">
          <Printer className="h-4 w-4" /> Print
        </Button>
      </div>

      {/* Printable content */}
      <div className="max-w-4xl mx-auto px-6 py-8 print:px-0 print:py-4 print:max-w-none">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 print:mb-4">
          <img src={logo} alt="MaceyRunners" className="w-12 h-12 rounded-xl print:w-10 print:h-10" />
          <div>
            <h1 className="font-display text-2xl font-extrabold text-foreground print:text-xl">MaceyRunners — Complete Price List</h1>
            <p className="text-sm text-muted-foreground">Generated {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Errand Services */}
        <section className="mb-10 print:mb-6">
          <h2 className="font-display text-xl font-bold text-foreground mb-4 border-b-2 border-accent pb-2 print:text-lg">
            🏃 Errand Services
          </h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left py-2 font-semibold text-foreground">Service</th>
                <th className="text-left py-2 font-semibold text-foreground">Tier</th>
                <th className="text-right py-2 font-semibold text-foreground">Rate (GYD)</th>
              </tr>
            </thead>
            <tbody>
              {ERRAND_CATEGORIES.map((cat) => (
                <tr key={cat.id} className="border-b border-border/50">
                  <td className="py-2.5">
                    <span className="font-medium text-foreground">{cat.emoji} {cat.title}</span>
                    <br />
                    <span className="text-xs text-muted-foreground">{cat.subtitle}</span>
                  </td>
                  <td className="py-2.5">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${cat.tier === "premium" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}`}>
                      {cat.tier === "premium" ? "Premium" : "Standard"}
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-bold text-foreground">${cat.rate.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-muted-foreground mt-2">+ $100 GYD service fee applies to all errands</p>
        </section>

        {/* Restaurant / Store Products */}
        <section>
          <h2 className="font-display text-xl font-bold text-foreground mb-4 border-b-2 border-primary pb-2 print:text-lg">
            🍔 Restaurant & Store Menus
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : stores.length === 0 ? (
            <p className="text-muted-foreground text-sm">No stores found.</p>
          ) : (
            stores.map((store) => (
              <div key={store.id} className="mb-8 print:mb-4 break-inside-avoid">
                <h3 className="font-display font-bold text-base text-foreground mb-1">{store.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">{store.category}</p>
                {store.products.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No products listed</p>
                ) : (
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-1.5 text-xs font-semibold text-muted-foreground">Item</th>
                        <th className="text-left py-1.5 text-xs font-semibold text-muted-foreground">Category</th>
                        <th className="text-right py-1.5 text-xs font-semibold text-muted-foreground">Price (GYD)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {store.products.map((product, i) => (
                        <tr key={i} className="border-b border-border/30">
                          <td className="py-1.5 text-foreground">{product.name}</td>
                          <td className="py-1.5 text-muted-foreground text-xs">{product.category || "—"}</td>
                          <td className="py-1.5 text-right font-semibold text-foreground">${Number(product.price).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))
          )}
          <p className="text-xs text-muted-foreground mt-2">+ $100 GYD service fee + delivery fee applies to all food orders</p>
        </section>

        {/* Footer */}
        <div className="mt-12 pt-4 border-t border-border text-center print:mt-6">
          <p className="text-xs text-muted-foreground">MaceyRunners — Delivering with Purpose 🏃</p>
          <p className="text-xs text-muted-foreground">464 East Ruimveldt, Georgetown, Guyana | +592 721 9769</p>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { margin: 1cm; }
        }
      `}</style>
    </div>
  );
};

export default AdminPriceList;
