import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    // Always disconnect existing socket before creating new one
    if (this.socket) {
      console.log("Disconnecting existing socket before reconnecting...");
      this.disconnect();
    }

    console.log(
      "Creating new socket connection with token:",
      token.substring(0, 20) + "..."
    );

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ["websocket"],
      forceNew: true, // Force a new connection
    });

    this.socket.on("connect", () => {
      console.log("✅ Socket connected successfully");
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected. Reason:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
    });
  }

  disconnect() {
    if (this.socket) {
      console.log("🔌 Disconnecting socket and removing all listeners...");
      // Remove all listeners before disconnecting
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      console.log("✅ Socket fully disconnected and cleaned up");
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      console.log(`📡 Attaching listener for event: ${event}`);
      this.socket.on(event, callback);
    } else {
      console.warn(`⚠️ Cannot attach listener for ${event}: socket is null`);
    }
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();
