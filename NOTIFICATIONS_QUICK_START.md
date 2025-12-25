# Real-Time Notifications - Quick Reference

## ✅ What's Already Working

Your real-time notification system is now fully integrated using Socket.IO! Here's what's implemented:

### Frontend Components

1. **NotificationBell Component** - Visible in all user dashboards (Admin, Agent, Customer)

   - Shows unread count badge
   - Dropdown with notification list
   - Toast notifications for new events
   - Mark as read/clear functionality

2. **Socket Integration** - Automatically connects when user logs in

   - Listens to 20+ different event types
   - Role-based notifications (Admin, Agent, Customer)
   - Real-time updates without page refresh

3. **Redux Store** - Manages notification state globally
   - Persists across page navigation
   - Tracks read/unread status
   - Maintains notification history

## 📡 Notification Events

### Customer Notifications

- ✅ Parcel status updates (for their parcels)
- ✅ Parcel picked up
- ✅ Parcel delivered (with 🎉 celebration)
- ✅ Delivery failed/delayed
- ✅ Location updates during delivery

### Agent Notifications

- ✅ New parcel assignments
- ✅ Parcel status changes (for assigned parcels)
- ✅ Urgent/priority parcels
- ✅ Route updates
- ✅ COD payment collection confirmations
- ✅ Delivery failures

### Admin Notifications

- ✅ All new bookings
- ✅ All status updates
- ✅ Agent assignments
- ✅ Payment collections
- ✅ Delivery failures
- ✅ Agent online/offline status
- ✅ System alerts
- ✅ Critical updates

## 🔧 Backend Setup Required

To make notifications work, your backend needs to emit Socket.IO events. Here's a minimal example:

```javascript
// server.js or app.js
const io = require("socket.io")(server, {
  cors: { origin: process.env.FRONTEND_URL },
});

// Authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  // Verify JWT and attach user to socket
  const user = verifyToken(token);
  socket.user = user;
  next();
});

// Connection handling
io.on("connection", (socket) => {
  const user = socket.user;

  // Join role-based room
  socket.join(user.role);
  socket.join(`user:${user.id}`);

  console.log(`${user.name} (${user.role}) connected`);
});

// Emit events when activities happen
const notifyParcelUpdate = (parcel) => {
  io.emit("parcel:status-updated", { parcel });
};

const notifyNewBooking = (parcel) => {
  io.to("admin").emit("parcel:new-booking", { parcel });
};

const notifyParcelAssignment = (parcel, agentId) => {
  io.to(`user:${agentId}`).emit("parcel:assigned", { parcel, agentId });
  io.to("admin").emit("parcel:assigned", { parcel, agentId });
};
```

## 🚀 Quick Start

### 1. Test Notifications

The system is ready to receive notifications! Just ensure your backend emits events:

```javascript
// When creating a parcel
io.to("admin").emit("parcel:new-booking", {
  parcel: newParcel,
});

// When updating status
io.emit("parcel:status-updated", {
  parcel: updatedParcel,
});

// When assigning to agent
io.to(`user:${agentId}`).emit("parcel:assigned", {
  parcel: assignedParcel,
  agentId: agentId,
});
```

### 2. Environment Variables

Already configured in `.env`:

```
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

For production, update to:

```
NEXT_PUBLIC_SOCKET_URL=https://your-backend-domain.com
```

### 3. Test Events Manually

Use the browser console to test notifications:

```javascript
// Import the test utility
import("@/lib/utils/notificationTester").then((module) => {
  window.notificationTest = module.NotificationTester;
});

// Then test different notifications
notificationTest.testSuccess();
notificationTest.testParcelDelivered();
notificationTest.testNewBooking();
```

## 📋 Event Cheat Sheet

| Event                     | Emitted When              | Who Gets Notified        |
| ------------------------- | ------------------------- | ------------------------ |
| `parcel:new-booking`      | Customer books parcel     | Admin                    |
| `parcel:assigned`         | Admin assigns to agent    | Agent + Admin            |
| `parcel:picked-up`        | Agent picks up parcel     | Customer + Admin         |
| `parcel:status-updated`   | Any status change         | Customer + Agent + Admin |
| `parcel:delivered`        | Delivery completed        | Customer + Agent + Admin |
| `parcel:failed`           | Delivery failed           | Customer + Agent + Admin |
| `parcel:location-updated` | GPS location changes      | Customer                 |
| `parcel:urgent`           | Marked as urgent          | Agent + Admin            |
| `payment:received`        | COD collected             | Agent + Admin            |
| `agent:online-status`     | Agent goes online/offline | Admin                    |
| `route:updated`           | Route changed             | Agent                    |
| `system:alert`            | System message            | Admin                    |
| `notification:new`        | Generic notification      | Targeted user(s)         |

## 🎨 Notification UI

Notifications appear in 4 ways:

1. **Bell Icon Badge** - Shows unread count
2. **Toast Popup** - Temporary notification (3-5 seconds)
3. **Dropdown List** - Full notification history
4. **Badge Color** - Red badge indicates unread

### Notification Types

- 🔵 **Info** - General updates (blue)
- 🟢 **Success** - Completed actions (green)
- 🟡 **Warning** - Alerts/urgent matters (yellow)
- 🔴 **Error** - Failed operations (red)

## 🐛 Troubleshooting

### Notifications Not Appearing

1. Check browser console for "Socket connected" message
2. Verify `NEXT_PUBLIC_SOCKET_URL` in `.env`
3. Check if backend is emitting events
4. Verify user is logged in

### Duplicate Notifications

- Check if socket connection is called multiple times
- Ensure useSocket is only used in SocketProvider

### Wrong User Receiving Notifications

- Verify backend is using correct userId when targeting
- Check role-based filtering in useSocket.ts

## 📚 Documentation Files

- `REALTIME_NOTIFICATIONS.md` - Complete documentation
- `lib/utils/notificationTester.ts` - Testing utility
- `lib/hooks/useSocket.ts` - Socket event handlers
- `components/shared/NotificationBell.tsx` - UI component

## ✨ Features

- ✅ Real-time updates via Socket.IO
- ✅ Role-based notifications
- ✅ Toast popups for immediate feedback
- ✅ Persistent notification history
- ✅ Read/unread tracking
- ✅ Batch mark as read
- ✅ Clear all functionality
- ✅ Auto-scroll to latest
- ✅ Responsive design
- ✅ Dark mode support

## 🎯 Next Steps

1. **Backend Integration**: Emit Socket.IO events from your backend controllers
2. **Testing**: Use notification tester to verify frontend works
3. **Production**: Update socket URL for production environment
4. **Enhancement**: Add push notifications, email integration, SMS alerts

The frontend is **100% ready** to receive and display notifications! Just connect your backend events. 🎉
