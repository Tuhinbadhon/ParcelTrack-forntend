"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/shared/DashboardLayout";
import { Home, Package, Users, UserCheck, FileText } from "lucide-react";

const sidebarItems = [
  { title: "Dashboard", href: "/admin/dashboard", icon: Home },
  { title: "Parcels", href: "/admin/parcels", icon: Package },
  { title: "Customers", href: "/admin/customers", icon: Users },
  { title: "Agents", href: "/admin/agents", icon: UserCheck },
  { title: "Reports", href: "/admin/reports", icon: FileText },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <DashboardLayout sidebarItems={sidebarItems}>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}
