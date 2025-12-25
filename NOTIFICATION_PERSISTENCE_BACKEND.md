# Backend Notification Persistence - Integration Guide

## Overview

The frontend is now integrated with the backend notification system. The backend provides both REST API endpoints and WebSocket events for notifications.

## Backend Endpoints (Already Implemented ✅)

### 1. GET /api/notifications

**Description**: Get notifications for the authenticated user

**Query Parameters**:

- `unreadOnly` (boolean): If true, returns only unread notifications

**Example**:

```javascript
GET /api/notifications?unreadOnly=true
```

**Response**:

```json
[
  {
    "_id": "notification_id",
    "userId": "user_id",
    "message": "Your parcel TR-12345 has been delivered",
    "type": "success",
    "timestamp": "2025-12-26T10:30:00.000Z",
    "read": false,
    "parcelId": "parcel_id"
  }
]
```

### 2. PATCH /api/notifications/:id/read

**Description**: Mark a specific notification as read

**Example**:

```javascript
PATCH / api / notifications / 67890 / read;
```

**Response**:

```json
{
  "success": true,
  "notification": { ... }
}
```

### 3. PATCH /api/notifications/mark-all-read

**Description**: Mark all user's notifications as read

**Example**:

```javascript
PATCH / api / notifications / mark - all - read;
```

## WebSocket Events (Already Implemented ✅)

### Event: `notifications:pending`

**Emitted**: When user connects to WebSocket

**Purpose**: Send all unread notifications to newly connected user

**Payload**:

```javascript
{
  count: 5,
  notifications: [
    {
      _id: "notification_id",
      message: "Your parcel has been delivered",
      type: "success",
      timestamp: "2025-12-26T10:30:00.000Z",
      read: false
    }
  ]
}
```

**Frontend Handler** (Already Implemented):

```javascript
socket.on("notifications:pending", (data) => {
  console.log(`📬 Received ${data.count} pending notifications`);
  data.notifications.forEach((notif) => {
    dispatch(
      addNotification({
        _id: notif._id,
        message: notif.message,
        type: notif.type,
      })
    );
  });
});
```

## Frontend Integration (Completed ✅)

### 1. **On User Login**:

```javascript
// Step 1: Fetch notification history via REST API
const notifications = await fetch("/api/notifications");

// Step 2: Connect WebSocket
socket.connect(token);

// Step 3: Receive pending notifications via WebSocket
socket.on("notifications:pending", handlePendingNotifications);
```

### 2. **Mark as Read** (Optimistic Update):

```javascript
// Update UI immediately
dispatch(markAsRead(notificationId));

// Sync with backend
await fetch(`/api/notifications/${backendId}/read`, {
  method: "PATCH",
});
```

### 3. **Real-time Notifications**:

```javascript
// Backend emits
socket.to(`user:${userId}`).emit("notification:new", {
  message: "Your parcel has been delivered",
  type: "success",
});

// Frontend receives
socket.on("notification:new", (data) => {
  dispatch(addNotification(data));
  showToast(data.message);
});
```

## Data Flow

### Login Flow:

```
1. User logs in with credentials
2. Frontend receives JWT token
3. Frontend calls GET /api/notifications
4. Frontend loads notifications into Redux
5. Frontend connects WebSocket with token
6. Backend authenticates socket connection
7. Backend emits 'notifications:pending' with unread notifications
8. Frontend merges/deduplicates notifications
9. User sees all notifications (historical + pending)
```

### New Notification Flow:

```
1. Backend event occurs (e.g., parcel delivered)
2. Backend saves notification to database
3. Backend emits via WebSocket to user
4. If user online: Receives real-time notification
5. If user offline: Will receive via 'notifications:pending' on next login
```

### Mark as Read Flow:

```
1. User clicks notification
2. Frontend updates Redux (optimistic)
3. Frontend calls PATCH /api/notifications/:id/read
4. Backend updates database
5. UI reflects read status immediately
```

## Benefits

✅ **Persistent Storage**: Notifications survive logout/reload
✅ **Offline Support**: Missed notifications delivered on reconnect
✅ **Real-time Updates**: Instant notifications when online
✅ **Optimistic UI**: Instant feedback on user actions
✅ **Deduplication**: Prevents showing same notification twice
✅ **Backend Sync**: Read status persists across devices

