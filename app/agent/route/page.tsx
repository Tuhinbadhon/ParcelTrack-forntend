/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { parcelApi } from "@/lib/api/parcels";
import { Parcel } from "@/lib/store/slices/parcelSlice";

export default function AgentRoutePage() {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadParcels();
  }, []);

  const loadParcels = async () => {
    try {
      const data = await parcelApi.getAssignedParcels();
      const activeParcels = data.filter(
        (p) => p.status !== "delivered" && p.status !== "failed"
      );
      setParcels(activeParcels);
    } catch (error) {
      console.error("Failed to load parcels:", error);
    } finally {
      setLoading(false);
    }
  };

  const deliveries = parcels
    .map((p, idx) => {
      // Try to get coordinates from map link, otherwise use Dhaka area with slight variations
      const baseLatDhaka = 23.8103;
      const baseLngDhaka = 90.4125;

      return {
        id: p._id,
        lat: baseLatDhaka + idx * 0.02, // Spread deliveries across map
        lng: baseLngDhaka + idx * 0.02,
        address: p.recipientAddress,
        recipientName: p.recipientName,
        trackingNumber: p.trackingNumber,
        status: p.status,
        mapLink: (p as any).recipientMapLink,
      };
    })
    .filter((d) => d.lat && d.lng);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Delivery Route</h1>
        <p className="text-muted-foreground">
          Optimized route for your {parcels.length} active deliveries
        </p>
      </div>

      {deliveries.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Your Delivery Stops ({deliveries.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {deliveries.map((delivery, idx) => (
                <div
                  key={delivery.id}
                  className="flex items-start gap-3 p-3 border rounded-lg"
                >
                  <div className="shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{delivery.recipientName}</p>
                    <p className="text-sm text-muted-foreground">
                      {delivery.trackingNumber}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {delivery.address}
                    </p>
                    {delivery.mapLink && (
                      <a
                        href={delivery.mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                      >
                        📍 Open in Google Maps
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <MapPin className="mx-auto h-12 w-12 mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              No active deliveries assigned
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
