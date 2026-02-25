import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload, Users, Loader2, GripVertical, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Leader {
  id: string;
  name: string;
  title: string;
  bio: string;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
}

const AdminLeadership = () => {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Leader | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const fetchLeaders = async () => {
    const { data } = await supabase
      .from("leadership_team")
      .select("*")
      .order("display_order", { ascending: true });
    setLeaders((data as Leader[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchLeaders(); }, []);

  const openAdd = () => {
    setEditing(null);
    setName("");
    setTitle("");
    setBio("");
    setImageUrl(null);
    setDialogOpen(true);
  };

  const openEdit = (leader: Leader) => {
    setEditing(leader);
    setName(leader.name);
    setTitle(leader.title);
    setBio(leader.bio);
    setImageUrl(leader.image_url);
    setDialogOpen(true);
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("leadership-photos").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("leadership-photos").getPublicUrl(path);
      setImageUrl(urlData.publicUrl);
      toast.success("Photo uploaded!");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !title.trim()) return toast.error("Name and title are required");
    setSaving(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from("leadership_team")
          .update({ name: name.trim(), title: title.trim(), bio: bio.trim(), image_url: imageUrl } as any)
          .eq("id", editing.id);
        if (error) throw error;
        toast.success("Updated!");
      } else {
        const maxOrder = leaders.length > 0 ? Math.max(...leaders.map(l => l.display_order)) : 0;
        const { error } = await supabase
          .from("leadership_team")
          .insert({ name: name.trim(), title: title.trim(), bio: bio.trim(), image_url: imageUrl, display_order: maxOrder + 1 } as any);
        if (error) throw error;
        toast.success("Added!");
      }
      setDialogOpen(false);
      fetchLeaders();
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this team member?")) return;
    const { error } = await supabase.from("leadership_team").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else { toast.success("Removed"); fetchLeaders(); }
  };

  const toggleActive = async (leader: Leader) => {
    await supabase.from("leadership_team").update({ is_active: !leader.is_active } as any).eq("id", leader.id);
    fetchLeaders();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" /> Leadership Team
        </h2>
        <Button onClick={openAdd} size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> Add Member
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : leaders.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No team members yet. Add your first one!</p>
      ) : (
        <div className="grid gap-4">
          {leaders.map((leader) => (
            <div key={leader.id} className={`flex items-center gap-4 bg-card border border-border/50 rounded-2xl p-4 transition-all ${!leader.is_active ? "opacity-50" : ""}`}>
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="w-14 h-14 rounded-full bg-muted overflow-hidden shrink-0">
                {leader.image_url ? (
                  <img src={leader.image_url} alt={leader.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full gradient-primary flex items-center justify-center">
                    <span className="font-display text-lg font-bold text-primary-foreground">
                      {leader.name.split(" ").map(n => n[0]).join("")}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-foreground truncate">{leader.name}</p>
                <p className="text-sm text-primary truncate">{leader.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{leader.bio}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleActive(leader)}>
                  <span className={`w-2 h-2 rounded-full ${leader.is_active ? "bg-green-500" : "bg-red-500"}`} />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(leader)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(leader.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">{editing ? "Edit" : "Add"} Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Photo Upload */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-24 h-24 rounded-full bg-muted overflow-hidden relative group">
                {imageUrl ? (
                  <>
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button onClick={() => setImageUrl(null)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-5 w-5 text-white" />
                    </button>
                  </>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors">
                    {uploading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : <Upload className="h-5 w-5 text-muted-foreground" />}
                    <span className="text-[10px] text-muted-foreground mt-1">Upload</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
                  </label>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. John Doe" />
            </div>
            <div className="space-y-2">
              <Label>Role / Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Chief Technology Officer" />
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Brief description..." rows={3} />
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? "Save Changes" : "Add Member"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLeadership;
