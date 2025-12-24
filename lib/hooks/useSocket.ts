"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { updateParcel } from "@/lib/store/slices/parcelSlice";
import { addNotification } from "@/lib/store/slices/notificationSlice";
import { socketService } from "@/lib/socket/socket";
import { Parcel } from "@/lib/store/slices/parcelSlice";

export function useSocket() {
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (token && user) {
      // Connect to socket
      socketService.connect(token);

      // Listen for parcel status updates
      socketService.on("parcel:status-updated", (data: { parcel: Parcel }) => {
        dispatch(updateParcel(data.parcel));
        dispatch(
          addNotification({
            message: `Parcel ${data.parcel.trackingNumber} status updated to ${data.parcel.status}`,
            type: "info",
          })
        );
      });

      // Listen for new parcel assignments (for agents)
      socketService.on("parcel:assigned", (data: { parcel: Parcel }) => {
        if (user.role === "agent") {
          dispatch(
            addNotification({
              message: `New parcel ${data.parcel.trackingNumber} assigned to you`,
              type: "info",
            })
          );
        }
      });

      // Listen for delivery notifications (for customers)
      socketService.on("parcel:delivered", (data: { parcel: Parcel }) => {
        if (user.role === "customer") {
          dispatch(
            addNotification({
              message: `Your parcel ${data.parcel.trackingNumber} has been delivered`,
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
        }
      );

      // Listen for new bookings (for admin)
      socketService.on("parcel:new-booking", (data: { parcel: Parcel }) => {
        if (user.role === "admin") {
          dispatch(
            addNotification({
              message: `New parcel booking: ${data.parcel.trackingNumber}`,
              type: "info",
            })
          );
        }
      });

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
          if (user.role === "admin") {
            dispatch(
              addNotification({
                message: `Parcel ${data.parcel.trackingNumber} delivery failed${
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
        (data: { agentId: string; isOnline: boolean }) => {
          if (user.role === "admin") {
            console.log(
              `Agent ${data.agentId} is ${data.isOnline ? "online" : "offline"}`
            );
          }
        }
      );

      return () => {
        socketService.disconnect();
      };
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
  };
}
