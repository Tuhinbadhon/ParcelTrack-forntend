/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { NotificationList } from "@/components/shared/NotificationList";
import { useAppSelector } from "@/lib/store/hooks";
import { Bell, AlertCircle, AlertTriangle } from "lucide-react";

export default function AdminNotificationsPage() {
  const { notifications, unreadCount } = useAppSelector(
    (state) => state.notification
  );

  // Group notifications by type
  const notificationsByType = {
    error: notifications.filter((n) => n.type === "error").length,
    warning: notifications.filter((n) => n.type === "warning").length,
  };

  const statCards = [
    {
      title: "Total Alerts",
      value: notifications.length,
      description: "All notifications",
      icon: Bell,
      color: "text-blue-600",
    },
    {
      title: "Unread",
      value: unreadCount,
      description: "Requires attention",
      color: "text-blue-600",
    },
    {
      title: "Errors",
      value: notificationsByType.error,
      description: "Critical issues",
      icon: AlertCircle,
      color: "text-red-600",
    },
    {
      title: "Warnings",
      value: notificationsByType.warning,
      description: "Need attention",
      icon: AlertTriangle,
      color: "text-orange-600",
    },
  ];

  return (
    <NotificationList
      title="Notifications Center"
      subtitle="Monitor all system alerts and updates"
      statCards={statCards}
    />
  );
}
