import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Save, Loader2, User, Phone } from "lucide-react";
import ReferralSection from "./ReferralSection";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const CUSTOMER_ICON = L.divIcon({
  html: `<div style="background: hsl(348, 83%, 52%); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
  </div>`,
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const CustomerProfile = () => {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, phone, default_address, default_lat, default_lng")
        .eq("user_id", user.id)
        .single();
      if (data) {
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
        setAddress(data.default_address || "");
        setLat(data.default_lat);
        setLng(data.default_lng);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const initLat = lat || 6.8013;
    const initLng = lng || -58.1551;

    mapInstance.current = L.map(mapRef.current, {
      center: [initLat, initLng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(mapInstance.current);

    L.control.zoom({ position: "bottomright" }).addTo(mapInstance.current);

    if (lat && lng) {
      markerRef.current = L.marker([lat, lng], { icon: CUSTOMER_ICON, draggable: true }).addTo(mapInstance.current);
      markerRef.current.on("dragend", () => {
        const pos = markerRef.current!.getLatLng();
        setLat(pos.lat);
        setLng(pos.lng);
      });
    }

    mapInstance.current.on("click", (e: L.LeafletMouseEvent) => {
      const { lat: clickLat, lng: clickLng } = e.latlng;
      setLat(clickLat);
      setLng(clickLng);
      if (markerRef.current) {
        markerRef.current.setLatLng([clickLat, clickLng]);
      } else if (mapInstance.current) {
        markerRef.current = L.marker([clickLat, clickLng], { icon: CUSTOMER_ICON, draggable: true }).addTo(mapInstance.current);
        markerRef.current.on("dragend", () => {
          const pos = markerRef.current!.getLatLng();
          setLat(pos.lat);
          setLng(pos.lng);
        });
      }
    });

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
      markerRef.current = null;
    };
  }, [loading]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone: phone || null,
          default_address: address || null,
          default_lat: lat,
          default_lng: lng,
        })
        .eq("user_id", user.id);
      if (error) throw error;
      toast.success("Profile updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-1">My Profile</h2>
        <p className="text-muted-foreground text-sm">Update your info and pin your delivery location</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Full Name</Label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" className="rounded-xl" />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Phone</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+592 600 0000" className="rounded-xl" />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Delivery Address</Label>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Your default delivery address" className="rounded-xl" />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">📍 Pin Your Location (click or drag)</Label>
        <div ref={mapRef} className="h-56 w-full rounded-2xl overflow-hidden border border-border" />
        {lat && lng && (
          <p className="text-xs text-muted-foreground">
            Coordinates: {lat.toFixed(5)}, {lng.toFixed(5)}
          </p>
        )}
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full h-12 rounded-full gradient-primary text-primary-foreground font-bold">
        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
        Save Profile
      </Button>

      <div className="border-t border-border/50 pt-6">
        <ReferralSection />
      </div>
    </div>
  );
};

export default CustomerProfile;