## Testing

### 1. Test Notification History:

```bash
# Login as user
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Get notifications
curl http://localhost:5000/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Test Mark as Read:

```bash
curl -X PATCH http://localhost:5000/api/notifications/NOTIFICATION_ID/read \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Test WebSocket:

Open browser console and check for:

```
📬 Received X pending notifications
✅ Loaded Y notifications from history
```

## Frontend Files Updated

1. ✅ `lib/api/notifications.ts` - API client methods
2. ✅ `lib/store/slices/notificationSlice.ts` - Redux state management
3. ✅ `lib/hooks/useSocket.ts` - Socket connection & listeners
4. ✅ `components/shared/NotificationList.tsx` - UI component with backend sync

All integration is complete and ready to use!

## Database Schema Needed

### Notification Model

```typescript
interface Notification {
  _id: string;
  userId: string; // Reference to User
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: Date;
  read: boolean;
  parcelId?: string; // Optional reference to related parcel
  metadata?: any; // Optional additional data
}
```

## Backend Endpoint Required

### GET /notifications/my-notifications

**Description**: Get all notifications for the currently authenticated user

**Auth**: Required (JWT)

**Response**:

```json
[
  {
    "_id": "notification_id",
    "userId": "user_id",
    "message": "Your parcel TR-12345 has been delivered",
    "type": "success",
    "timestamp": "2025-12-26T10:30:00.000Z",
    "read": false,
    "parcelId": "parcel_id"
  }
]
```

## Implementation Example (NestJS)

### 1. Create Notification Schema

```typescript
// src/notifications/schemas/notification.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  message: string;

  @Prop({ enum: ["info", "success", "warning", "error"], default: "info" })
  type: string;

  @Prop({ default: false })
  read: boolean;

  @Prop({ type: Types.ObjectId, ref: "Parcel" })
  parcelId?: Types.ObjectId;

  @Prop({ type: Object })
  metadata?: any;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
```

### 2. Update NotificationsController

```typescript
// src/notifications/notifications.controller.ts
@Get('my-notifications')
@UseGuards(JwtAuthGuard)
async getMyNotifications(@Request() req) {
  return this.notificationsService.getMyNotifications(req.user.sub);
}

@Patch('mark-read/:id')
@UseGuards(JwtAuthGuard)
async markAsRead(@Param('id') id: string, @Request() req) {
  return this.notificationsService.markAsRead(id, req.user.sub);
}
```

### 3. Update NotificationsService

```typescript
// src/notifications/notifications.service.ts
async getMyNotifications(userId: string) {
  return this.notificationModel
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(100)  // Last 100 notifications
    .lean()
    .exec();
}

async markAsRead(notificationId: string, userId: string) {
  return this.notificationModel.findOneAndUpdate(
    { _id: notificationId, userId },
    { read: true },
    { new: true }
  );
}

async createNotification(data: {
  userId: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  parcelId?: string;
  metadata?: any;
}) {
  const notification = await this.notificationModel.create(data);

  // Also emit via WebSocket for real-time
  this.eventsGateway.emitNotification(
    data.userId,
    data.message,
    data.type
  );

  return notification;
}
```

### 4. Update EventsGateway to Save Notifications

```typescript
// src/events/events.gateway.ts
emitNotification(
  userId: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'error' = 'info',
) {
  // Save to database
  this.notificationsService.createNotification({
    userId,
    message,
    type,
  });

  // Emit real-time
  this.server.to(`user:${userId}`).emit('notification:new', {
    message,
    type,
    userId,
  });
}
```

## How It Works

1. **When notification is sent**:

   - Save to database
   - Emit via WebSocket (if user online)

2. **When user logs in**:

   - Frontend fetches `/notifications/my-notifications`
   - Loads all unread + recent notifications
   - Displays in notification bell

3. **When user marks as read**:
   - Frontend updates Redux state immediately (optimistic)
   - Optionally sync to backend to persist read status

## Benefits

- ✅ Users see missed notifications when they log back in
- ✅ Notifications persist across sessions
- ✅ Can implement "mark all as read" that syncs to backend
- ✅ Can add pagination for old notifications
- ✅ Can track notification analytics
