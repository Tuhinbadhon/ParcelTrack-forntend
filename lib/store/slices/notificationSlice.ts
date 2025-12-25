import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Notification {
  id: string;
  _id?: string; // Backend ID for syncing
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: string;
  read: boolean;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    addNotification: (
      state,
      action: PayloadAction<
        Omit<Notification, "id" | "timestamp" | "read"> & { _id?: string }
      >
    ) => {
      const notification: Notification = {
        ...action.payload,
        id: action.payload._id || Date.now().toString(),
        _id: action.payload._id,
        timestamp: new Date().toISOString(),
        read: false,
      };
      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      );
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount -= 1;
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach((n) => (n.read = true));
      state.unreadCount = 0;
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    resetNotifications: () => initialState,
    setNotifications: (state, action: PayloadAction<any[]>) => {
      // Replace all notifications with fetched ones from backend
      state.notifications = action.payload.map((n) => ({
        ...n,
        id: n._id || n.id || Date.now().toString(),
        _id: n._id,
        timestamp: n.timestamp || n.createdAt || new Date().toISOString(),
      }));
      state.unreadCount = state.notifications.filter((n) => !n.read).length;
    },
    loadNotifications: (state, action: PayloadAction<Notification[]>) => {
      // Merge fetched notifications with existing ones (avoid duplicates)
      const existingIds = new Set(state.notifications.map((n) => n.id));
      const newNotifications = action.payload.filter(
        (n) => !existingIds.has(n.id)
      );
      state.notifications = [...state.notifications, ...newNotifications].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      state.unreadCount = state.notifications.filter((n) => !n.read).length;
    },
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  clearNotifications,
  resetNotifications,
  setNotifications,
  loadNotifications,
} = notificationSlice.actions;
export default notificationSlice.reducer;
