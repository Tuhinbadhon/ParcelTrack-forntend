/**
 * Socket Connection Debugger
 * Use this in browser console to check socket status
 */

import { socketService } from "@/lib/socket/socket";

export const socketDebugger = {
  checkConnection() {
    const socket = socketService.getSocket();
    console.log("=== Socket Status ===");
    console.log("Socket exists:", !!socket);
    console.log("Is connected:", socketService.isConnected());
    if (socket) {
      console.log("Socket ID:", socket.id);
      console.log("Auth token:", socket.auth);
    }
    console.log("==================");
  },

  getListeners() {
    const socket = socketService.getSocket();
    if (socket) {
      console.log("=== Active Listeners ===");
      // eventNames isn't present on the Socket type declaration; use a safe cast
      const eventNames = (socket as any).eventNames?.() ?? "eventNames not available";
      console.log(eventNames);
      console.log("=======================");
    } else {
      console.log("No socket instance");
    }
  },

  testConnection(token: string) {
    console.log("🧪 Testing connection with token...");
    socketService.connect(token);
    setTimeout(() => {
      this.checkConnection();
      this.getListeners();
    }, 1000);
  },
};

// Make available globally in browser console (development only)
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as any).socketDebugger = socketDebugger;
  console.log("💡 Socket debugger available: window.socketDebugger");
}
