"use client";

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  markAsRead,
  markAllAsRead,
  clearNotifications,
} from "@/lib/store/slices/notificationSlice";
import { notificationApi } from "@/lib/api/notifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Check, Trash2, LucideIcon } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

interface StatCard {
  title: string;
  value: number | string;
  description: string;
  icon?: LucideIcon;
  color?: string;
}

interface NotificationListProps {
  title?: string;
  subtitle?: string;
  statCards?: StatCard[];
  highlightUrgent?: boolean;
}

export function NotificationList({
  title = "Notifications",
  subtitle = "View all your updates and alerts",
  statCards,
  highlightUrgent = false,
}: NotificationListProps) {
  const dispatch = useAppDispatch();
  const { notifications, unreadCount } = useAppSelector(
    (state) => state.notification
  );
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "read") return n.read;
    return true;
  });

  const handleMarkAsRead = async (id: string, backendId?: string) => {
    // Optimistically update UI
    dispatch(markAsRead(id));

    // Sync with backend if notification has backend ID
    if (backendId) {
      try {
        await notificationApi.markAsRead(backendId);
      } catch (error) {
        console.error("Failed to mark notification as read on backend:", error);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    // Optimistically update UI
    dispatch(markAllAsRead());

    // Sync with backend
    try {
      await notificationApi.markAllAsRead();
    } catch (error) {
      console.error("Failed to mark all as read on backend:", error);
    }
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all notifications?")) {
      dispatch(clearNotifications());
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      default:
        return "ℹ️";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400";
      case "error":
        return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400";
      case "warning":
        return "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400";
      default:
        return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-sm">
              {unreadCount} New
            </Badge>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      {statCards && statCards.length > 0 && (
        <div
          className={`grid gap-4 grid-cols-2 md:grid-cols-${Math.min(
            statCards.length,
            4
          )}`}
        >
          {statCards.map((stat, index) => (
            <Card className="pb-3 gap-0" key={index}>
              <CardHeader className="pb-0">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  {stat.icon && (
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  )}
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color || ""}`}>
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Notifications Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <CardTitle>All Notifications</CardTitle>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark All Read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleClearAll}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="all"
            className="w-full"
            onValueChange={(v) => setFilter(v as any)}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">
                All ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
              <TabsTrigger value="read">
                Read ({notifications.length - unreadCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="mt-6">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">
                    No notifications
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    {filter === "unread"
                      ? "You're all caught up! No unread notifications."
                      : filter === "read"
                      ? "No read notifications yet."
                      : "You don't have any notifications yet."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer ${
                        !notification.read
                          ? "bg-blue-50/50 dark:bg-blue-950/10 border-blue-200 dark:border-blue-900"
                          : "bg-card hover:bg-accent"
                      } ${
                        highlightUrgent &&
                        notification.message.toLowerCase().includes("urgent")
                          ? "border-l-4 border-l-orange-500"
                          : ""
                      }`}
                      onClick={() =>
                        handleMarkAsRead(notification.id, notification._id)
                      }
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-2xl shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="text-sm font-medium leading-relaxed">
                              {notification.message}
                            </p>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full shrink-0 mt-2"></div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className={`text-xs ${getTypeColor(
                                notification.type
                              )}`}
                            >
                              {notification.type}
                            </Badge>
                            {highlightUrgent &&
                              notification.message
                                .toLowerCase()
                                .includes("urgent") && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400"
                                >
                                  URGENT
                                </Badge>
                              )}
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(notification.timestamp), "PPp")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
