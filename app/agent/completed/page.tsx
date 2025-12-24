/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Package, MapPin, Clock } from "lucide-react";
import { parcelApi } from "@/lib/api/parcels";
import { Parcel } from "@/lib/store/slices/parcelSlice";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AgentCompletedPage() {
  const [completedParcels, setCompletedParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    delivered: 0,
    failed: 0,
    total: 0,
  });

  useEffect(() => {
    loadCompletedParcels();
  }, []);

  const loadCompletedParcels = async () => {
    try {
      const parcels = await parcelApi.getAssignedParcels();

      // Filter only completed parcels (delivered or failed)
      const completed = parcels.filter(
        (p) => p.status === "delivered" || p.status === "failed"
      );

      setCompletedParcels(completed);

      setStats({
        delivered: completed.filter((p) => p.status === "delivered").length,
        failed: completed.filter((p) => p.status === "failed").length,
        total: completed.length,
      });
    } catch (error) {
      console.error("Failed to load completed parcels:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "delivered") {
      return (
        <Badge className="bg-green-500 text-white hover:bg-green-600">
          <CheckCircle className="mr-1 h-3 w-3" />
          Delivered
        </Badge>
      );
    }
    return <Badge variant="destructive">Failed</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      id: "total",
      title: "Total Completed",
      value: stats.total,
      icon: Package,
    },
    {
      id: "delivered",
      title: "Successfully Delivered",
      value: stats.delivered,
      valueClass: "text-2xl font-bold text-green-600",
      icon: CheckCircle,
    },
    {
      id: "failed",
      title: "Failed",
      value: stats.failed,
      valueClass: "text-2xl font-bold text-red-600",
      icon: Package,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Completed Deliveries</h1>
        <p className="text-muted-foreground">
          View your delivery history and performance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
        {statCards.map((card) => {
          const Icon = (card.icon as any) || Package;
          return (
            <Card className="py-3 gap-1" key={card.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${"text-muted-foreground"}`} />
              </CardHeader>
              <CardContent>
                <div className={card.valueClass ?? "text-2xl font-bold"}>
                  {card.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Completed Parcels Table */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery History</CardTitle>
        </CardHeader>
        <CardContent>
          {completedParcels.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No completed deliveries yet
              </h3>
              <p className="text-muted-foreground">
                Your completed deliveries will appear here
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tracking ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Status</TableHead>
                    {/* <TableHead className="text-right">Actions</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedParcels.map((parcel) => (
                    <TableRow key={parcel._id}>
                      <TableCell className="font-medium">
                        {parcel.trackingNumber}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {parcel.recipientName}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {parcel.recipientPhone}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-1">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <span className="text-sm">
                            {parcel.recipientAddress}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {formatDate(parcel.updatedAt)}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(parcel.status)}</TableCell>
                      {/* <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </TableCell> */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
