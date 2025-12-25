"use client";

import { NotificationList } from "@/components/shared/NotificationList";
import { useAppSelector } from "@/lib/store/hooks";
import { Bell, Package, MapPin } from "lucide-react";

export default function AgentNotificationsPage() {
  const { notifications, unreadCount } = useAppSelector(
    (state) => state.notification
  );

  // Categorize notifications by priority
  const urgentNotifications = notifications.filter((n) =>
    n.message.toLowerCase().includes("urgent")
  );
  const routeNotifications = notifications.filter((n) =>
    n.message.toLowerCase().includes("route")
  );

  const statCards = [
    {
      title: "Total",
      value: notifications.length,
      description: "All notifications",
      icon: Bell,
    },
    {
      title: "Unread",
      value: unreadCount,
      description: "Requires attention",
      color: "text-blue-600",
    },
    {
      title: "Urgent",
      value: urgentNotifications.length,
      description: "Priority parcels",
      icon: Package,
      color: "text-orange-600",
    },
    {
      title: "Route Updates",
      value: routeNotifications.length,
      description: "Route changes",
      icon: MapPin,
      color: "text-green-600",
    },
  ];

  return (
    <NotificationList
      title="Notifications"
      subtitle="Stay updated on your deliveries and routes"
      statCards={statCards}
      highlightUrgent={true}
    />
  );
}
