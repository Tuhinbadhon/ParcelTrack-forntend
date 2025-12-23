import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import parcelReducer from "./slices/parcelSlice";
import notificationReducer from "./slices/notificationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    parcel: parcelReducer,
    notification: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
