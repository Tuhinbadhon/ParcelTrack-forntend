/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google: any;
  }
}

interface Delivery {
  id: string;
  lat: number;
  lng: number;
  address: string;
  recipientName: string;
  trackingNumber: string;
  status: string;
}

interface AgentRouteMapProps {
  deliveries: Delivery[];
  agentLat?: number;
  agentLng?: number;
}

export default function AgentRouteMap({
  deliveries,
  agentLat,
  agentLng,
}: AgentRouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
  } | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.error("Google Maps API key not configured");
      // Defer state updates to avoid calling setState synchronously inside an effect
      setTimeout(() => {
        setError("Google Maps API key not configured");
        setLoading(false);
      }, 0);
      return;
    }

    if (deliveries.length === 0) {
      console.log("No deliveries to show on map");
      // Defer state updates to avoid calling setState synchronously inside an effect
      setTimeout(() => {
        setError("No deliveries assigned");
        setLoading(false);
      }, 0);
      return;
    }

    console.log("Loading route map with", deliveries.length, "deliveries");

    const loadMap = async () => {
      try {
        if (!mapRef.current) {
          console.error("Map container ref not available");
          return;
        }

        console.log("Creating Google Maps instance...");

        const map = new (window as any).google.maps.Map(mapRef.current, {
          zoom: 12,
          mapTypeControl: true,
        });

        const bounds = new (window as any).google.maps.LatLngBounds();

        // Agent location marker
        if (agentLat && agentLng) {
          new (window as any).google.maps.Marker({
            position: { lat: agentLat, lng: agentLng },
            map,
            title: "Your Location",
            icon: {
              url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            },
          });
          bounds.extend({ lat: agentLat, lng: agentLng });
        }

        // Add delivery markers
        deliveries.forEach((delivery, index) => {
          const marker = new (window as any).google.maps.Marker({
            position: { lat: delivery.lat, lng: delivery.lng },
            map,
            label: {
              text: `${index + 1}`,
              color: "white",
              fontSize: "12px",
              fontWeight: "bold",
            },
            title: delivery.recipientName,
          });

          const infoWindow = new (window as any).google.maps.InfoWindow({
            content: `
            <div class="p-2">
              <p class="font-semibold">${delivery.recipientName}</p>
              <p class="text-sm">${delivery.trackingNumber}</p>
              <p class="text-xs text-gray-600">${delivery.address}</p>
            </div>
          `,
          });

          marker.addListener("click", () => {
            infoWindow.open(map, marker);
          });

          bounds.extend(marker.position);
        });

        // Calculate optimized route
        const directionsService = new (
          window as any
        ).google.maps.DirectionsService();
        const directionsRenderer = new (
          window as any
        ).google.maps.DirectionsRenderer({
          map,
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: "#3b82f6",
            strokeWeight: 4,
          },
        });

        if (deliveries.length > 0) {
          const waypoints = deliveries.slice(1, -1).map((d) => ({
            location: { lat: d.lat, lng: d.lng },
            stopover: true,
          }));

          directionsService.route(
            {
              origin:
                agentLat && agentLng
                  ? { lat: agentLat, lng: agentLng }
                  : { lat: deliveries[0].lat, lng: deliveries[0].lng },
              destination: {
                lat: deliveries[deliveries.length - 1].lat,
                lng: deliveries[deliveries.length - 1].lng,
              },
              waypoints,
              optimizeWaypoints: true,
              travelMode: (window as any).google.maps.TravelMode.DRIVING,
            },
            (result: any, status: any) => {
              if (status === "OK") {
                directionsRenderer.setDirections(result);
                const route = result.routes[0];
                let totalDistance = 0;
                let totalDuration = 0;

                route.legs.forEach((leg: any) => {
                  totalDistance += leg.distance.value;
                  totalDuration += leg.duration.value;
                });

                setRouteInfo({
                  distance: (totalDistance / 1000).toFixed(1) + " km",
                  duration: Math.round(totalDuration / 60) + " mins",
                });
              } else {
                console.error("Directions request failed:", status);
                setError(`Failed to calculate route: ${status}`);
              }
            }
          );
        } else {
          console.log("Skipping directions (need 2+ deliveries)");
        }

        map.fitBounds(bounds);
        console.log("Map loaded successfully");
        setLoading(false);
      } catch (err) {
        console.error("Failed to load map:", err);
        setError("Failed to load map: " + (err as Error).message);
        setLoading(false);
      }
    };

    // Load Google Maps script
    if (!window.google?.maps) {
      console.log("Loading Google Maps script...");
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log("Google Maps script loaded successfully");
        loadMap();
      };
      script.onerror = (err) => {
        console.error("Failed to load Google Maps script:", err);
        setError("Failed to load Google Maps script");
        setLoading(false);
      };
      document.head.appendChild(script);
    } else {
      console.log("Google Maps already loaded, initializing map...");
      loadMap();
    }
  }, [deliveries, agentLat, agentLng]);

  if (error) {
    return (
      <div className="h-150 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-150 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={mapRef} className="w-full h-150 rounded-lg" />
      {routeInfo && (
        <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
          <h3 className="font-semibold mb-2">Route Summary</h3>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Distance:</span>{" "}
              <span className="font-medium">{routeInfo.distance}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Duration:</span>{" "}
              <span className="font-medium">{routeInfo.duration}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Stops:</span>{" "}
              <span className="font-medium">{deliveries.length}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
