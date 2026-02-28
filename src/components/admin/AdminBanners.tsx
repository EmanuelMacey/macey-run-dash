import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2, Megaphone, Bell, ImagePlus, X } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  message: string;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
}

const AdminBanners = () => {
  const { user } = useAuth();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchBanners = async () => {
    const { data } = await supabase
      .from("promotional_banners")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setBanners(data as Banner[]);
  };

  useEffect(() => { fetchBanners(); }, []);

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
    });
    if (error) {
      toast.error("Failed to create banner");
    } else {
      toast.success("Banner created & notifications sent!");
      await sendPromoNotifications(title.trim(), message.trim());
      setTitle("");
      setMessage("");
      setImageFile(null);
      setImagePreview(null);
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

  return (
    <div className="space-y-6">
      <Card className="p-5 space-y-4">
        <h3 className="font-display font-semibold flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" /> Create Promotional Banner
        </h3>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Bell className="h-3 w-3" /> All customers will receive a push notification when you create a banner.
        </p>
        <Input placeholder="Banner title (e.g. KFC Featured Today!)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea placeholder="Banner message..." value={message} onChange={(e) => setMessage(e.target.value)} className="resize-none" rows={2} />

        {/* Image upload */}
        <div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden border border-border aspect-video max-w-xs">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center"
              >
                <X className="h-3 w-3 text-white" />
              </button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-2">
              <ImagePlus className="h-4 w-4" /> Add Featured Image
            </Button>
          )}
        </div>

        <Button onClick={createBanner} disabled={loading || !title.trim() || !message.trim()} className="gap-2">
          <Plus className="h-4 w-4" /> Create & Notify All
        </Button>
      </Card>

      <div className="space-y-3">
        {banners.map((b) => (
          <Card key={b.id} className="p-4 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {b.image_url && (
                <img src={b.image_url} alt={b.title} className="w-16 h-16 rounded-lg object-cover shrink-0 border border-border" />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-card-foreground">{b.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{b.message}</p>
                <p className="text-xs text-muted-foreground mt-2">{new Date(b.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Switch checked={b.is_active} onCheckedChange={() => toggleBanner(b.id, b.is_active)} />
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteBanner(b.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
        {banners.length === 0 && <p className="text-muted-foreground text-sm text-center py-4">No banners yet.</p>}
      </div>
    </div>
  );
};

export default AdminBanners;
