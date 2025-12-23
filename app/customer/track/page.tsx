"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { parcelApi } from "@/lib/api/parcels";
import { Parcel } from "@/lib/store/slices/parcelSlice";
import {
  MapPin,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Search,
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { QRCodeCanvas } from "qrcode.react";

function TrackingContent() {
  const searchParams = useSearchParams();
  const [trackingNumber, setTrackingNumber] = useState(
    searchParams.get("id") || ""
  );
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      handleTrack(id);
    }
  }, [searchParams]);

  const handleTrack = async (id?: string) => {
    const trackId = id || trackingNumber;
    if (!trackId) {
      toast.error("Please enter a tracking number");
      return;
    }

    setLoading(true);
    try {
      const data = await parcelApi.trackParcel(trackId);
      setParcel(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Parcel not found");
      setParcel(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "in_transit":
        return <MapPin className="h-5 w-5 text-blue-500" />;
      case "picked_up":
        return <Package className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-500";
      case "failed":
        return "bg-red-500";
      case "in_transit":
        return "bg-blue-500";
      case "picked_up":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const statuses = ["pending", "picked_up", "in_transit", "delivered"];
  const currentIndex = parcel ? statuses.indexOf(parcel.status) : -1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Track Parcel</h1>
        <p className="text-muted-foreground">
          Enter your tracking number to get real-time updates
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Input
              placeholder="Enter tracking number"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTrack()}
            />
            <Button onClick={() => handleTrack()} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              {loading ? "Tracking..." : "Track"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {parcel && (
        <>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Parcel Status</CardTitle>
                  <Badge variant="secondary" className={`capitalize ${getStatusColor(parcel.status)}`}>
                    {parcel.status.replace("_", " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Tracking Number
                    </p>
                    <p className="text-lg font-semibold">
                      {parcel.trackingNumber}
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Pickup Address
                      </p>
                      <p className="text-sm">{parcel.pickupAddress}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Delivery Address
                      </p>
                      <p className="text-sm">{parcel.recipientAddress}</p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Recipient Name
                      </p>
                      <p className="text-sm">{parcel.recipientName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Recipient Phone
                      </p>
                      <p className="text-sm">{parcel.recipientPhone}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Weight
                      </p>
                      <p className="text-sm">{parcel.weight} kg</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Cost
                      </p>
                      <p className="text-sm">৳{parcel.cost.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-4">Tracking Timeline</h4>
                  <div className="space-y-4">
                    {statuses.map((status, index) => {
                      const isCompleted = index <= currentIndex;
                      const isCurrent = index === currentIndex;

                      return (
                        <div key={status} className="flex items-start gap-4">
                          <div className="relative">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                isCompleted
                                  ? getStatusColor(status)
                                  : "bg-gray-200"
                              }`}
                            >
                              {isCompleted && (
                                <CheckCircle className="h-5 w-5 text-white" />
                              )}
                            </div>
                            {index < statuses.length - 1 && (
                              <div
                                className={`absolute left-4 top-8 w-0.5 h-8 ${
                                  isCompleted ? "bg-blue-500" : "bg-gray-200"
                                }`}
                              />
                            )}
                          </div>
                          <div className="flex-1 pt-1">
                            <p
                              className={`font-medium capitalize ${
                                isCurrent ? "text-blue-600" : ""
                              }`}
                            >
                              {status.replace("_", " ")}
                            </p>
                            {isCompleted && (
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(parcel.updatedAt), "PPp")}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>QR Code</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <QRCodeCanvas
                  value={parcel.trackingNumber}
                  size={200}
                  level="H"
                  className="p-4 bg-white border"
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
                <p className="text-sm text-center text-muted-foreground">
                  Scan this code for quick tracking
                </p>
              </CardContent>
            </Card>
          </div>

          {parcel.currentLocation && (
            <Card>
              <CardHeader>
                <CardTitle>Live Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Map integration would display here
                    <br />
                    Lat: {parcel.currentLocation.coordinates[1]}, Lng:{" "}
                    {parcel.currentLocation.coordinates[0]}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

export default function TrackParcelPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TrackingContent />
    </Suspense>
  );
}
