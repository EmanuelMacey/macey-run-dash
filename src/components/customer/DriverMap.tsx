import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/integrations/supabase/client";

interface DriverMapProps {
  driverId: string;
  pickupAddress?: string;
  dropoffAddress?: string;
}

const DRIVER_ICON = L.divIcon({
  html: `<div style="background: hsl(215, 55%, 30%); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
  </div>`,
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const PICKUP_ICON = L.divIcon({
  html: `<div style="background: #16a34a; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/></svg>
  </div>`,
  className: "",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const DROPOFF_ICON = L.divIcon({
  html: `<div style="background: #dc2626; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
  </div>`,
  className: "",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

async function geocode(address: string): Promise<[number, number] | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ", Guyana")}&limit=1`,
      { headers: { "User-Agent": "SwiftDeliveryApp/1.0" } }
    );
    const data = await res.json();
    if (data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
  } catch (e) {
    console.warn("[DriverMap] Geocode failed for:", address, e);
  }
  return null;
}

const DriverMap = ({ driverId, pickupAddress, dropoffAddress }: DriverMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const dropoffMarkerRef = useRef<L.Marker | null>(null);
  const [noLocation, setNoLocation] = useState(false);

  const updateMarker = (lat: number, lng: number) => {
    if (!mapInstance.current) return;
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], { icon: DRIVER_ICON }).addTo(mapInstance.current);
      markerRef.current.bindTooltip("Driver", { direction: "top", offset: [0, -18] });
    }
    mapInstance.current.setView([lat, lng], mapInstance.current.getZoom(), { animate: true });
  };

  const fitAllMarkers = () => {
    if (!mapInstance.current) return;
    const markers = [markerRef.current, pickupMarkerRef.current, dropoffMarkerRef.current]
      .filter(Boolean) as L.Marker[];
    if (markers.length >= 2) {
      const group = L.featureGroup(markers);
      mapInstance.current.fitBounds(group.getBounds().pad(0.2), { animate: true });
    }
  };

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    mapInstance.current = L.map(mapRef.current, {
      center: [6.8013, -58.1551],
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
      pickupMarkerRef.current = null;
      dropoffMarkerRef.current = null;
    };
  }, []);

  // Geocode and place pickup/dropoff pins
  useEffect(() => {
    if (!mapInstance.current) return;

    const placeAddressPins = async () => {
      if (pickupAddress) {
        const coords = await geocode(pickupAddress);
        if (coords && mapInstance.current) {
          if (pickupMarkerRef.current) {
            pickupMarkerRef.current.setLatLng(coords);
          } else {
            pickupMarkerRef.current = L.marker(coords, { icon: PICKUP_ICON }).addTo(mapInstance.current);
            pickupMarkerRef.current.bindTooltip("Pickup", { direction: "top", offset: [0, -16], permanent: true, className: "leaflet-tooltip-pickup" });
          }
        }
      }

      if (dropoffAddress) {
        const coords = await geocode(dropoffAddress);
        if (coords && mapInstance.current) {
          if (dropoffMarkerRef.current) {
            dropoffMarkerRef.current.setLatLng(coords);
          } else {
            dropoffMarkerRef.current = L.marker(coords, { icon: DROPOFF_ICON }).addTo(mapInstance.current);
            dropoffMarkerRef.current.bindTooltip("Dropoff", { direction: "top", offset: [0, -16], permanent: true, className: "leaflet-tooltip-dropoff" });
          }
        }
      }

      fitAllMarkers();
    };

    placeAddressPins();
  }, [pickupAddress, dropoffAddress]);

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
        fitAllMarkers();
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
      <div className="flex items-center gap-3 px-3 py-1.5 bg-muted/50 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-green-600" /> Pickup</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-red-600" /> Dropoff</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full" style={{ background: "hsl(215, 55%, 30%)" }} /> Driver</span>
      </div>
    </div>
  );
};

export default DriverMap;
