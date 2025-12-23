"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/lib/store/hooks";
import { setCredentials, setLoading } from "@/lib/store/slices/authSlice";

export function AuthLoader({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Simply restore auth from localStorage on mount
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        dispatch(setCredentials({ user, token }));
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }

    dispatch(setLoading(false));
  }, [dispatch]);

  return <>{children}</>;
}
