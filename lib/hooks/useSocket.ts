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
