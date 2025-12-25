"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { parcelApi } from "@/lib/api/parcels";
import { Parcel } from "@/lib/store/slices/parcelSlice";
import { format } from "date-fns";
import { Search, Eye } from "lucide-react";
import Link from "next/link";

export default function BookingHistoryPage() {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [filteredParcels, setFilteredParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadParcels();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = parcels.filter(
        (p) =>
          p.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.recipientAddress.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredParcels(filtered);
    } else {
      setFilteredParcels(parcels);
    }
  }, [searchTerm, parcels]);

  const loadParcels = async () => {
    try {
      const data = await parcelApi.getMyParcels();
      setParcels(data);
      setFilteredParcels(data);
    } catch (error) {
      console.error("Failed to load parcels:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-500 text-white";
      case "failed":
        return "bg-red-500 text-white";
      case "in_transit":
        return "bg-blue-500 text-white";
      case "picked_up":
        return "bg-yellow-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Booking History</h1>
        <p className="text-muted-foreground">View all your parcel bookings</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-5 items-center justify-between">
            <CardTitle>All Bookings ({filteredParcels.length})</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by tracking number..."
                  className="pl-8 w-62.5"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredParcels.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No bookings found
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tracking Number</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Delivery Address</TableHead>{" "}
                    <TableHead>Map Links</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParcels.map((parcel) => (
                    <TableRow key={parcel._id}>
                      <TableCell className="font-medium">
                        {parcel.trackingNumber}
                      </TableCell>
                      <TableCell>{parcel.recipientName}</TableCell>
                      <TableCell>{parcel.recipientPhone}</TableCell>
                      <TableCell className="max-w-50 truncate">
                        {parcel.recipientAddress}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {(parcel as any).pickupMapLink && (
                            <a
                              href={(parcel as any).pickupMapLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline"
                            >
                              📍 Pickup
                            </a>
                          )}
                          {(parcel as any).recipientMapLink && (
                            <a
                              href={(parcel as any).recipientMapLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline"
                            >
                              📍 Delivery
                            </a>
                          )}
                          {!(parcel as any).pickupMapLink &&
                            !(parcel as any).recipientMapLink && (
                              <span className="text-xs text-muted-foreground">
                                N/A
                              </span>
                            )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(parcel.status)}>
                          {parcel.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{parcel.weight} kg</TableCell>
                      <TableCell>৳{parcel.cost.toFixed(2)}</TableCell>
                      <TableCell>
                        {parcel.paymentType === "cod" ? "COD" : "Prepaid"}
                      </TableCell>
                      <TableCell>
                        {format(new Date(parcel.createdAt), "PP")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/customer/track?id=${parcel.trackingNumber}`}
                        >
                          <Button
                            variant="outline"
                            className="cursor-pointer"
                            size="sm"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      </TableCell>
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
