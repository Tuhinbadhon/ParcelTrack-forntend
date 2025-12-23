# ParcelTrack - Courier and Parcel Management System (Frontend)

A comprehensive courier tracking and parcel management system built with Next.js 16, TypeScript, Redux Toolkit, and Tailwind CSS.

## 🚀 Features

### Customer Features

- ✅ User registration and login
- ✅ Book parcel pickup with complete details
- ✅ Real-time parcel tracking with QR codes
- ✅ View booking history
- ✅ Receive real-time notifications

### Delivery Agent Features

- ✅ View assigned parcels
- ✅ Update parcel status (Picked Up, In Transit, Delivered, Failed)
- ✅ Route optimization view
- ✅ QR code scanning for parcel confirmation
- ✅ Real-time updates

### Admin Features

- ✅ Comprehensive dashboard with metrics
- ✅ Parcel management
- ✅ Agent assignment to parcels
- ✅ User management
- ✅ Export reports (CSV/PDF)
- ✅ Analytics and charts

### Advanced Features

- ✅ Real-time updates via Socket.IO
- ✅ QR code generation for parcels
- ✅ Role-based access control
- ✅ Responsive design
- ✅ Toast notifications
- ✅ Protected routes

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **State Management:** Redux Toolkit
- **Data Fetching:** TanStack Query (React Query)
- **Real-time:** Socket.IO Client
- **UI Components:** shadcn/ui + Radix UI
- **Styling:** Tailwind CSS
- **Charts:** Chart.js & React-Chartjs-2
- **QR Codes:** qrcode.react
- **PDF Export:** jsPDF
- **Date Handling:** date-fns
- **HTTP Client:** Axios
- **Notifications:** React Hot Toast

## 📦 Project Structure

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── customer/
│   │   ├── dashboard/
│   │   ├── book-parcel/
│   │   ├── track/
│   │   └── history/
│   ├── agent/
│   │   ├── dashboard/
│   │   ├── parcels/
│   │   └── route/
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── parcels/
│   │   ├── customers/
│   │   ├── agents/
│   │   └── reports/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── auth/            # Auth components
│   ├── shared/          # Shared components
│   └── providers/       # Context providers
├── lib/
│   ├── api/             # API client & endpoints
│   ├── store/           # Redux store & slices
│   ├── socket/          # Socket.IO configuration
│   ├── hooks/           # Custom hooks
│   └── utils.ts         # Utility functions
└── public/
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- Backend API running on port 5000

### Installation

1. **Install dependencies:**

```bash
pnpm install
```

2. **Set up environment variables:**

```bash
cp .env.local.example .env.local
```

Update `.env.local` with your configuration:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

3. **Run the development server:**

```bash
pnpm dev
```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
pnpm build
pnpm start
```

## 🎯 Key Features Implementation

### Redux Store Structure

```typescript
store/
├── authSlice      # User authentication & session
├── parcelSlice    # Parcel data & management
└── notificationSlice  # Real-time notifications
```

### API Integration

All API calls are centralized in `lib/api/`:

- `client.ts` - Axios instance with interceptors
- `auth.ts` - Authentication endpoints
- `parcels.ts` - Parcel management endpoints

### Real-time Updates

Socket.IO integration provides:

- Parcel status updates
- New assignment notifications
- Delivery confirmations
- Location tracking

### Protected Routes

Role-based access control ensures:

- Customers access only customer pages
- Agents access only agent pages
- Admins have full system access

## 🎨 UI Components

### Core Components

- Dashboard layouts with sidebar navigation
- Data tables with search and filters
- Form components with validation
- Charts for analytics
- QR code generation and display
- Modal dialogs for actions

### shadcn/ui Components Used

- Button, Card, Input, Label, Textarea
- Select, Dialog, Badge, Tabs
- Table, Avatar, Dropdown Menu
- Separator, and more

## 📱 Pages Overview

### Public Pages

- **Home** - Landing page with features
- **Login** - User authentication
- **Register** - New user registration

### Customer Pages

- **Dashboard** - Overview with stats
- **Book Parcel** - Parcel booking form
- **Track Parcel** - Real-time tracking with QR
- **History** - All bookings list

### Agent Pages

- **Dashboard** - Assignment overview
- **Assigned Parcels** - Parcel management
- **Route Map** - Delivery route optimization

### Admin Pages

- **Dashboard** - System metrics & charts
- **Parcels** - All parcels management
- **Users** - Customer & agent management
- **Reports** - Export functionality

## 🔐 Authentication Flow

1. User registers/logs in
2. JWT token stored in localStorage
3. Token added to all API requests
4. Redux manages auth state
5. Protected routes check authentication
6. Automatic redirect on 401 errors

## 📊 State Management

### Redux Slices

**Auth Slice:**

- User data
- Authentication status
- Token management

**Parcel Slice:**

- Parcel list
- Selected parcel
- Loading states

**Notification Slice:**

- Notification list
- Unread count
- Mark as read functionality

## 🌐 API Endpoints Expected

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Parcels

- `GET /api/parcels` - Get all parcels
- `POST /api/parcels` - Create parcel
- `GET /api/parcels/:id` - Get parcel details
- `GET /api/parcels/track/:trackingNumber` - Track parcel
- `PATCH /api/parcels/:id/status` - Update status
- `POST /api/parcels/:id/assign` - Assign agent

## 🎯 Next Steps

### Bonus Features to Implement

1. **Google Maps Integration:**

   - Real-time location tracking
   - Route optimization
   - Geofencing

2. **Barcode Scanning:**

   - Use device camera
   - Scan to confirm delivery

3. **Email/SMS Notifications:**

   - Integration with notification services
   - Status update alerts

4. **Multi-language Support:**

   - English & Bengali
   - i18n implementation

5. **PWA Features:**
   - Offline support
   - Push notifications
   - Install prompt

## 📦 Build & Deployment

### Environment Setup

1. Development: `pnpm dev`
2. Production Build: `pnpm build`
3. Production Server: `pnpm start`

### Deployment Platforms

- **Vercel** (Recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- **Railway**
- **Docker**

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use:**

```bash
# Change port in package.json or run:
PORT=3001 pnpm dev
```

**Module Not Found:**

```bash
# Clear cache and reinstall
rm -rf node_modules .next
pnpm install
```

**Environment Variables Not Loading:**

- Ensure `.env.local` exists
- Restart dev server after changes
- Check variable names start with `NEXT_PUBLIC_`

## 📝 License

This project is part of a MERN Stack assignment.

## 👥 Contributing

This is an assignment project. For production use, consider:

- Adding comprehensive tests
- Implementing error boundaries
- Adding analytics
- Improving accessibility
- Performance optimization

## 📞 Support

For backend API integration, ensure:

- CORS is properly configured
- JWT authentication matches
- Socket.IO connection established
- API endpoints return expected data structures

---

**Built with ❤️ using Next.js and TypeScript**
# ParcelTrack-forntend
