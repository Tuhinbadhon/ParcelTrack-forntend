"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/shared/DashboardLayout";
import { Home, Package, MapPin, Clock } from "lucide-react";

const sidebarItems = [
  { title: "Dashboard", href: "/customer/dashboard", icon: Home },
  { title: "Book Parcel", href: "/customer/book-parcel", icon: Package },
  { title: "Track Parcel", href: "/customer/track", icon: MapPin },
  { title: "Booking History", href: "/customer/history", icon: Clock },
];

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["customer"]}>
      <DashboardLayout sidebarItems={sidebarItems}>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}
