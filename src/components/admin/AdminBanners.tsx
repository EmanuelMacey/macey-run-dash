import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2, Megaphone, Bell } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  message: string;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
}

const AdminBanners = () => {
  const { user } = useAuth();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
      // Get all customer user IDs
      const { data: customers } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "customer");
      
      if (!customers || customers.length === 0) return;

      // Insert notifications for all customers
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

  const createBanner = async () => {
    if (!title.trim() || !message.trim() || !user) return;
    setLoading(true);
    const { error } = await supabase.from("promotional_banners").insert({
      title: title.trim(),
      message: message.trim(),
      created_by: user.id,
    });
    if (error) {
      toast.error("Failed to create banner");
    } else {
      toast.success("Banner created & notifications sent!");
      await sendPromoNotifications(title.trim(), message.trim());
      setTitle("");
      setMessage("");
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
        <Input placeholder="Banner title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea placeholder="Banner message..." value={message} onChange={(e) => setMessage(e.target.value)} className="resize-none" rows={2} />
        <Button onClick={createBanner} disabled={loading || !title.trim() || !message.trim()} className="gap-2">
          <Plus className="h-4 w-4" /> Create & Notify All
        </Button>
      </Card>

      <div className="space-y-3">
        {banners.map((b) => (
          <Card key={b.id} className="p-4 flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-card-foreground">{b.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">{b.message}</p>
              <p className="text-xs text-muted-foreground mt-2">{new Date(b.created_at).toLocaleDateString()}</p>
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
