"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Agent } from "@/app/admin/agents/page";

interface ViewPerformanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: Agent | null;
}

export default function ViewPerformanceDialog({
  open,
  onOpenChange,
  agent,
}: ViewPerformanceDialogProps) {
  const statCards = agent
    ? [
        {
          id: "assigned",
          title: "Assigned",
          value: agent.performance?.totalAssigned || 0,
          valueClass: "text-2xl font-bold text-orange-600",
        },
        {
          id: "completed",
          title: "Completed",
          value: agent.performance?.totalCompleted || 0,
          valueClass: "text-2xl font-bold text-green-600",
        },
        {
          id: "rate",
          title: "Delivery Rate",
          value: `${(agent.performance?.completionRate ?? 0).toFixed(2)}%`,
          valueClass: "text-2xl font-bold text-blue-600",
        },
      ]
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
              {statCards?.map((card) => (
                <Card className="py-3 gap-0" key={card.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      {card.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={card.valueClass}>{card.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
