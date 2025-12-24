# Real-Time Notification System

## Overview

This document describes the implementation of the real-time notification system for ParcelTrack, including Socket.IO integration, email/SMS notifications, and the notification UI.

## Features Implemented

### 1. Real-Time Socket.IO Updates

#### Socket Service (`/lib/socket/socket.ts`)

- Manages WebSocket connections to the backend
- Connects with JWT authentication
- Provides methods to emit and listen to events
- Handles automatic reconnection

#### Socket Hook (`/lib/hooks/useSocket.ts`)

Enhanced with the following event listeners:

- `parcel:status-updated` - Parcel status changes
- `parcel:assigned` - Agent assignments
- `parcel:delivered` - Delivery confirmations
- `parcel:location-updated` - Real-time location tracking
- `parcel:new-booking` - New parcel bookings (admin)
- `parcel:failed` - Failed deliveries (admin)
- `notification:sent` - Confirmation of email/SMS sent
- `agent:online-status` - Agent availability tracking

### 2. Email & SMS Notification API

#### Notification API (`/lib/api/notifications.ts`)

```typescript
// Send email notification
notificationApi.sendEmail({
  to: "customer@example.com",
  subject: "Parcel Update",
  message: "Your parcel has been delivered",
  parcelId: "123",
});

// Send SMS notification
notificationApi.sendSMS({
  to: "+1234567890",
  message: "Your parcel TRK001 is out for delivery",
  parcelId: "123",
});

// Send both email and SMS
notificationApi.sendBoth({
  type: "both",
  recipient: "customer@example.com",
  subject: "Parcel Delivered",
  message: "Your parcel has been delivered successfully",
});
```

#### Notification Preferences

- Users can enable/disable email, SMS, and push notifications
- Preferences stored per user
- API endpoints:
  - `GET /notifications/preferences` - Get user preferences
  - `PUT /notifications/preferences` - Update preferences

### 3. UI Components

#### NotificationBell (`/components/shared/NotificationBell.tsx`)

- Dropdown menu showing recent notifications
- Real-time unread count badge
- Mark as read / mark all as read functionality
- Clear all notifications
- Auto-displays toast notifications for new alerts
- Color-coded by notification type (success, error, warning, info)

**Features:**

- Shows notification count badge
- Displays up to 50 recent notifications
- Timestamp for each notification
- Visual indicator for unread notifications

#### Integration in Navbar

```tsx
import NotificationBell from "./NotificationBell";

// In navbar
<NotificationBell />;
```

### 4. Customer Notification Settings

#### Page: `/customer/notifications`

Allows customers to manage notification preferences:

- ✉️ Email notifications
- 📱 SMS notifications
- 🔔 Push notifications

**Events that trigger notifications:**

- Parcel picked up
- Parcel in transit
- Parcel delivered
- Delivery delays or issues
- Account updates

### 5. Admin Notification Center

#### Page: `/admin/notifications`

Admin dashboard for managing notifications:

- Send custom notifications to users
- View notification statistics
- Monitor sent emails and SMS
- See system-wide notification history

**Features:**

- Send to specific users by email or phone
- Choose notification type (email/SMS/both)
- Custom subject and message
- Real-time delivery status
- Notification history with timestamps

### 6. Real-Time Dashboard Updates

#### Admin Dashboard (`/app/admin/dashboard/page.tsx`)

- Auto-refreshes every 30 seconds
- Shows live parcel statistics
- Displays active alerts
- Updates charts in real-time

#### Customer Dashboard (`/app/customer/dashboard/page.tsx`)

- Auto-refreshes every 15 seconds
- Shows personal parcel statistics
- Recent parcel updates
- Real-time status changes

#### Customer Tracking Page (`/app/customer/track/page.tsx`)

- Auto-refreshes tracking data every 10 seconds
- Live status updates
- Real-time location tracking
- Instant delivery confirmations

## Socket Events

### Client → Server

```typescript
// Update parcel status
socket.emit("parcel:update-status", {
  parcelId: "123",
  status: "delivered",
});

// Update location
socket.emit("parcel:update-location", {
  parcelId: "123",
  location: { lat: 23.8103, lng: 90.4125 },
});
```

### Server → Client

```typescript
// Status updated
socket.on("parcel:status-updated", (data) => {
  // data: { parcel: Parcel }
});

// New booking (admin only)
socket.on("parcel:new-booking", (data) => {
  // data: { parcel: Parcel }
});

// Delivery notification (customer only)
socket.on("parcel:delivered", (data) => {
  // data: { parcel: Parcel }
});

// Assignment notification (agent only)
socket.on("parcel:assigned", (data) => {
  // data: { parcel: Parcel }
});

// Failed delivery (admin only)
socket.on("parcel:failed", (data) => {
  // data: { parcel: Parcel, reason?: string }
});

// Notification sent confirmation
socket.on("notification:sent", (data) => {
  // data: { type: string, recipient: string, message: string }
});
```

