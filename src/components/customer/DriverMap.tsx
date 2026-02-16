import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/integrations/supabase/client";

interface DriverMapProps {
  driverId: string;
}

const DRIVER_ICON = L.divIcon({
  html: `<div style="background: hsl(215, 55%, 30%); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
  </div>`,
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const DriverMap = ({ driverId }: DriverMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [noLocation, setNoLocation] = useState(false);

  const updateMarker = (lat: number, lng: number) => {
    if (!mapInstance.current) return;
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], { icon: DRIVER_ICON }).addTo(mapInstance.current);
    }
    mapInstance.current.setView([lat, lng], mapInstance.current.getZoom(), { animate: true });
  };

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    mapInstance.current = L.map(mapRef.current, {
      center: [6.8013, -58.1551], // Georgetown, Guyana default
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap',
    }).addTo(mapInstance.current);

    L.control.zoom({ position: "bottomright" }).addTo(mapInstance.current);
    L.control.attribution({ position: "bottomleft" }).addTo(mapInstance.current);

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
      markerRef.current = null;
    };
  }, []);

  // Fetch initial position
  useEffect(() => {
    const fetchDriver = async () => {
      const { data } = await supabase
        .from("drivers")
        .select("current_lat, current_lng")
        .eq("user_id", driverId)
        .single();

      if (data?.current_lat && data?.current_lng) {
        updateMarker(data.current_lat, data.current_lng);
        setNoLocation(false);
      } else {
        setNoLocation(true);
      }
    };
    fetchDriver();
  }, [driverId]);

  // Realtime subscription for driver location updates
  useEffect(() => {
    const channel = supabase
      .channel(`driver-location-${driverId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "drivers",
          filter: `user_id=eq.${driverId}`,
        },
        (payload) => {
          const { current_lat, current_lng } = payload.new as { current_lat: number | null; current_lng: number | null };
          if (current_lat && current_lng) {
            updateMarker(current_lat, current_lng);
            setNoLocation(false);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [driverId]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-border">
      <div ref={mapRef} className="h-48 w-full" />
      {noLocation && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/80 text-muted-foreground text-xs">
          Waiting for driver location...
        </div>
      )}
    </div>
  );
};

export default DriverMap;
