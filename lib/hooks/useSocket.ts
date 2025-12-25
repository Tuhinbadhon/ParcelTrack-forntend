"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { updateParcel } from "@/lib/store/slices/parcelSlice";
import {
  addNotification,
  setNotifications,
} from "@/lib/store/slices/notificationSlice";
import { socketService } from "@/lib/socket/socket";
import { notificationApi } from "@/lib/api/notifications";
import { Parcel } from "@/lib/store/slices/parcelSlice";

export function useSocket() {
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (token && user) {
      console.log(`🔄 Setting up socket for user: ${user.name} (${user.role})`);

      // Fetch notification history from backend
      const fetchNotificationHistory = async () => {
        try {
          console.log("📥 Fetching notification history...");
          const notifications = await notificationApi.getMyNotifications(false); // Get all notifications
          if (notifications && notifications.length > 0) {
            dispatch(setNotifications(notifications));
            console.log(
              `✅ Loaded ${notifications.length} notifications from history`
            );
          } else {
            console.log("ℹ️ No notification history found");
          }
        } catch (error) {
          console.error("❌ Failed to fetch notification history:", error);
        }
      };

      // Fetch history first
      fetchNotificationHistory();

      // Connect to socket with current token
      socketService.connect(token);

      // Wait a brief moment for connection to establish before setting up listeners
      const setupListeners = () => {
        console.log("🎧 Setting up all socket listeners...");

        // Listen for pending notifications when socket connects
        socketService.on(
          "notifications:pending",
          (data: { count: number; notifications: any[] }) => {
            console.log(`📬 Received ${data.count} pending notifications`);
            if (data.notifications && data.notifications.length > 0) {
              data.notifications.forEach((notif) => {
                dispatch(
                  addNotification({
                    _id: notif._id || notif.id,
                    message: notif.message,
                    type: notif.type || "info",
                  })
                );
              });
            }
          }
        );

        // Listen for parcel status updates
        socketService.on(
          "parcel:status-updated",
          (data: { parcel: Parcel }) => {
            dispatch(updateParcel(data.parcel));

            // Notify based on user role
            const senderId =
              typeof data.parcel.sender === "string"
                ? data.parcel.sender
                : data.parcel.sender?._id;
            const agentId =
              typeof data.parcel.agent === "string"
                ? data.parcel.agent
                : data.parcel.agent?._id;

            if (user.role === "customer" && senderId === user.id) {
              dispatch(
                addNotification({
                  message: `Your parcel ${data.parcel.trackingNumber} status updated to ${data.parcel.status}`,
                  type: "info",
                })
              );
            } else if (user.role === "agent" && agentId === user.id) {
              dispatch(
                addNotification({
                  message: `Parcel ${data.parcel.trackingNumber} status updated to ${data.parcel.status}`,
                  type: "info",
                })
              );
            } else if (user.role === "admin") {
              dispatch(
                addNotification({
                  message: `Parcel ${data.parcel.trackingNumber} status updated to ${data.parcel.status}`,
                  type: "info",
                })
              );
            }
          }
        );

        // Listen for new parcel assignments (for agents)
        socketService.on(
          "parcel:assigned",
          (data: { parcel: Parcel; agentId: string }) => {
            if (user.role === "agent" && data.agentId === user.id) {
              dispatch(
                addNotification({
                  message: `New parcel ${data.parcel.trackingNumber} assigned to you`,
                  type: "success",
                })
              );
            }
            if (user.role === "admin") {
              dispatch(
                addNotification({
                  message: `Parcel ${data.parcel.trackingNumber} assigned to agent`,
                  type: "info",
                })
              );
            }
          }
        );

        // Listen for parcel pickup
        socketService.on("parcel:picked-up", (data: { parcel: Parcel }) => {
          const senderId =
            typeof data.parcel.sender === "string"
              ? data.parcel.sender
              : data.parcel.sender?._id;
          if (user.role === "customer" && senderId === user.id) {
            dispatch(
              addNotification({
                message: `Your parcel ${data.parcel.trackingNumber} has been picked up`,
                type: "info",
              })
            );
          }
          if (user.role === "admin") {
            dispatch(
              addNotification({
                message: `Parcel ${data.parcel.trackingNumber} picked up`,
                type: "info",
              })
            );
          }
        });

        // Listen for delivery notifications (for customers)
        socketService.on("parcel:delivered", (data: { parcel: Parcel }) => {
          const senderId =
            typeof data.parcel.sender === "string"
              ? data.parcel.sender
              : data.parcel.sender?._id;
          const agentId =
            typeof data.parcel.agent === "string"
              ? data.parcel.agent
              : data.parcel.agent?._id;

          if (user.role === "customer" && senderId === user.id) {
            dispatch(
              addNotification({
                message: `Your parcel ${data.parcel.trackingNumber} has been delivered successfully! 🎉`,
                type: "success",
              })
            );
          }
          if (user.role === "agent" && agentId === user.id) {
            dispatch(
              addNotification({
                message: `Parcel ${data.parcel.trackingNumber} marked as delivered`,
                type: "success",
              })
            );
          }
          if (user.role === "admin") {
            dispatch(
              addNotification({
                message: `Parcel ${data.parcel.trackingNumber} delivered`,
                type: "success",
              })
            );
          }
        });

        // Listen for location updates
        socketService.on(
          "parcel:location-updated",
          (data: { parcel: Parcel }) => {
            dispatch(updateParcel(data.parcel));

            // Notify customer about location update
            const senderId =
              typeof data.parcel.sender === "string"
                ? data.parcel.sender
                : data.parcel.sender?._id;
            if (user.role === "customer" && senderId === user.id) {
              dispatch(
                addNotification({
                  message: `Location updated for parcel ${data.parcel.trackingNumber}`,
                  type: "info",
                })
              );
            }
          }
        );

        // Listen for new bookings (for admin)
        socketService.on("parcel:new-booking", (data: { parcel: Parcel }) => {
          if (user.role === "admin") {
            dispatch(
              addNotification({
                message: `New parcel booking: ${data.parcel.trackingNumber}`,
                type: "success",
              })
            );
          }
        });

        // Listen for payment received (COD)
        socketService.on(
          "payment:received",
          (data: { parcel: Parcel; amount: number }) => {
            const agentId =
              typeof data.parcel.agent === "string"
                ? data.parcel.agent
                : data.parcel.agent?._id;

            if (user.role === "admin") {
              dispatch(
                addNotification({
                  message: `COD payment received for ${data.parcel.trackingNumber}: $${data.amount}`,
                  type: "success",
                })
              );
            }
            if (user.role === "agent" && agentId === user.id) {
              dispatch(
                addNotification({
                  message: `COD payment collected: $${data.amount}`,
                  type: "success",
                })
              );
            }
          }
        );

        // Listen for email/SMS notifications sent
        socketService.on(
          "notification:sent",
          (data: { type: string; recipient: string; message: string }) => {
            console.log(`${data.type} notification sent to ${data.recipient}`);
          }
        );

        // Listen for critical updates (for admin)
        socketService.on(
          "parcel:failed",
          (data: { parcel: Parcel; reason?: string }) => {
            const senderId =
              typeof data.parcel.sender === "string"
                ? data.parcel.sender
                : data.parcel.sender?._id;
            const agentId =
              typeof data.parcel.agent === "string"
                ? data.parcel.agent
                : data.parcel.agent?._id;

            if (user.role === "admin") {
              dispatch(
                addNotification({
                  message: `Parcel ${
                    data.parcel.trackingNumber
                  } delivery failed${data.reason ? `: ${data.reason}` : ""}`,
                  type: "error",
                })
              );
            }
            if (user.role === "customer" && senderId === user.id) {
              dispatch(
                addNotification({
                  message: `Delivery attempt failed for parcel ${
                    data.parcel.trackingNumber
                  }${data.reason ? `: ${data.reason}` : ""}`,
                  type: "warning",
                })
              );
            }
            if (user.role === "agent" && agentId === user.id) {
              dispatch(
                addNotification({
                  message: `Delivery failed for ${data.parcel.trackingNumber}${
                    data.reason ? `: ${data.reason}` : ""
                  }`,
                  type: "error",
                })
              );
            }
          }
        );

        // Listen for agent updates
        socketService.on(
          "agent:online-status",
          (data: {
            agentId: string;
            isOnline: boolean;
            agentName?: string;
          }) => {
            if (user.role === "admin") {
              dispatch(
                addNotification({
                  message: `Agent ${data.agentName || data.agentId} is now ${
                    data.isOnline ? "online" : "offline"
                  }`,
                  type: "info",
                })
              );
            }
          }
        );

        // Listen for route updates (for agents)
        socketService.on(
          "route:updated",
          (data: { routeId: string; parcelsCount: number }) => {
            if (user.role === "agent") {
              dispatch(
                addNotification({
                  message: `Your delivery route has been updated (${data.parcelsCount} parcels)`,
                  type: "info",
                })
              );
            }
          }
        );

        // Listen for urgent parcels
        socketService.on(
          "parcel:urgent",
          (data: { parcel: Parcel; priority: string }) => {
            const agentId =
              typeof data.parcel.agent === "string"
                ? data.parcel.agent
                : data.parcel.agent?._id;

            if (user.role === "agent" && agentId === user.id) {
              dispatch(
                addNotification({
                  message: `URGENT: Priority delivery for ${data.parcel.trackingNumber}`,
                  type: "warning",
                })
              );
            }
            if (user.role === "admin") {
              dispatch(
                addNotification({
                  message: `Urgent parcel: ${data.parcel.trackingNumber}`,
                  type: "warning",
                })
              );
            }
          }
        );

        // Listen for customer inquiries (for admin and agents)
        socketService.on(
          "customer:inquiry",
          (data: { customerId: string; parcelId: string; message: string }) => {
            if (user.role === "admin" || user.role === "agent") {
              dispatch(
                addNotification({
                  message: `New customer inquiry about parcel`,
                  type: "info",
                })
              );
            }
          }
        );

        // Listen for system alerts (for admin)
        socketService.on(
          "system:alert",
          (data: { message: string; level: "info" | "warning" | "error" }) => {
            if (user.role === "admin") {
              dispatch(
                addNotification({
                  message: data.message,
                  type:
                    data.level === "info"
                      ? "info"
                      : data.level === "warning"
                      ? "warning"
                      : "error",
                })
              );
            }
          }
        );

        // Listen for general notifications
        socketService.on(
          "notification:new",
          (data: {
            message: string;
            type: "info" | "success" | "warning" | "error";
            userId?: string;
          }) => {
            // Check if notification is for this user
            if (!data.userId || data.userId === user.id) {
              dispatch(
                addNotification({
                  message: data.message,
                  type: data.type,
                })
              );
            }
          }
        );

        console.log("✅ All socket listeners attached successfully");
      };

      // Setup listeners immediately
      setupListeners();

      return () => {
        // Cleanup: disconnect socket when component unmounts or user/token changes
        console.log(`🔌 Cleaning up socket for user: ${user?.name}`);
        socketService.disconnect();
      };
    } else {
      // If no token or user, ensure socket is disconnected
      console.log("❌ No token/user - disconnecting socket");
      socketService.disconnect();
    }
  }, [token, user, dispatch]);

  return {
    emitStatusUpdate: (parcelId: string, status: string) => {
      socketService.emit("parcel:update-status", { parcelId, status });
    },
    emitLocationUpdate: (
      parcelId: string,
      location: { lat: number; lng: number }
    ) => {
      socketService.emit("parcel:update-location", { parcelId, location });
    },
    emitAgentStatus: (isOnline: boolean) => {
      socketService.emit("agent:status", { isOnline });
    },
    emitCustomerInquiry: (parcelId: string, message: string) => {
      socketService.emit("customer:inquiry", { parcelId, message });
    },
  };
}
