# Backend Socket.IO Integration Example

This file shows how to integrate Socket.IO on your backend to work with the frontend notification system.

## Installation

```bash
npm install socket.io
# or
yarn add socket.io
```

## Basic Setup

### 1. Initialize Socket.IO Server

```javascript
// server.js or app.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// Export io to use in other files
module.exports = { io };
```

### 2. Authentication Middleware

```javascript
// middleware/socketAuth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication error"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new Error("User not found"));
    }

    // Attach user to socket
    socket.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    };

    next();
  } catch (error) {
    next(new Error("Authentication error"));
  }
};

module.exports = socketAuth;
```

### 3. Connection Handler

```javascript
// socket/index.js
const socketAuth = require("../middleware/socketAuth");

const setupSocket = (io) => {
  // Apply authentication middleware
  io.use(socketAuth);

  io.on("connection", (socket) => {
    const user = socket.user;

    console.log(`User connected: ${user.name} (${user.role})`);

    // Join role-based room
    socket.join(user.role);

    // Join user-specific room
    socket.join(`user:${user.id}`);

    // Notify admins when agent comes online
    if (user.role === "agent") {
      io.to("admin").emit("agent:online-status", {
        agentId: user.id,
        agentName: user.name,
        isOnline: true,
      });
    }

    // Listen for client events
    socket.on("parcel:update-status", async (data) => {
      // Handle status update
      const { parcelId, status } = data;
      // Update database and emit event
      // ... your logic here
    });

    socket.on("parcel:update-location", async (data) => {
      // Handle location update
      const { parcelId, location } = data;
      // Update database and emit event
      // ... your logic here
    });

    socket.on("agent:status", (data) => {
      // Agent status update
      io.to("admin").emit("agent:online-status", {
        agentId: user.id,
        agentName: user.name,
        isOnline: data.isOnline,
      });
    });

    socket.on("customer:inquiry", async (data) => {
      // Customer inquiry
      io.to("admin").emit("customer:inquiry", {
        customerId: user.id,
        parcelId: data.parcelId,
        message: data.message,
      });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${user.name}`);

      // Notify admins when agent goes offline
      if (user.role === "agent") {
        io.to("admin").emit("agent:online-status", {
          agentId: user.id,
          agentName: user.name,
          isOnline: false,
        });
      }
    });
  });
};

module.exports = setupSocket;
```

### 4. Integrate with Express

```javascript
// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const setupSocket = require("./socket");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  },
});

// Setup socket handlers
setupSocket(io);

// Make io available in routes
app.set("io", io);

// Your routes
app.use("/api/parcels", require("./routes/parcels"));
app.use("/api/auth", require("./routes/auth"));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Emit Events from Controllers

### Parcel Controller Example

```javascript
// controllers/parcelController.js

// Create new parcel
exports.createParcel = async (req, res) => {
  try {
    const parcel = await Parcel.create(req.body);
    await parcel.populate("sender");

    // Get io instance
    const io = req.app.get("io");

    // Notify admins of new booking
    io.to("admin").emit("parcel:new-booking", { parcel });

    res.status(201).json({ success: true, data: parcel });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update parcel status
exports.updateParcelStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const parcel = await Parcel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("sender agent");

    const io = req.app.get("io");

    // Emit to all relevant parties
    io.emit("parcel:status-updated", { parcel });

    // Additional specific notifications based on status
    if (status === "picked_up") {
      io.emit("parcel:picked-up", { parcel });
    } else if (status === "delivered") {
      io.emit("parcel:delivered", { parcel });
    } else if (status === "failed") {
      io.emit("parcel:failed", {
        parcel,
        reason: req.body.reason,
      });
    }

    res.json({ success: true, data: parcel });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Assign parcel to agent
exports.assignParcel = async (req, res) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;

    const parcel = await Parcel.findByIdAndUpdate(
      id,
      { agent: agentId },
      { new: true }
    ).populate("sender agent");

    const io = req.app.get("io");

    // Notify agent and admin
    io.to(`user:${agentId}`).emit("parcel:assigned", {
      parcel,
      agentId,
    });
    io.to("admin").emit("parcel:assigned", {
      parcel,
      agentId,
    });

    res.json({ success: true, data: parcel });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update parcel location
exports.updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng } = req.body;

    const parcel = await Parcel.findByIdAndUpdate(
      id,
      {
        currentLocation: {
          type: "Point",
          coordinates: [lng, lat],
        },
      },
      { new: true }
    ).populate("sender agent");

    const io = req.app.get("io");

    // Notify customer tracking the parcel
    io.emit("parcel:location-updated", { parcel });

    res.json({ success: true, data: parcel });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Record COD payment
exports.recordPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    const parcel = await Parcel.findByIdAndUpdate(
      id,
      {
        paymentStatus: "paid",
        paidAmount: amount,
        paidAt: new Date(),
      },
      { new: true }
    ).populate("sender agent");

    const io = req.app.get("io");

    // Notify admin and agent
    io.to("admin").emit("payment:received", { parcel, amount });

    if (parcel.agent) {
      const agentId =
        typeof parcel.agent === "object"
          ? parcel.agent._id.toString()
          : parcel.agent;
      io.to(`user:${agentId}`).emit("payment:received", {
        parcel,
        amount,
      });
    }

    res.json({ success: true, data: parcel });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Mark as urgent
exports.markUrgent = async (req, res) => {
  try {
    const { id } = req.params;

    const parcel = await Parcel.findByIdAndUpdate(
      id,
      { priority: "high", urgent: true },
      { new: true }
    ).populate("sender agent");

    const io = req.app.get("io");

    // Notify agent and admin
    io.to("admin").emit("parcel:urgent", {
      parcel,
      priority: "high",
    });

    if (parcel.agent) {
      const agentId =
        typeof parcel.agent === "object"
          ? parcel.agent._id.toString()
          : parcel.agent;
      io.to(`user:${agentId}`).emit("parcel:urgent", {
        parcel,
        priority: "high",
      });
    }

    res.json({ success: true, data: parcel });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

### Route Update Example

```javascript
// controllers/routeController.js

