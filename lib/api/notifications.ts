import { apiClient } from "./client";

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
}

export interface SendNotificationData {
  type: "email" | "sms" | "both";
  recipient: string;
  subject?: string;
  message: string;
  parcelId?: string;
}

export const notificationApi = {
  // Send email notification
  sendEmail: async (data: {
    to: string;
    subject: string;
    message: string;
    parcelId?: string;
  }) => {
    const response = await apiClient.post("/notifications/email", data);
    return response.data;
  },

  // Send SMS notification
  sendSMS: async (data: { to: string; message: string; parcelId?: string }) => {
    const response = await apiClient.post("/notifications/sms", data);
    return response.data;
  },

  // Send both email and SMS
  sendBoth: async (data: SendNotificationData) => {
    const response = await apiClient.post("/notifications/send", data);
    return response.data;
  },

  // Get user notification preferences
  getPreferences: async () => {
    const response = await apiClient.get("/notifications/preferences");
    return response.data;
  },

  // Update notification preferences
  updatePreferences: async (preferences: NotificationPreferences) => {
    const response = await apiClient.put(
      "/notifications/preferences",
      preferences
    );
    return response.data;
  },

  // Get notification history (admin only - all notifications)
  getHistory: async () => {
    const response = await apiClient.get("/notifications/history");
    return response.data;
  },

  // Get my notifications (current user's notifications)
  getMyNotifications: async (unreadOnly = false) => {
    const response = await apiClient.get("/notifications", {
      params: { unreadOnly },
    });
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (notificationId: string) => {
    const response = await apiClient.patch(
      `/notifications/${notificationId}/read`
    );
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await apiClient.patch("/notifications/mark-all-read");
    return response.data;
  },

  // Trigger automatic notifications for parcel status change
  notifyParcelUpdate: async (parcelId: string, status: string) => {
    const response = await apiClient.post("/notifications/parcel-update", {
      parcelId,
      status,
    });
    return response.data;
  },
};
