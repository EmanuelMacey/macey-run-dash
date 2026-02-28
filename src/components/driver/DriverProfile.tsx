import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Camera, Save, Loader2, Car, User, ChevronDown, ChevronUp, IdCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DriverProfile = () => {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [vehicleType, setVehicleType] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [expanded, setExpanded] = useState(false);
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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-card/90 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden"
    >
      {/* Collapsed summary bar */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
      >
        <div className="relative">
          <Avatar className="h-14 w-14 border-2 border-primary/30 shadow-lg shadow-primary/10">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt="Driver avatar" />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-success border-2 border-card" />
        </div>
        <div className="flex-1 text-left">
          <h2 className="font-display text-base font-bold text-foreground">My Profile</h2>
          <div className="flex items-center gap-2 mt-0.5">
            {vehicleType && (
              <Badge variant="secondary" className="text-[10px] px-2 py-0 h-5 rounded-lg gap-1">
                <Car className="h-2.5 w-2.5" />
                {vehicleType}
              </Badge>
            )}
            {licensePlate && (
              <Badge variant="outline" className="text-[10px] px-2 py-0 h-5 rounded-lg font-mono tracking-wider">
                {licensePlate}
              </Badge>
            )}
            {!vehicleType && !licensePlate && (
              <span className="text-xs text-muted-foreground">Tap to set up your profile</span>
            )}
          </div>
        </div>
        <div className="text-muted-foreground">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {/* Expandable edit section */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-5 pt-1 space-y-5 border-t border-border/30">
              {/* Avatar upload */}
              <div className="flex items-center gap-4 pt-3">
                <div className="relative">
                  <Avatar className="h-20 w-20 border-2 border-primary/30 shadow-xl">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt="Driver avatar" />
                    ) : null}
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl">
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
                  <p className="font-semibold text-foreground text-sm">Profile Photo</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Customers will see this when you accept their order
                  </p>
                </div>
              </div>

              {/* Vehicle info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <Car className="h-3.5 w-3.5" /> Vehicle Type
                  </Label>
                  <Input
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    placeholder="e.g. Motorcycle"
                    className="rounded-xl text-sm h-10 bg-muted/50 border-border/50 focus:bg-card"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <IdCard className="h-3.5 w-3.5" /> License Plate
                  </Label>
                  <Input
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value)}
                    placeholder="e.g. ABC 1234"
                    className="rounded-xl text-sm h-10 bg-muted/50 border-border/50 focus:bg-card font-mono tracking-wider"
                  />
                </div>
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full rounded-full gradient-primary text-primary-foreground font-semibold h-11">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DriverProfile;
