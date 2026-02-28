import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, Save, Loader2, Car, User } from "lucide-react";

const DriverProfile = () => {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [vehicleType, setVehicleType] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("drivers")
      .select("avatar_url, vehicle_type, license_plate")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setAvatarUrl(data.avatar_url);
          setVehicleType(data.vehicle_type || "");
          setLicensePlate(data.license_plate || "");
        }
      });
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("driver-avatars")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("driver-avatars")
        .getPublicUrl(path);

      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      await supabase.from("drivers").update({ avatar_url: publicUrl }).eq("user_id", user.id);
      setAvatarUrl(publicUrl);
      toast.success("Profile photo updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("drivers")
        .update({ vehicle_type: vehicleType || null, license_plate: licensePlate || null })
        .eq("user_id", user.id);
      if (error) throw error;
      toast.success("Vehicle info updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-card/90 backdrop-blur-sm border border-border/50 rounded-2xl p-5 mb-6 space-y-5">
      <h2 className="font-display text-lg font-bold text-foreground">My Driver Profile</h2>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="h-20 w-20 border-2 border-primary/30">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt="Driver avatar" />
            ) : null}
            <AvatarFallback className="bg-muted text-muted-foreground text-2xl">
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full gradient-primary flex items-center justify-center shadow-lg border-2 border-card hover:scale-110 transition-transform"
          >
            {uploading ? (
              <Loader2 className="h-3.5 w-3.5 text-primary-foreground animate-spin" />
            ) : (
              <Camera className="h-3.5 w-3.5 text-primary-foreground" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
        </div>
        <div>
          <p className="font-semibold text-foreground">Profile Photo</p>
          <p className="text-xs text-muted-foreground">Customers will see this when you accept their order</p>
        </div>
      </div>

      {/* Vehicle info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs"><Car className="h-3.5 w-3.5" /> Vehicle Type</Label>
          <Input
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            placeholder="e.g. Motorcycle, Car"
            className="rounded-xl text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs">🔢 License Plate</Label>
          <Input
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value)}
            placeholder="e.g. ABC 1234"
            className="rounded-xl text-sm"
          />
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full rounded-full gradient-primary text-primary-foreground font-semibold">
        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
        Save Vehicle Info
      </Button>
    </div>
  );
};

export default DriverProfile;
