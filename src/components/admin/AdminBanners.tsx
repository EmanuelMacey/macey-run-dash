import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, Megaphone, Bell, ImagePlus, X, Eye, EyeOff, Calendar, Sparkles, Link2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Banner {
  id: string;
  title: string;
  message: string;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
  linked_product_id: string | null;
  linked_store_id: string | null;
}

interface Product {
  id: string;
  name: string;
  price: number;
  store_id: string;
  store_name?: string;
}

interface Store {
  id: string;
  name: string;
}

const AdminBanners = () => {
  const { user } = useAuth();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [linkedStoreId, setLinkedStoreId] = useState<string>("none");
  const [linkedProductId, setLinkedProductId] = useState<string>("none");
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchBanners = async () => {
    const { data } = await supabase
      .from("promotional_banners")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setBanners(data as Banner[]);
  };

  const fetchStoresAndProducts = async () => {
    const [{ data: storesData }, { data: productsData }] = await Promise.all([
      supabase.from("marketplace_stores").select("id, name").order("name"),
      supabase.from("marketplace_products").select("id, name, price, store_id").eq("is_available", true).order("name"),
    ]);
    if (storesData) setStores(storesData);
    if (productsData && storesData) {
      const storeMap = Object.fromEntries(storesData.map(s => [s.id, s.name]));
      setProducts(productsData.map(p => ({ ...p, store_name: storeMap[p.store_id] || "Unknown" })));
    }
  };

  useEffect(() => { fetchBanners(); fetchStoresAndProducts(); }, []);

  const sendPromoNotifications = async (bannerTitle: string, bannerMessage: string) => {
    try {
      const { data: customers } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "customer");
      if (!customers || customers.length === 0) return;
      const notifications = customers.map(c => ({
        user_id: c.user_id,
        title: `🎉 ${bannerTitle}`,
        message: bannerMessage,
        type: "promo",
      }));
      await supabase.from("notifications").insert(notifications);
    } catch (err) {
      console.error("Failed to send promo notifications:", err);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("banner-images").upload(path, file);
    if (error) {
      toast.error("Failed to upload image");
      return null;
    }
    const { data } = supabase.storage.from("banner-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleProductSelect = (productId: string) => {
    setLinkedProductId(productId);
    if (productId !== "none") {
      const product = products.find(p => p.id === productId);
      if (product) {
        setLinkedStoreId(product.store_id);
        if (!title.trim()) setTitle(product.name);
      }
    }
  };

  const createBanner = async () => {
    if (!title.trim() || !message.trim() || !user) return;
    setLoading(true);

    let imageUrl: string | null = null;
    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
    }

    const { error } = await supabase.from("promotional_banners").insert({
      title: title.trim(),
      message: message.trim(),
      image_url: imageUrl,
      created_by: user.id,
      linked_product_id: linkedProductId !== "none" ? linkedProductId : null,
      linked_store_id: linkedStoreId !== "none" ? linkedStoreId : null,
    } as any);
    if (error) {
      toast.error("Failed to create banner");
    } else {
      toast.success("Banner created & notifications sent!");
      await sendPromoNotifications(title.trim(), message.trim());
      setTitle("");
      setMessage("");
      setImageFile(null);
      setImagePreview(null);
      setLinkedStoreId("none");
      setLinkedProductId("none");
      fetchBanners();
    }
    setLoading(false);
  };

  const toggleBanner = async (id: string, isActive: boolean) => {
    await supabase.from("promotional_banners").update({ is_active: !isActive }).eq("id", id);
    fetchBanners();
  };

  const deleteBanner = async (id: string) => {
    await supabase.from("promotional_banners").delete().eq("id", id);
    fetchBanners();
  };

  const activeBanners = banners.filter(b => b.is_active).length;
  const filteredProducts = linkedStoreId !== "none" 
    ? products.filter(p => p.store_id === linkedStoreId) 
    : products;

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-primary">{activeBanners} Active</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
          <span className="text-xs font-medium text-muted-foreground">{banners.length} Total</span>
        </div>
      </div>

      {/* Create banner */}
      <Card className="overflow-hidden border-primary/20">
        <div className="gradient-primary px-5 py-3 flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary-foreground" />
          <h3 className="font-display font-bold text-primary-foreground">Create Promotional Banner</h3>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-accent/10 rounded-xl border border-accent/20">
            <Bell className="h-3.5 w-3.5 text-accent" />
            <p className="text-xs text-accent font-medium">All customers receive a push notification when you publish a banner.</p>
          </div>

          {/* Link to product/store */}
          <div className="space-y-3 bg-muted/30 rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <Link2 className="h-4 w-4 text-primary" />
              <Label className="text-sm font-semibold">Link to Product (optional)</Label>
            </div>
            <p className="text-xs text-muted-foreground">Select a store and/or product so customers can shop directly from the banner. Leave empty for general promotions.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Store</Label>
                <Select value={linkedStoreId} onValueChange={(v) => { setLinkedStoreId(v); setLinkedProductId("none"); }}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select store..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No store (general promo)</SelectItem>
                    {stores.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Product</Label>
                <Select value={linkedProductId} onValueChange={handleProductSelect}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select product..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No product</SelectItem>
                    {filteredProducts.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} — ${p.price.toLocaleString()} GYD {p.store_name ? `(${p.store_name})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Input
              placeholder="Banner title (e.g. 🍗 KFC Featured Today!)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl font-medium"
            />
            <Textarea
              placeholder="Describe your promotion..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="resize-none rounded-xl"
              rows={2}
            />
          </div>

          {/* Image upload */}
          <div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
            <AnimatePresence mode="wait">
              {imagePreview ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative rounded-2xl overflow-hidden border-2 border-primary/20 max-w-sm shadow-lg"
                >
                  <img src={imagePreview} alt="Preview" className="w-full object-contain max-h-[300px]" />
                  <Badge className="absolute top-3 left-3 bg-primary/90 text-primary-foreground">Preview</Badge>
                  <button
                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                    className="absolute top-3 right-3 w-7 h-7 rounded-full bg-destructive/90 flex items-center justify-center hover:bg-destructive transition-colors shadow-lg"
                  >
                    <X className="h-3.5 w-3.5 text-destructive-foreground" />
                  </button>
                </motion.div>
              ) : (
                <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full max-w-sm border-2 border-dashed border-border hover:border-primary/50 rounded-2xl p-6 flex flex-col items-center gap-2 transition-colors group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-xl bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                      <ImagePlus className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Add Promo Image</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG — use product/promo images</p>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button
            onClick={createBanner}
            disabled={loading || !title.trim() || !message.trim()}
            className="gradient-primary text-primary-foreground rounded-full font-semibold px-6 gap-2 shadow-lg shadow-primary/20"
          >
            <Plus className="h-4 w-4" /> Create & Notify All Customers
          </Button>
        </div>
      </Card>

      {/* Banner list */}
      <div className="space-y-3">
        <h3 className="font-display font-semibold text-foreground text-sm">All Banners</h3>
        <AnimatePresence>
          {banners.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className={`overflow-hidden transition-all ${b.is_active ? "border-primary/20 shadow-md shadow-primary/5" : "border-border/50 opacity-75"}`}>
                <div className="flex">
                  {b.image_url ? (
                    <div className="w-28 shrink-0 relative">
                      <img src={b.image_url} alt={b.title} className="w-full h-full object-cover min-h-[100px]" />
                    </div>
                  ) : (
                    <div className="w-20 shrink-0 bg-muted flex items-center justify-center">
                      <Megaphone className="h-6 w-6 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="flex-1 p-4 flex items-start justify-between gap-3 min-w-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-display font-bold text-sm text-foreground truncate">{b.title}</h4>
                        <Badge variant={b.is_active ? "default" : "secondary"} className="text-[10px] shrink-0">
                          {b.is_active ? <><Eye className="h-2.5 w-2.5 mr-1" />Live</> : <><EyeOff className="h-2.5 w-2.5 mr-1" />Hidden</>}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{b.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(b.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                        {b.linked_store_id && (
                          <Badge variant="outline" className="text-[10px]">
                            <Link2 className="h-2.5 w-2.5 mr-1" /> Linked
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Switch checked={b.is_active} onCheckedChange={() => toggleBanner(b.id, b.is_active)} />
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => deleteBanner(b.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        {banners.length === 0 && (
          <Card className="p-10 text-center border-dashed">
            <Megaphone className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No banners yet</p>
            <p className="text-xs text-muted-foreground mt-1">Create your first promotional banner above</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminBanners;
