/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google: any;
  }
}

interface AgentData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  assignedParcels: number;
  status: "active" | "inactive";
}

interface ParcelData {
  id: string;
  trackingNumber: string;
  lat: number;
  lng: number;
  status: string;
  agentName?: string;
}

interface FleetTrackingMapProps {
  agents: AgentData[];
  parcels: ParcelData[];
}

export default function FleetTrackingMap({
  agents,
  parcels,
}: FleetTrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [loading, setLoading] = useState<boolean>(apiKey ? true : false);
  const [error, setError] = useState<string | null>(
    apiKey ? null : "Google Maps API key not configured"
  );
  const [selectedType, setSelectedType] = useState<
    "all" | "agents" | "parcels"
  >("all");

  useEffect(() => {
    if (!apiKey) {
      // API key missing, do not attempt to load the map
      return;
    }

    const loadMap = async () => {
      try {
        if (!mapRef.current) return;

        const map = new (window as any).google.maps.Map(mapRef.current, {
          zoom: 11,
          mapTypeControl: true,
          streetViewControl: false,
        });

        const bounds = new (window as any).google.maps.LatLngBounds();

        // Add agent markers
        if (selectedType === "all" || selectedType === "agents") {
          agents.forEach((agent) => {
            const marker = new (window as any).google.maps.Marker({
              position: { lat: agent.lat, lng: agent.lng },
              map,
              title: agent.name,
              icon: {
                url:
                  agent.status === "active"
                    ? "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                    : "https://maps.google.com/mapfiles/ms/icons/grey-dot.png",
              },
            });

            const infoWindow = new (window as any).google.maps.InfoWindow({
              content: `
              <div class="p-2">
                <p class="font-semibold">${agent.name}</p>
                <p class="text-sm">Status: <span class="capitalize">${agent.status}</span></p>
                <p class="text-sm">Assigned Parcels: ${agent.assignedParcels}</p>
              </div>
            `,
            });

            marker.addListener("click", () => {
              infoWindow.open(map, marker);
            });

            bounds.extend(marker.position);
          });
        }

        // Add parcel markers
        if (selectedType === "all" || selectedType === "parcels") {
          parcels.forEach((parcel) => {
            const color =
              parcel.status === "delivered"
                ? "green"
                : parcel.status === "in_transit"
                ? "yellow"
                : parcel.status === "pending"
                ? "red"
                : "orange";

            const marker = new (window as any).google.maps.Marker({
              position: { lat: parcel.lat, lng: parcel.lng },
              map,
              title: parcel.trackingNumber,
              icon: {
                url: `https://maps.google.com/mapfiles/ms/icons/${color}-dot.png`,
              },
            });

            const infoWindow = new (window as any).google.maps.InfoWindow({
              content: `
              <div class="p-2">
                <p class="font-semibold">${parcel.trackingNumber}</p>
                <p class="text-sm">Status: <span class="capitalize">${parcel.status.replace(
                  "_",
                  " "
                )}</span></p>
                ${
                  parcel.agentName
                    ? `<p class="text-sm">Agent: ${parcel.agentName}</p>`
                    : ""
                }
              </div>
            `,
            });

            marker.addListener("click", () => {
              infoWindow.open(map, marker);
            });

            bounds.extend(marker.position);
          });
        }

        if (bounds.isEmpty()) {
          map.setCenter({ lat: 23.8103, lng: 90.4125 }); // Dhaka center
        } else {
          map.fitBounds(bounds);
        }

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
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly`;
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
  }, [agents, parcels, selectedType, apiKey]);

  if (error) {
    return (
      <div className="h-175 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-175 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute top-4 left-4 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 flex gap-2">
        <button
          onClick={() => setSelectedType("all")}
          className={`px-3 py-1 rounded text-sm font-medium ${
            selectedType === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 dark:bg-gray-700"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setSelectedType("agents")}
          className={`px-3 py-1 rounded text-sm font-medium ${
            selectedType === "agents"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 dark:bg-gray-700"
          }`}
        >
          Agents ({agents.length})
        </button>
        <button
          onClick={() => setSelectedType("parcels")}
          className={`px-3 py-1 rounded text-sm font-medium ${
            selectedType === "parcels"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 dark:bg-gray-700"
          }`}
        >
          Parcels ({parcels.length})
        </button>
      </div>

      <div className="absolute top-4 right-4 z-10 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg space-y-2 text-sm">
        <p className="font-semibold mb-2">Legend</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Active Agent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span>Inactive Agent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Delivered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>In Transit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Pending</span>
          </div>
        </div>
      </div>

      <div ref={mapRef} className="w-full h-175 rounded-lg" />
    </div>
  );
}
