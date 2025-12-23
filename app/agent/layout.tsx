"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/shared/DashboardLayout";
import { Home, Package, MapPin, CheckCircle } from "lucide-react";

const sidebarItems = [
  { title: "Dashboard", href: "/agent/dashboard", icon: Home },
  { title: "Assigned Parcels", href: "/agent/parcels", icon: Package },
  { title: "Route Map", href: "/agent/route", icon: MapPin },
  { title: "Completed", href: "/agent/completed", icon: CheckCircle },
];

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["agent"]}>
      <DashboardLayout sidebarItems={sidebarItems}>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}
