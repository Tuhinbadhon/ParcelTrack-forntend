"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingUp, CheckCircle, Clock } from "lucide-react";
import { parcelApi } from "@/lib/api/parcels";
import { Parcel } from "@/lib/store/slices/parcelSlice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AgentDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    delivered: 0,
    inTransit: 0,
  });
  const [todayParcels, setTodayParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const parcels = await parcelApi.getAssignedParcels();
      setTodayParcels(parcels.slice(0, 5));

      setStats({
        total: parcels.length,
        pending: parcels.filter((p) => p.status === "pending").length,
        inTransit: parcels.filter(
          (p) => p.status === "in_transit" || p.status === "picked_up"
        ).length,
        delivered: parcels.filter((p) => p.status === "delivered").length,
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
        <h1 className="text-3xl font-bold">Agent Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your delivery assignments
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Assigned
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Pickup
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inTransit}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Delivered Today
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.delivered}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Today&apos;s Assignments</CardTitle>
            <Link href="/agent/parcels">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {todayParcels.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="mx-auto h-12 w-12 mb-2 opacity-50" />
              <p>No assignments for today</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todayParcels.map((parcel) => (
                <div
                  key={parcel._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
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
                    {parcel.status !== "delivered" &&
                      parcel.status !== "failed" && (
                        <Link href={`/agent/parcels?id=${parcel._id}`}>
                          <Button
                            className="cursor-pointer"
                            variant="outline"
                            size="sm"
                          >
                            Update
                          </Button>
                        </Link>
                      )}
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
