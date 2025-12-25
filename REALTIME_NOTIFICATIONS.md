# Real-Time Notifications with Socket.IO

This document explains the real-time notification system implemented using Socket.IO for the parcel delivery application.

## Overview

The notification system uses Socket.IO for real-time bi-directional communication between the backend server and frontend clients. All users (Admin, Agent, Customer) receive instant notifications based on their role and activities.

## Architecture

### Frontend Components

1. **SocketProvider** (`components/providers/SocketProvider.tsx`)

   - Wraps the application to provide socket context
   - Initializes socket connection on app load

2. **useSocket Hook** (`lib/hooks/useSocket.ts`)

   - Manages socket connection and event listeners
   - Dispatches notifications to Redux store
   - Provides methods to emit events

3. **NotificationBell** (`components/shared/NotificationBell.tsx`)

   - UI component displaying notification count
   - Shows dropdown with notification list
   - Integrates with react-hot-toast for toast notifications

4. **Redux Store** (`lib/store/slices/notificationSlice.ts`)
   - Manages notification state
   - Tracks unread count
   - Provides actions: addNotification, markAsRead, markAllAsRead, clearNotifications

## Supported Events

### Parcel Events

#### `parcel:status-updated`

**Triggered when**: Parcel status changes (pending → picked-up → in-transit → delivered)
**Notifies**:

- **Customer**: If they own the parcel
- **Agent**: If assigned to them
- **Admin**: All status updates
  **Payload**:

```typescript
{
  parcel: Parcel;
}
```

#### `parcel:new-booking`

**Triggered when**: Customer creates a new parcel booking
**Notifies**: **Admin** only
**Payload**:

```typescript
{
  parcel: Parcel;
}
```

#### `parcel:assigned`

**Triggered when**: Admin assigns parcel to an agent
**Notifies**:

- **Agent**: Who receives the assignment
- **Admin**: Confirmation of assignment
  **Payload**:

```typescript
{
  parcel: Parcel,
  agentId: string
}
```

#### `parcel:picked-up`

**Triggered when**: Agent marks parcel as picked up
**Notifies**:

- **Customer**: Their parcel is picked up
- **Admin**: Parcel pickup confirmation
  **Payload**:

```typescript
{
  parcel: Parcel;
}
```

#### `parcel:delivered`

**Triggered when**: Parcel successfully delivered
**Notifies**:

- **Customer**: Their parcel is delivered with celebration emoji 🎉
- **Agent**: Delivery confirmation
- **Admin**: Delivery record
  **Payload**:

```typescript
{
  parcel: Parcel;
}
```

#### `parcel:failed`

**Triggered when**: Delivery attempt fails
**Notifies**:

- **Customer**: Delivery failed with reason
- **Agent**: Failed delivery alert
- **Admin**: Critical alert
  **Payload**:

```typescript
{
  parcel: Parcel,
  reason?: string
}
```

#### `parcel:location-updated`

**Triggered when**: Agent updates parcel location during delivery
**Notifies**: **Customer** tracking their parcel
**Payload**:

```typescript
{
  parcel: Parcel;
}
```

#### `parcel:urgent`

**Triggered when**: Parcel marked as urgent/priority
**Notifies**:

- **Agent**: Assigned to the urgent parcel
- **Admin**: Priority delivery alert
  **Payload**:

```typescript
{
  parcel: Parcel,
  priority: string
}
```

### Payment Events

#### `payment:received`

**Triggered when**: COD payment collected by agent
**Notifies**:

- **Admin**: Payment received with amount
- **Agent**: Payment collection confirmation
  **Payload**:

```typescript
{
  parcel: Parcel,
  amount: number
}
```

### Agent Events

#### `agent:online-status`

**Triggered when**: Agent goes online or offline
**Notifies**: **Admin** only
**Payload**:

```typescript
{
  agentId: string,
  isOnline: boolean,
  agentName?: string
}
```

#### `route:updated`

**Triggered when**: Agent's delivery route is updated
**Notifies**: **Agent** whose route changed
**Payload**:

```typescript
{
  routeId: string,
  parcelsCount: number
}
```

### Communication Events

#### `customer:inquiry`

**Triggered when**: Customer sends inquiry about parcel
**Notifies**:

- **Admin**: New inquiry
- **Agent**: If assigned to parcel
  **Payload**:

```typescript
{
  customerId: string,
  parcelId: string,
  message: string
}
```

### System Events

#### `system:alert`

**Triggered when**: System-wide alert or important message
**Notifies**: **Admin** only
**Payload**:

```typescript
{
  message: string,
  level: "info" | "warning" | "error"
}
```

#### `notification:new`

**Triggered when**: Generic notification for specific user
**Notifies**: Targeted user or all if userId not specified
**Payload**:

```typescript
{
  message: string,
  type: "info" | "success" | "warning" | "error",
  userId?: string
}
```

#### `notification:sent`

**Triggered when**: Email/SMS notification successfully sent
**Notifies**: Console log only (no UI notification)
**Payload**:

```typescript
{
  type: string,
  recipient: string,
  message: string
}
```

## Emitting Events from Frontend

The `useSocket` hook provides methods to emit events:

```typescript
const {
  emitStatusUpdate,
  emitLocationUpdate,
  emitAgentStatus,
  emitCustomerInquiry,
} = useSocket();

// Update parcel status
emitStatusUpdate(parcelId, "delivered");

// Update parcel location
emitLocationUpdate(parcelId, { lat: 23.8103, lng: 90.4125 });

// Update agent online status
emitAgentStatus(true);

// Send customer inquiry
emitCustomerInquiry(parcelId, "When will my parcel arrive?");
```

## Backend Implementation Requirements

To complete the real-time notification system, your backend should:

