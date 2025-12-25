"use client";

import { useEffect } from "react";
import { useSocket } from "@/lib/hooks/useSocket";

// Import socket debugger in development
if (process.env.NODE_ENV === "development") {
  import("@/lib/utils/socketDebugger");
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  useSocket(); // Initialize socket connection

  return <>{children}</>;
}
