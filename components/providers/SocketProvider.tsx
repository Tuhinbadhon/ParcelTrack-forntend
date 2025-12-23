"use client";

import { useEffect } from "react";
import { useSocket } from "@/lib/hooks/useSocket";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  useSocket(); // Initialize socket connection

  return <>{children}</>;
}
