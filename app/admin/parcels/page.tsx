"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, Eye, UserPlus } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { parcelApi } from "@/lib/api/parcels";
import { userApi } from "@/lib/api/users";
import { Parcel } from "@/lib/store/slices/parcelSlice";

export default function AdminParcelsPage() {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [parcelsData, agentsData] = await Promise.all([
        parcelApi.getParcels(),
        userApi.getAgents(),
      ]);
      setParcels(parcelsData);
      setAgents(agentsData);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignAgent = async () => {
    if (!selectedAgent || !selectedParcel) return;

    try {
      await parcelApi.assignAgent(selectedParcel._id, {
        agentId: selectedAgent,
      });
      toast.success("Agent assigned successfully");
      setAssignDialogOpen(false);
      setSelectedAgent("");
      loadData(); // Reload data
    } catch (error) {
      toast.error("Failed to assign agent");
    }
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

  const filteredParcels = parcels.filter((p) => {
    const searchLower = searchTerm.toLowerCase();
    const senderName = typeof p.sender === "object" ? p.sender.name : "";
    return (
      p.trackingNumber.toLowerCase().includes(searchLower) ||
      senderName.toLowerCase().includes(searchLower) ||
      p.recipientName.toLowerCase().includes(searchLower)
    );
  });

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
        <h1 className="text-3xl font-bold">Parcel Management</h1>
        <p className="text-muted-foreground">View and manage all parcels</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Parcels ({filteredParcels.length})</CardTitle>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search parcels..."
                className="pl-8 w-62.5"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking</TableHead>
                  <TableHead>Sender</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParcels.map((parcel) => {
                  const senderName =
                    typeof parcel.senderId === "object"
                      ? parcel.senderId.name
                      : "N/A";
                  const agentName =
                    typeof parcel.agentId === "object"
                      ? parcel.agentId.name
                      : null;

                  return (
                    <TableRow key={parcel._id}>
                      <TableCell className="font-medium">
                        {parcel.trackingNumber}
                      </TableCell>
                      <TableCell>{senderName}</TableCell>
                      <TableCell>{parcel.recipientName}</TableCell>
                      <TableCell>
                        {agentName || (
                          <Badge variant="outline" className="text-xs">
                            Unassigned
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="max-w-50 truncate">
                        {parcel.recipientAddress}
                      </TableCell>
                      <TableCell>{getStatusBadge(parcel.status)}</TableCell>
                      <TableCell>৳{parcel.cost}</TableCell>
                      <TableCell>{parcel.weight} kg</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedParcel(parcel);
                              setAssignDialogOpen(true);
                            }}
                            disabled={!!agentName}
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                          
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Agent</DialogTitle>
          </DialogHeader>
          {selectedParcel && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-muted-foreground">Parcel</p>
                <p className="font-semibold">{selectedParcel.trackingNumber}</p>
                <p className="text-sm">{selectedParcel.recipientAddress}</p>
              </div>

              <div className="space-y-2">
                <Label>Select Agent</Label>
                <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent) => (
                      <SelectItem key={agent._id} value={agent._id}>
                        {agent.name} ({agent.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" onClick={handleAssignAgent}>
                  Assign Agent
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setAssignDialogOpen(false)}
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
