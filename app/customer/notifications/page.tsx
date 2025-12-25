"use client";

import { NotificationList } from "@/components/shared/NotificationList";
import { useAppSelector } from "@/lib/store/hooks";
import { Bell, Package, CheckCircle } from "lucide-react";

export default function CustomerNotificationsPage() {
  const { notifications, unreadCount } = useAppSelector(
    (state) => state.notification
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
      icon: Package,
      color: "text-blue-600",
    },
    {
      title: "Read",
      value: notifications.length - unreadCount,
      description: "Already viewed",
      icon: CheckCircle,
      color: "text-gray-600 dark:text-gray-400",
    },
  ];

  return (
    <NotificationList
      title="Notifications"
      subtitle="View all your parcel updates and alerts"
      statCards={statCards}
    />
  );
}
