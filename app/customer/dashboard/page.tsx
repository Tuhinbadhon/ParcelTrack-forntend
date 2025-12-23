"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Clock, CheckCircle, XCircle } from "lucide-react";
import { parcelApi } from "@/lib/api/parcels";
import { Parcel } from "@/lib/store/slices/parcelSlice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CustomerDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    delivered: 0,
    failed: 0,
  });
  const [recentParcels, setRecentParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const parcels = await parcelApi.getMyParcels();
      setRecentParcels(parcels.slice(0, 5));

      setStats({
        total: parcels.length,
        pending: parcels.filter(
          (p) => p.status === "pending" || p.status === "picked_up"
        ).length,
        delivered: parcels.filter((p) => p.status === "delivered").length,
        failed: parcels.filter((p) => p.status === "failed").length,
      });
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
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
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s your parcel overview.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="gap-1 py-4 lg:gap-6 lg:py-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Parcels</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

            <Card className="gap-1 py-4 lg:gap-6 lg:py-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card className="gap-1 py-4 lg:gap-6 lg:py-4">   
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.delivered}</div>
          </CardContent>
        </Card>

        <Card className="gap-1 py-4 lg:gap-6 lg:py-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.failed}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Bookings</CardTitle>
            <Link href="/customer/history">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentParcels.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="mx-auto h-12 w-12 mb-2 opacity-50" />
              <p>No parcels yet</p>
              <Link href="/customer/book-parcel">
                <Button className="mt-4" size="sm">
                  Book Your First Parcel
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentParcels.map((parcel) => (
                <div
                  key={parcel._id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-2 h-2 rounded-full ${getStatusColor(
                        parcel.status
                      )}`}
                    />
                    <div>
                      <p className="font-medium">{parcel.trackingNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {parcel.recipientAddress}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className={`capitalize ${getStatusColor(parcel.status)}`}>
                      {parcel.status.replace("_", " ")}
                    </Badge>
                    <Link href={`/customer/track?id=${parcel.trackingNumber}`}>
                      <Button variant="outline" size="sm">
                        Track
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