exports.updateAgentRoute = async (req, res) => {
  try {
    const { agentId } = req.params;
    const { parcels } = req.body;

    // Update route in database
    const route = await Route.findOneAndUpdate(
      { agent: agentId },
      { parcels, updatedAt: new Date() },
      { new: true, upsert: true }
    );

    const io = req.app.get("io");

    // Notify agent
    io.to(`user:${agentId}`).emit("route:updated", {
      routeId: route._id.toString(),
      parcelsCount: parcels.length,
    });

    res.json({ success: true, data: route });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

### System Alert Example

```javascript
// controllers/systemController.js

exports.sendSystemAlert = async (req, res) => {
  try {
    const { message, level } = req.body;

    const io = req.app.get("io");

    // Notify all admins
    io.to("admin").emit("system:alert", {
      message,
      level: level || "info",
    });

    res.json({ success: true, message: "Alert sent" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

## Helper Functions

Create a utility file to emit notifications easily:

```javascript
// utils/socketHelper.js

class SocketHelper {
  constructor(io) {
    this.io = io;
  }

  // Notify specific user
  notifyUser(userId, message, type = "info") {
    this.io.to(`user:${userId}`).emit("notification:new", {
      message,
      type,
      userId,
    });
  }

  // Notify all users of a role
  notifyRole(role, message, type = "info") {
    this.io.to(role).emit("notification:new", {
      message,
      type,
    });
  }

  // Broadcast to everyone
  notifyAll(message, type = "info") {
    this.io.emit("notification:new", {
      message,
      type,
    });
  }

  // Notify about parcel updates
  notifyParcelUpdate(parcel, eventType = "status-updated") {
    this.io.emit(`parcel:${eventType}`, { parcel });
  }
}

module.exports = SocketHelper;
```

### Usage in Controllers

```javascript
const SocketHelper = require("../utils/socketHelper");

exports.someController = async (req, res) => {
  const io = req.app.get("io");
  const socketHelper = new SocketHelper(io);

  // Notify specific user
  socketHelper.notifyUser("user123", "Your order is ready", "success");

  // Notify all admins
  socketHelper.notifyRole("admin", "New order received", "info");

  // Broadcast to everyone
  socketHelper.notifyAll("System maintenance in 1 hour", "warning");
};
```

## Testing

### Test Socket Connection

```javascript
// test/socket.test.js
const io = require("socket.io-client");

const socket = io("http://localhost:5000", {
  auth: {
    token: "your-jwt-token",
  },
});

socket.on("connect", () => {
  console.log("Connected to server");
});

socket.on("parcel:status-updated", (data) => {
  console.log("Parcel updated:", data);
});

socket.emit("parcel:update-status", {
  parcelId: "123",
  status: "delivered",
});
```

## Environment Variables

```env
PORT=5000
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-secret-key
```

## Complete Flow Example

1. **Customer books parcel** → Backend emits `parcel:new-booking` → Admin receives notification
2. **Admin assigns to agent** → Backend emits `parcel:assigned` → Agent receives notification
3. **Agent picks up** → Backend emits `parcel:picked-up` → Customer receives notification
4. **Location updates** → Backend emits `parcel:location-updated` → Customer sees live tracking
5. **Delivered** → Backend emits `parcel:delivered` → All parties notified
6. **Payment collected** → Backend emits `payment:received` → Admin gets payment confirmation

## Best Practices

1. **Always populate user data** before emitting to get complete user information
2. **Use rooms** for efficient targeting (role-based, user-specific)
3. **Handle errors** gracefully to prevent socket disconnections
4. **Log events** for debugging and monitoring
5. **Rate limit** socket events to prevent spam
6. **Validate data** before emitting to avoid invalid payloads

Your frontend is **ready to receive** all these events! 🚀
