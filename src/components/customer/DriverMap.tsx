import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/integrations/supabase/client";

interface DriverMapProps {
  driverId: string;
  pickupAddress?: string;
  dropoffAddress?: string;
  onEtaChange?: (etaMinutes: number | null) => void;
  customerLat?: number;
  customerLng?: number;
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const AVG_SPEED_KMH = 25;

const DRIVER_ICON = L.divIcon({
  html: `<div style="background: hsl(348, 83%, 52%); width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
  </div>`,
  className: "",
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const PICKUP_ICON = L.divIcon({
  html: `<div style="background: hsl(152, 69%, 40%); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
  </div>`,
  className: "",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const DROPOFF_ICON = L.divIcon({
  html: `<div style="background: hsl(25, 95%, 53%); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
  </div>`,
  className: "",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const CUSTOMER_ICON = L.divIcon({
  html: `<div style="background: hsl(260, 80%, 60%); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  </div>`,
  className: "",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

async function geocode(address: string): Promise<[number, number] | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ", Guyana")}&limit=1`,
      { headers: { "User-Agent": "MaceyRunnersApp/1.0" } }
    );
    const data = await res.json();
    if (data.length > 0) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  } catch (e) {
    console.warn("[DriverMap] Geocode failed for:", address, e);
  }
  return null;
}

const DriverMap = ({ driverId, pickupAddress, dropoffAddress, onEtaChange, customerLat, customerLng }: DriverMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const dropoffMarkerRef = useRef<L.Marker | null>(null);
  const customerMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const [noLocation, setNoLocation] = useState(false);
  const [driverLatLng, setDriverLatLng] = useState<[number, number] | null>(null);
  const [dropoffLatLng, setDropoffLatLng] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (driverLatLng && dropoffLatLng) {
      const distKm = haversineDistance(driverLatLng[0], driverLatLng[1], dropoffLatLng[0], dropoffLatLng[1]);
      const minutes = Math.max(1, Math.round((distKm / AVG_SPEED_KMH) * 60));
      onEtaChange?.(minutes);
    } else {
      onEtaChange?.(null);
    }
  }, [driverLatLng, dropoffLatLng, onEtaChange]);

  const updateMarker = (lat: number, lng: number) => {
    if (!mapInstance.current) return;
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], { icon: DRIVER_ICON }).addTo(mapInstance.current);
      markerRef.current.bindTooltip("Driver", { direction: "top", offset: [0, -18] });
    }
    setDriverLatLng([lat, lng]);
    mapInstance.current.setView([lat, lng], mapInstance.current.getZoom(), { animate: true });
  };

  const updateRouteLine = () => {
    if (!mapInstance.current) return;
    const points: L.LatLng[] = [];
    if (pickupMarkerRef.current) points.push(pickupMarkerRef.current.getLatLng());
    if (markerRef.current) points.push(markerRef.current.getLatLng());
    if (dropoffMarkerRef.current) points.push(dropoffMarkerRef.current.getLatLng());
    if (customerMarkerRef.current) points.push(customerMarkerRef.current.getLatLng());

    if (points.length >= 2) {
      if (routeLineRef.current) {
        routeLineRef.current.setLatLngs(points);
      } else {
        routeLineRef.current = L.polyline(points, {
          color: "hsl(348, 83%, 52%)",
          weight: 3,
          opacity: 0.7,
          dashArray: "8, 8",
        }).addTo(mapInstance.current);
      }
    }
  };

  const fitAllMarkers = () => {
    if (!mapInstance.current) return;
    const markers = [markerRef.current, pickupMarkerRef.current, dropoffMarkerRef.current, customerMarkerRef.current]
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

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
      markerRef.current = null;
      pickupMarkerRef.current = null;
      dropoffMarkerRef.current = null;
      customerMarkerRef.current = null;
      routeLineRef.current = null;
    };
  }, []);

  // Place pickup/dropoff/customer pins
  useEffect(() => {
    if (!mapInstance.current) return;

    const placeAddressPins = async () => {
      if (pickupAddress) {
        const coords = await geocode(pickupAddress);
        if (coords && mapInstance.current) {
          if (pickupMarkerRef.current) pickupMarkerRef.current.setLatLng(coords);
          else {
            pickupMarkerRef.current = L.marker(coords, { icon: PICKUP_ICON }).addTo(mapInstance.current);
            pickupMarkerRef.current.bindTooltip("Pickup", { direction: "top", offset: [0, -16], permanent: true });
          }
        }
      }

      if (dropoffAddress) {
        const coords = await geocode(dropoffAddress);
        if (coords && mapInstance.current) {
          if (dropoffMarkerRef.current) dropoffMarkerRef.current.setLatLng(coords);
          else {
            dropoffMarkerRef.current = L.marker(coords, { icon: DROPOFF_ICON }).addTo(mapInstance.current);
            dropoffMarkerRef.current.bindTooltip("Dropoff", { direction: "top", offset: [0, -16], permanent: true });
          }
          setDropoffLatLng(coords);
        }
      }

      // Customer pin
      if (customerLat && customerLng && mapInstance.current) {
        if (customerMarkerRef.current) customerMarkerRef.current.setLatLng([customerLat, customerLng]);
        else {
          customerMarkerRef.current = L.marker([customerLat, customerLng], { icon: CUSTOMER_ICON }).addTo(mapInstance.current);
          customerMarkerRef.current.bindTooltip("Customer", { direction: "top", offset: [0, -16], permanent: true });
        }
      }

      updateRouteLine();
      fitAllMarkers();
    };

    placeAddressPins();
  }, [pickupAddress, dropoffAddress, customerLat, customerLng]);

  // Fetch initial position
  useEffect(() => {
    const fetchDriver = async () => {
      const { data } = await supabase.from("drivers").select("current_lat, current_lng").eq("user_id", driverId).single();
      if (data?.current_lat && data?.current_lng) {
        updateMarker(data.current_lat, data.current_lng);
        setNoLocation(false);
        updateRouteLine();
        fitAllMarkers();
      } else {
        setNoLocation(true);
      }
    };
    fetchDriver();
  }, [driverId]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`driver-location-${driverId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "drivers", filter: `user_id=eq.${driverId}` },
        (payload) => {
          const { current_lat, current_lng } = payload.new as { current_lat: number | null; current_lng: number | null };
          if (current_lat && current_lng) {
            updateMarker(current_lat, current_lng);
            setNoLocation(false);
            updateRouteLine();
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [driverId]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-border">
      <div ref={mapRef} className="h-52 w-full" />
      {noLocation && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/80 text-muted-foreground text-xs">
          Waiting for driver location...
        </div>
      )}
      <div className="flex items-center gap-3 px-3 py-2 bg-muted/50 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full" style={{ background: "hsl(152, 69%, 40%)" }} /> Pickup</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full" style={{ background: "hsl(25, 95%, 53%)" }} /> Dropoff</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full" style={{ background: "hsl(348, 83%, 52%)" }} /> Driver</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full" style={{ background: "hsl(260, 80%, 60%)" }} /> Customer</span>
      </div>
    </div>
  );
};

export default DriverMap;
