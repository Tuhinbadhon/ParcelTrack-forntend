"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google: any;
  }
}

interface ParcelTrackingMapProps {
  pickupLat: number;
  pickupLng: number;
  deliveryLat: number;
  deliveryLng: number;
  currentLat?: number;
  currentLng?: number;
  trackingNumber: string;
}

export default function ParcelTrackingMap({
  pickupLat,
  pickupLng,
  deliveryLat,
  deliveryLng,
  currentLat,
  currentLng,
  trackingNumber,
}: ParcelTrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const markerRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError("Google Maps API key not configured");
      setLoading(false);
      return;
    }

    const loadMap = async () => {
      try {
        if (!mapRef.current) return;

        const bounds = new (window as any).google.maps.LatLngBounds();

        // Create map
        const map = new (window as any).google.maps.Map(mapRef.current, {
          zoom: 12,
          mapTypeControl: false,
        });
        mapInstanceRef.current = map;

        // Pickup marker (green)
        const pickupMarker = new (window as any).google.maps.Marker({
          position: { lat: pickupLat, lng: pickupLng },
          map,
          title: "Pickup Location",
          icon: {
            path: (window as any).google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#10b981",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
        });
        bounds.extend(pickupMarker.position);

        // Delivery marker (red)
        const deliveryMarker = new (window as any).google.maps.Marker({
          position: { lat: deliveryLat, lng: deliveryLng },
          map,
          title: "Delivery Location",
          icon: {
            path: (window as any).google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#ef4444",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
        });
        bounds.extend(deliveryMarker.position);

        // Current location marker (blue, animated)
        if (currentLat && currentLng) {
          markerRef.current = new (window as any).google.maps.Marker({
            position: { lat: currentLat, lng: currentLng },
            map,
            title: `Parcel ${trackingNumber}`,
            animation: (window as any).google.maps.Animation.BOUNCE,
            icon: {
              path: (window as any).google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#3b82f6",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 3,
            },
          });
          bounds.extend(markerRef.current.position);
        }

        // Draw route line
        const routePath = new (window as any).google.maps.Polyline({
          path: [
            { lat: pickupLat, lng: pickupLng },
            ...(currentLat && currentLng
              ? [{ lat: currentLat, lng: currentLng }]
              : []),
            { lat: deliveryLat, lng: deliveryLng },
          ],
          geodesic: true,
          strokeColor: "#3b82f6",
          strokeOpacity: 0.7,
          strokeWeight: 3,
        });
        routePath.setMap(map);

        map.fitBounds(bounds);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load map:", err);
        setError("Failed to load map");
        setLoading(false);
      }
    };

    // Load Google Maps script
    if (!window.google?.maps) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,marker&v=weekly`;
      script.async = true;
      script.defer = true;
      script.onload = () => loadMap();
      script.onerror = () => {
        setError("Failed to load Google Maps");
        setLoading(false);
      };
      document.head.appendChild(script);
    } else {
      loadMap();
    }
  }, [pickupLat, pickupLng, deliveryLat, deliveryLng, trackingNumber]);

  // Update current location marker when it changes
  useEffect(() => {
    if (markerRef.current && currentLat && currentLng) {
      markerRef.current.setPosition({ lat: currentLat, lng: currentLng });
      if (mapInstanceRef.current) {
        mapInstanceRef.current.panTo({ lat: currentLat, lng: currentLng });
      }
    }
  }, [currentLat, currentLng]);

  if (error) {
    return (
      <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={mapRef} className="w-full h-96 rounded-lg" />
      <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Pickup</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>Current</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>Delivery</span>
        </div>
      </div>
    </div>
  );
}