## Backend Requirements

### Socket.IO Server Setup

```typescript
// Required on backend
io.on("connection", (socket) => {
  const user = socket.user; // From JWT auth

  // Join user-specific room
  socket.join(`user:${user._id}`);

  // Join role-specific rooms
  socket.join(`role:${user.role}`);

  // Listen for status updates
  socket.on("parcel:update-status", async (data) => {
    const parcel = await updateParcelStatus(data);

    // Emit to all relevant users
    io.to(`user:${parcel.sender}`).emit("parcel:status-updated", { parcel });
    if (parcel.agent) {
      io.to(`user:${parcel.agent}`).emit("parcel:status-updated", { parcel });
    }
    io.to(`role:admin`).emit("parcel:status-updated", { parcel });

    // Trigger email/SMS notifications
    await sendNotifications(parcel);
  });
});
```

### Email/SMS Integration

Backend should integrate with:

- **Email**: SendGrid, AWS SES, Nodemailer, etc.
- **SMS**: Twilio, AWS SNS, Vonage, etc.

```typescript
// Example notification trigger
async function sendNotifications(parcel) {
  const user = await User.findById(parcel.sender);
  const preferences = user.notificationPreferences;

  if (preferences.email) {
    await sendEmail({
      to: user.email,
      subject: `Parcel ${parcel.trackingNumber} Update`,
      message: `Your parcel is now ${parcel.status}`,
    });
  }

  if (preferences.sms) {
    await sendSMS({
      to: user.phone,
      message: `ParcelTrack: Your parcel ${parcel.trackingNumber} is ${parcel.status}`,
    });
  }

  // Emit confirmation
  io.to(`user:${user._id}`).emit("notification:sent", {
    type:
      preferences.email && preferences.sms
        ? "both"
        : preferences.email
        ? "email"
        : "sms",
    recipient: user.email || user.phone,
    message: "Notification sent successfully",
  });
}
```

## Environment Variables

```env
# Socket.IO
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

# Email (Backend)
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your_api_key
EMAIL_FROM=noreply@parceltrack.com

# SMS (Backend)
SMS_SERVICE=twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

## Usage Examples

### Sending Notifications from Backend

```typescript
// When parcel status changes
await Parcel.findByIdAndUpdate(parcelId, { status: "delivered" });

// Trigger notifications
io.to(`user:${parcel.sender}`).emit("parcel:delivered", { parcel });

// Send email/SMS based on user preferences
await notificationService.sendParcelUpdate(parcel);
```

### Listening to Notifications in Frontend

```typescript
// Already set up in useSocket hook
// Notifications automatically appear in NotificationBell
// Toast notifications show automatically
```

### Manual Notification (Admin)

```typescript
// From admin notification center
await notificationApi.sendBoth({
  type: "both",
  recipient: "customer@example.com",
  subject: "Important Update",
  message: "Your parcel delivery is scheduled for tomorrow",
});
```

## Testing

### Test Socket Connection

```typescript
// Open browser console
const socket = io("http://localhost:5000", {
  auth: { token: "your_jwt_token" },
});

socket.on("connect", () => {
  console.log("Connected to socket server");
});

// Emit test event
socket.emit("parcel:update-status", {
  parcelId: "123",
  status: "delivered",
});
```

### Test Notifications

1. Create a parcel booking
2. Update parcel status
3. Check NotificationBell for new notification
4. Verify email/SMS received (if enabled)
5. Check admin notification center for logs

## Security Considerations

1. **Authentication**: All socket connections require valid JWT
2. **Authorization**: Users only receive notifications for their own parcels
3. **Rate Limiting**: Limit notification frequency per user
4. **Input Validation**: Sanitize all notification content
5. **Privacy**: Don't expose sensitive data in notifications

## Future Enhancements

- [ ] Push notifications (browser/mobile)
- [ ] WhatsApp integration
- [ ] Notification templates
- [ ] Scheduled notifications
- [ ] Notification analytics
- [ ] Multi-language support
- [ ] Rich notifications with images
- [ ] In-app notification sounds
- [ ] Notification grouping
- [ ] Read receipts

## Troubleshooting

### Socket not connecting

- Check `NEXT_PUBLIC_SOCKET_URL` environment variable
- Verify backend Socket.IO server is running
- Check JWT token is valid
- Check browser console for errors

### Notifications not appearing

- Verify SocketProvider is in app layout
- Check notification preferences are enabled
- Verify backend is emitting events
- Check Redux store has notifications

### Email/SMS not sending

- Verify API keys are configured
- Check user has email/phone number
- Verify notification preferences are enabled
- Check backend email/SMS service is working

## Support

For issues or questions, contact the development team or check the main README.md.
