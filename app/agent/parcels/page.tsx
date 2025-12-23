"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { parcelApi } from "@/lib/api/parcels";
import { Parcel, ParcelStatus } from "@/lib/store/slices/parcelSlice";
import { Package, MapPin, Phone, User, DollarSign } from "lucide-react";
import toast from "react-hot-toast";
import { QRCodeCanvas } from "qrcode.react";

function ParcelsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [loading, setLoading] = useState(true);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<ParcelStatus>("picked_up");
  const [notes, setNotes] = useState("");
  const [updating, setUpdating] = useState(false);
  const [shouldCheckUrl, setShouldCheckUrl] = useState(true);

  useEffect(() => {
    loadParcels();
  }, []);

  useEffect(() => {
    const parcelId = searchParams.get("id");
    if (parcelId && parcels.length > 0 && shouldCheckUrl) {
      const parcel = parcels.find((p) => p._id === parcelId);
      if (parcel) {
        setSelectedParcel(parcel);
        setNewStatus(parcel.status);
        setUpdateDialogOpen(true);
      }
    }
  }, [searchParams, parcels, shouldCheckUrl]);

  const loadParcels = async () => {
    try {
      const data = await parcelApi.getAssignedParcels();
      setParcels(data);
    } catch (error) {
      console.error("Failed to load parcels:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedParcel) return;

    setUpdating(true);
    try {
      await parcelApi.updateParcelStatus(selectedParcel._id, {
        status: newStatus,
        note: notes,
      });

      toast.success("Status updated successfully");
      setShouldCheckUrl(false); // Prevent URL check from reopening dialog
      setUpdateDialogOpen(false);

      // Clear the URL parameter
      router.push("/agent/parcels");

      await loadParcels();
      setNotes("");

      // Re-enable URL checking after a delay
      setTimeout(() => setShouldCheckUrl(true), 500);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const openUpdateDialog = (parcel: Parcel) => {
    setSelectedParcel(parcel);
    setNewStatus(parcel.status);
    setUpdateDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      picked_up: "default",
      in_transit: "default",
      delivered: "default",
      failed: "destructive",
    };

    return (
      <Badge variant={variants[status] || "default"} className="capitalize">
        {status.replace("_", " ")}
      </Badge>
    );
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
        <h1 className="text-3xl font-bold">Assigned Parcels</h1>
        <p className="text-muted-foreground">
          Manage and update your delivery assignments
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {parcels.map((parcel) => {
          const senderName =
            typeof parcel.sender === "object" ? parcel.sender.name : "N/A";

          return (
            <Card
              key={parcel._id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {parcel.trackingNumber}
                  </CardTitle>
                  {getStatusBadge(parcel.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Delivery Address</p>
                      <p className="text-sm text-muted-foreground">
                        {parcel.recipientAddress}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Recipient</p>
                      <p className="text-sm text-muted-foreground">
                        {parcel.recipientName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">
                        {parcel.recipientPhone}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Weight</p>
                        <p className="text-sm text-muted-foreground">
                          {parcel.weight} kg
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Cost</p>
                        <p className="text-sm text-muted-foreground">
                          ৳{parcel.cost}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => openUpdateDialog(parcel)}
                    disabled={
                      parcel.status === "delivered" ||
                      parcel.status === "failed"
                    }
                  >
                    Update Status
                  </Button>
                  <Button variant="outline">
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {parcels.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="mx-auto h-12 w-12 mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No parcels assigned yet</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update Parcel Status</DialogTitle>
          </DialogHeader>
          {selectedParcel && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-semibold">
                    {selectedParcel.trackingNumber}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedParcel.recipientAddress}
                  </p>
                </div>
                <QRCodeCanvas
                  value={selectedParcel.trackingNumber}
                  size={80}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="space-y-2">
                <Label>New Status</Label>
                <Select
                  value={newStatus}
                  onValueChange={(value) => setNewStatus(value as ParcelStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="picked_up">Picked Up</SelectItem>
                    <SelectItem value="in_transit">In Transit</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  placeholder="Add any notes or comments..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={handleUpdateStatus}
                  disabled={updating}
                >
                  {updating ? "Updating..." : "Update Status"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setUpdateDialogOpen(false)}
                  disabled={updating}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AssignedParcelsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ParcelsContent />
    </Suspense>
  );
}
