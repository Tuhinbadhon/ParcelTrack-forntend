"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  Users,
  TrendingUp,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { Bar, Doughnut } from "react-chartjs-2";
import { parcelApi } from "@/lib/api/parcels";
import { userApi } from "@/lib/api/users";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalParcels: 0,
    totalCustomers: 0,
    dailyBookings: 0,
    codAmount: 0,
    deliveredToday: 0,
    failedDeliveries: 0,
    pendingParcels: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState({
    labels: ["Delivered", "In Transit", "Pending", "Failed"],
    datasets: [
      {
        data: [0, 0, 0, 0],
        backgroundColor: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"],
      },
    ],
  });

  const [dailyBookingsData, setDailyBookingsData] = useState({
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Bookings",
        data: [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: "#3b82f6",
      },
    ],
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [parcels, users, statistics] = await Promise.all([
        parcelApi.getParcels(),
        userApi.getAllUsers(),
        parcelApi.getStatistics(),
      ]);

      const customers = users.filter((u) => u.role === "customer");
      const today = new Date().toDateString();

      const deliveredToday = parcels.filter(
        (p) =>
          p.status === "delivered" &&
          new Date(p.updatedAt).toDateString() === today
      ).length;

      const failedDeliveries = parcels.filter(
        (p) => p.status === "failed"
      ).length;
      const pendingParcels = parcels.filter(
        (p) => p.status === "pending" || p.status === "picked_up"
      ).length;

      setStats({
        totalParcels: statistics.total || parcels.length,
        totalCustomers: customers.length,
        dailyBookings: parcels.filter(
          (p) => new Date(p.createdAt).toDateString() === today
        ).length,
        codAmount: parcels
          .filter((p) => p.status !== "delivered")
          .reduce((sum, p) => sum + p.cost, 0),
        deliveredToday,
        failedDeliveries,
        pendingParcels,
      });

      // Compute chart data
      const deliveredCount = parcels.filter(
        (p) => p.status === "delivered"
      ).length;
      const inTransitCount = parcels.filter(
        (p) => p.status === "in_transit" || p.status === "picked_up"
      ).length;
      const pendingCount = parcels.filter((p) => p.status === "pending").length;
      const failedCount = failedDeliveries;

      setStatusData({
        labels: ["Delivered", "In Transit", "Pending", "Failed"],
        datasets: [
          {
            data: [deliveredCount, inTransitCount, pendingCount, failedCount],
            backgroundColor: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"],
          },
        ],
      });

      // Last 7 days bookings
      const last7: Date[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        last7.push(d);
      }

      const labels = last7.map((d) =>
        d.toLocaleDateString("en-US", { weekday: "short" })
      );
      const counts = last7.map(
        (d) =>
          parcels.filter(
            (p) => new Date(p.createdAt).toDateString() === d.toDateString()
          ).length
      );

      setDailyBookingsData({
        labels,
        datasets: [
          {
            label: "Bookings",
            data: counts,
            backgroundColor: "#3b82f6",
          },
        ],
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Chart data is computed from API and stored in state (statusData, dailyBookingsData)

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center min-h-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your courier management system
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Parcels
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalParcels}</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Daily Bookings
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.dailyBookings}</div>
                <p className="text-xs text-muted-foreground">
                  +8 from yesterday
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Customers
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                <p className="text-xs text-muted-foreground">+23 this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  COD Amount
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ৳{stats.codAmount.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Pending collection
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Delivered Today
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.deliveredToday}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Failed Deliveries
                </CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.failedDeliveries}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Parcels
                </CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingParcels}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Parcel Status Distribution</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center items-center min-h-75">
                <div className="w-full max-w-70 aspect-square">
                  <Doughnut
                    data={statusData}
                    options={{ maintainAspectRatio: true, responsive: true }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Bookings (This Week)</CardTitle>
              </CardHeader>
              <CardContent className="min-h-75">
                <Bar
                  data={dailyBookingsData}
                  options={{ maintainAspectRatio: true, responsive: true }}
                />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