### 1. Setup Socket.IO Server

```javascript
const io = require("socket.io")(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});

// Authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  // Verify JWT token
  // Attach user to socket
  next();
});
```

### 2. Handle Connection

```javascript
io.on("connection", (socket) => {
  const user = socket.user;

  // Join room based on user role
  socket.join(user.role);
  socket.join(`user:${user._id}`);

  console.log(`User ${user._id} (${user.role}) connected`);

  socket.on("disconnect", () => {
    console.log(`User ${user._id} disconnected`);
  });
});
```

### 3. Emit Events on Activities

```javascript
// When parcel status is updated
const updateParcelStatus = async (parcelId, status) => {
  const parcel = await Parcel.findByIdAndUpdate(
    parcelId,
    { status },
    { new: true }
  ).populate("customerId assignedAgent");

  // Emit to all relevant users
  io.emit("parcel:status-updated", { parcel });

  // Or emit to specific rooms
  io.to(`user:${parcel.customerId._id}`).emit("parcel:status-updated", {
    parcel,
  });
  io.to("admin").emit("parcel:status-updated", { parcel });

  if (parcel.assignedAgent) {
    io.to(`user:${parcel.assignedAgent._id}`).emit("parcel:status-updated", {
      parcel,
    });
  }
};

// When new parcel is booked
const createParcel = async (parcelData) => {
  const parcel = await Parcel.create(parcelData);

  // Notify admins
  io.to("admin").emit("parcel:new-booking", { parcel });
};

// When parcel is assigned to agent
const assignParcel = async (parcelId, agentId) => {
  const parcel = await Parcel.findByIdAndUpdate(
    parcelId,
    { assignedAgent: agentId },
    { new: true }
  );

  // Notify agent and admin
  io.to(`user:${agentId}`).emit("parcel:assigned", { parcel, agentId });
  io.to("admin").emit("parcel:assigned", { parcel, agentId });
};

// When COD payment is collected
const recordPayment = async (parcelId, amount) => {
  const parcel = await Parcel.findById(parcelId).populate("assignedAgent");

  // Notify admin and agent
  io.to("admin").emit("payment:received", { parcel, amount });
  io.to(`user:${parcel.assignedAgent._id}`).emit("payment:received", {
    parcel,
    amount,
  });
};
```

### 4. Listen to Client Events

```javascript
socket.on("parcel:update-status", async ({ parcelId, status }) => {
  await updateParcelStatus(parcelId, status);
});

socket.on("parcel:update-location", async ({ parcelId, location }) => {
  const parcel = await Parcel.findByIdAndUpdate(
    parcelId,
    { currentLocation: location },
    { new: true }
  );

  io.emit("parcel:location-updated", { parcel });
});

socket.on("agent:status", ({ isOnline }) => {
  const agent = socket.user;
  io.to("admin").emit("agent:online-status", {
    agentId: agent._id,
    isOnline,
    agentName: agent.name,
  });
});

socket.on("customer:inquiry", ({ parcelId, message }) => {
  io.to("admin").emit("customer:inquiry", {
    customerId: socket.user._id,
    parcelId,
    message,
  });
});
```

## Testing Real-Time Notifications

### 1. Test Connection

Open browser console and check for:

```
Socket connected
```

### 2. Test Notifications Manually

You can emit test events from browser console:

```javascript
// Get socket instance (for testing)
window.socketTest = {
  test: () => {
    fetch("http://localhost:5000/api/test/notification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "parcel:status-updated",
        data: { parcel: { trackingNumber: "TEST123", status: "delivered" } },
      }),
    });
  },
};
```

### 3. Expected Behavior

- **Customer**: Should see notifications for their parcels only
- **Agent**: Should see notifications for assigned parcels and route updates
- **Admin**: Should see all system notifications

## Notification Types

- **info** (blue): General information, status updates
- **success** (green): Successful operations (delivery, payment)
- **warning** (yellow/orange): Alerts, urgent matters
- **error** (red): Failed operations, critical issues

## UI Features

1. **Bell Icon**: Shows notification count badge
2. **Toast Notifications**: Pop-up for new notifications
3. **Dropdown List**: Full list of recent notifications
4. **Mark as Read**: Individual or bulk mark as read
5. **Clear All**: Remove all notifications
6. **Auto-scroll**: New notifications appear at top

## Best Practices

1. **Role-based Filtering**: Only send notifications relevant to user's role
2. **User-specific Events**: Use userId to target specific users
3. **Batch Updates**: For bulk operations, emit events in batches
4. **Error Handling**: Always handle socket errors gracefully
5. **Reconnection**: Socket.IO handles reconnection automatically
6. **Authentication**: Always verify token before accepting socket connections

## Troubleshooting

### Notifications not appearing

- Check socket connection in browser console
- Verify JWT token is valid
- Check if event names match between frontend and backend
- Ensure user role matches notification target

### Duplicate notifications

- Make sure socket connection is not duplicated
- Check useEffect dependencies in useSocket hook
- Verify cleanup function is properly disconnecting

### Connection issues

- Check NEXT_PUBLIC_SOCKET_URL in .env
- Verify CORS settings on backend
- Check firewall/network settings

## Environment Variables

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

For production:

```env
NEXT_PUBLIC_SOCKET_URL=https://api.yourdomain.com
```

## Future Enhancements

1. **Push Notifications**: Browser push notifications even when tab is closed
2. **Sound Alerts**: Audio notification for urgent events
3. **Desktop Notifications**: Native OS notifications
4. **Notification Preferences**: Let users customize notification types
5. **Notification History**: Persistent storage of all notifications
6. **Read Receipts**: Track when notifications are read
7. **Priority Levels**: Different urgency levels for notifications
