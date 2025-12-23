"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Agent } from "@/app/admin/agents/page";

interface Parcel {
  _id: string;
  trackingNumber: string;
  recipientAddress: string;
  status: string;
  createdAt: string;
}

interface ViewPerformanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: Agent | null;
  parcels: Parcel[];
}

export default function ViewPerformanceDialog({
  open,
  onOpenChange,
  agent,
  parcels,
}: ViewPerformanceDialogProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} >
      <DialogContent className="md:max-w-3xl h-90vh overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agent Performance</DialogTitle>
          {agent && (
            <DialogDescription>
              Performance details for {agent.name}
            </DialogDescription>
          )}
        </DialogHeader>
        {agent && (
          <div className="space-y-4">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Assigned
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {agent.performance?.totalAssigned || 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {agent.performance?.totalCompleted || 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Delivery Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {(agent.performance?.completionRate ?? 0).toFixed(2)}%
                  </div>
                </CardContent>
              </Card>
            </div>

            
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
