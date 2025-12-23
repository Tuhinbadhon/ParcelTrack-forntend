"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export default function AgentRoutePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Delivery Route</h1>
        <p className="text-muted-foreground">
          Optimized route for your deliveries
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Route Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MapPin className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Google Maps integration for optimized routing</p>
              <p className="text-sm mt-2">
                Shows all delivery locations with the best route
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
