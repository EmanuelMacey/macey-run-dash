import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Star, Save, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  is_active: boolean;
  display_order: number;
}

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", location: "", rating: 5, text: "", is_active: true, display_order: 0 });

  const fetchTestimonials = async () => {
    const { data } = await supabase
      .from("testimonials")
      .select("*")
      .order("display_order", { ascending: true });
    setTestimonials((data as Testimonial[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchTestimonials(); }, []);

  const resetForm = () => {
    setForm({ name: "", location: "", rating: 5, text: "", is_active: true, display_order: testimonials.length + 1 });
    setEditingId(null);
  };

  const openEdit = (t: Testimonial) => {
    setForm({ name: t.name, location: t.location, rating: t.rating, text: t.text, is_active: t.is_active, display_order: t.display_order });
    setEditingId(t.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.text) {
      toast.error("Name and testimonial text are required");
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from("testimonials")
        .update(form as any)
        .eq("id", editingId);
      if (error) toast.error("Failed to update");
      else toast.success("Testimonial updated");
    } else {
      const { error } = await supabase
        .from("testimonials")
        .insert(form as any);
      if (error) toast.error("Failed to create");
      else toast.success("Testimonial added");
    }
    setDialogOpen(false);
    resetForm();
    fetchTestimonials();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else {
      toast.success("Testimonial deleted");
      fetchTestimonials();
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("testimonials").update({ is_active: !current } as any).eq("id", id);
    fetchTestimonials();
  };

  if (loading) return <div className="p-8 text-muted-foreground">Loading testimonials...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground">Testimonials</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground rounded-full gap-2" onClick={resetForm}>
              <Plus className="h-4 w-4" /> Add Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Name</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John D." />
                </div>
                <div className="space-y-1.5">
                  <Label>Location</Label>
                  <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Georgetown" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Rating (1-5)</Label>
                  <Input type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value) || 5 })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Display Order</Label>
                  <Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Testimonial Text</Label>
                <Textarea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} rows={4} placeholder="What did they say about MaceyRunners?" />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                <Label>Active (visible on landing page)</Label>
              </div>
              <Button onClick={handleSave} className="w-full gradient-primary text-primary-foreground rounded-full gap-2">
                <Save className="h-4 w-4" /> {editingId ? "Update" : "Add"} Testimonial
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {testimonials.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">No testimonials yet. Add your first one!</Card>
      ) : (
        <div className="space-y-3">
          {testimonials.map((t) => (
            <Card key={t.id} className={`p-4 border ${t.is_active ? "border-border/50" : "border-destructive/20 opacity-60"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-foreground">{t.name}</span>
                    <span className="text-xs text-muted-foreground">• {t.location}</span>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className={i < t.rating ? "text-accent fill-accent" : "text-muted-foreground/20"} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">"{t.text}"</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Switch checked={t.is_active} onCheckedChange={() => toggleActive(t.id, t.is_active)} />
                  <Button variant="ghost" size="icon" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminTestimonials;
