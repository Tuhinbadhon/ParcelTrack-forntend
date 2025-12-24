"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  FileDown,
  FileText,
  Table as TableIcon,
  TrendingUp,
  Package,
  DollarSign,
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { parcelApi } from "@/lib/api/parcels";
import { Parcel } from "@/lib/store/slices/parcelSlice";

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState("all-parcels");
  const [dateRange, setDateRange] = useState("last-30-days");
  const [loading, setLoading] = useState(false);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    delivered: 0,
    pending: 0,
    failed: 0,
    revenue: 0,
    cod: 0,
  });

  const getDateRangeFilter = useCallback(
    (range?: string) => {
      const now = new Date();
      const dr = range ?? dateRange;
      switch (dr) {
        case "today":
          return {
            start: format(now, "yyyy-MM-dd"),
            end: format(now, "yyyy-MM-dd"),
          };
        case "last-7-days":
          return {
            start: format(subDays(now, 7), "yyyy-MM-dd"),
            end: format(now, "yyyy-MM-dd"),
          };
        case "last-30-days":
          return {
            start: format(subDays(now, 30), "yyyy-MM-dd"),
            end: format(now, "yyyy-MM-dd"),
          };
        case "this-month":
          return {
            start: format(startOfMonth(now), "yyyy-MM-dd"),
            end: format(endOfMonth(now), "yyyy-MM-dd"),
          };
        case "last-month":
          const lastMonth = subMonths(now, 1);
          return {
            start: format(startOfMonth(lastMonth), "yyyy-MM-dd"),
            end: format(endOfMonth(lastMonth), "yyyy-MM-dd"),
          };
        default:
          return {
            start: format(subDays(now, 30), "yyyy-MM-dd"),
            end: format(now, "yyyy-MM-dd"),
          };
      }
    },
    [dateRange]
  );

  const fetchParcels = useCallback(
    async (overrideRange?: string) => {
      try {
        setLoading(true);
        const data = await parcelApi.getParcels();

        // Filter by date range
        const dateFilter = getDateRangeFilter(overrideRange);
        const filtered = data.filter((parcel) => {
          const parcelDate = format(new Date(parcel.createdAt), "yyyy-MM-dd");
          return parcelDate >= dateFilter.start && parcelDate <= dateFilter.end;
        });

        setParcels(filtered);

        // Calculate stats
        const delivered = filtered.filter(
          (p) => p.status === "delivered"
        ).length;
        const pending = filtered.filter(
          (p) =>
            p.status === "pending" ||
            p.status === "picked_up" ||
            p.status === "in_transit"
        ).length;
        const failed = filtered.filter((p) => p.status === "failed").length;
        const revenue = filtered
          .filter((p) => p.paymentStatus === "paid")
          .reduce((sum, p) => sum + p.cost, 0);
        const cod = filtered
          .filter((p) => p.paymentType === "cod" && p.status === "delivered")
          .reduce((sum, p) => sum + p.cost, 0);

        setStats({
          total: filtered.length,
          delivered,
          pending,
          failed,
          revenue,
          cod,
        });
      } catch {
        toast.error("Failed to fetch parcels");
      } finally {
        setLoading(false);
      }
    },
    [getDateRangeFilter]
  );
  useEffect(() => {
    fetchParcels();
  }, [fetchParcels]);

  const getFilteredParcels = () => {
    switch (reportType) {
      case "all-parcels":
        return parcels;
      case "delivered":
        return parcels.filter((p) => p.status === "delivered");
      case "pending":
        return parcels.filter(
          (p) =>
            p.status === "pending" ||
            p.status === "picked_up" ||
            p.status === "in_transit"
        );
      case "failed":
        return parcels.filter((p) => p.status === "failed");
      case "cod":
        return parcels.filter((p) => p.paymentType === "cod");
      case "revenue":
        return parcels.filter((p) => p.paymentStatus === "paid");
      default:
        return parcels;
    }
  };

  const handleExportCSV = () => {
    setLoading(true);
    try {
      const filteredData = getFilteredParcels();
      const csvData = [
        [
          "Tracking Number",
          "Customer",
          "Recipient",
          "Phone",
          "Status",
          "Amount (BDT)",
          "Payment",
          "Date",
        ],
        ...filteredData.map((parcel) => [
          parcel.trackingNumber,
          typeof parcel.sender === "object" ? parcel.sender.name : "N/A",
          parcel.recipientName,
          parcel.recipientPhone,
          parcel.status,
          parcel.cost.toString(),
          parcel.paymentType,
          format(new Date(parcel.createdAt), "PP"),
        ]),
      ];

      const csvContent = csvData.map((row) => row.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportType}-report-${format(
        new Date(),
        "yyyy-MM-dd"
      )}.csv`;
      a.click();

      toast.success("CSV exported successfully");
    } catch {
      toast.error("Failed to export CSV");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    setLoading(true);
    try {
      const filteredData = getFilteredParcels();
      const doc = new jsPDF();

      // Header
      doc.setFontSize(20);
      doc.text("ParcelTrack Report", 14, 22);
      doc.setFontSize(11);
      doc.text(
        `Report Type: ${reportType.replace("-", " ").toUpperCase()}`,
        14,
        30
      );
      doc.text(`Date Range: ${dateRange.replace("-", " ")}`, 14, 36);
      doc.text(`Generated on: ${format(new Date(), "PPP")}`, 14, 42);

      // Summary stats
      doc.setFontSize(12);
      doc.text("Summary Statistics", 14, 52);
      doc.setFontSize(10);
      doc.text(`Total Parcels: ${stats.total}`, 14, 58);
      doc.text(`Delivered: ${stats.delivered}`, 14, 64);
      doc.text(`Pending: ${stats.pending}`, 14, 70);
      doc.text(`Failed: ${stats.failed}`, 14, 76);
      doc.text(`Revenue: ${stats.revenue} BDT`, 14, 82);
      doc.text(`COD Collections: ${stats.cod} BDT`, 14, 88);

      // Table
      autoTable(doc, {
        startY: 95,
        head: [
          [
            "Tracking",
            "Customer",
            "Recipient",
            "Status",
            "Amount",
            "Payment",
            "Date",
          ],
        ],
        body: filteredData.map((parcel) => [
          parcel.trackingNumber,
          typeof parcel.sender === "object" ? parcel.sender.name : "N/A",
          parcel.recipientName,
          parcel.status,
          `${parcel.cost} BDT`,
          parcel.paymentType,
          format(new Date(parcel.createdAt), "PP"),
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] },
      });

      doc.save(`${reportType}-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
      toast.success("PDF exported successfully");
    } catch {
      toast.error("Failed to export PDF");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickExport = async (type: "daily" | "weekly" | "monthly") => {
    try {
      setLoading(true);
      const tempDateRange = dateRange;

      const newRange =
        type === "daily"
          ? "today"
          : type === "weekly"
          ? "last-7-days"
          : "this-month";

      setDateRange(newRange);
      await fetchParcels(newRange);
      handleExportPDF();

      setDateRange(tempDateRange);
    } catch {
      toast.error("Failed to export report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground">
          Generate comprehensive reports and export data
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600" />
              Total Parcels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">In selected period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Delivered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.delivered}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0
                ? `${((stats.delivered / stats.total) * 100).toFixed(1)}%`
                : "0%"}{" "}
              success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-purple-600" />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.revenue} BDT</div>
            <p className="text-xs text-muted-foreground">Total paid</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-orange-600" />
              COD Collections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cod} BDT</div>
            <p className="text-xs text-muted-foreground">Cash on delivery</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
          <CardDescription>Select report type and date range</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-parcels">All Parcels</SelectItem>
                  <SelectItem value="delivered">Delivered Parcels</SelectItem>
                  <SelectItem value="pending">Pending Parcels</SelectItem>
                  <SelectItem value="failed">Failed Deliveries</SelectItem>
                  <SelectItem value="cod">COD Collections</SelectItem>
                  <SelectItem value="revenue">Revenue Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                  <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleExportCSV}
              disabled={loading}
              className="flex-1"
            >
              <TableIcon className="h-4 w-4 mr-2" />
              Export as CSV
            </Button>
            <Button
              onClick={handleExportPDF}
              disabled={loading}
              className="flex-1"
            >
              <FileText className="h-4 w-4 mr-2" />
              Export as PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Quick Export</CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-lg font-semibold mb-1">Daily Report</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Today&apos;s bookings and deliveries
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => handleQuickExport("daily")}
              disabled={loading}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Download
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Quick Export</CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-lg font-semibold mb-1">Weekly Summary</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Last 7 days performance
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => handleQuickExport("weekly")}
              disabled={loading}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Download
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Quick Export</CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-lg font-semibold mb-1">Monthly Report</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Complete monthly analytics
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => handleQuickExport("monthly")}
              disabled={loading}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Download
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Exports</CardTitle>
          <CardDescription>
            {getFilteredParcels().length} parcels in current filter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading data...
              </div>
            ) : getFilteredParcels().length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No parcels found for selected filters
              </div>
            ) : (
              <>
                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">Export Options</p>
                    <span className="text-sm text-muted-foreground">
                      {getFilteredParcels().length} records ready
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Format:</span>
                      <span className="ml-2 font-medium">CSV / PDF</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Size:</span>
                      <span className="ml-2 font-medium">
                        ~{Math.ceil(getFilteredParcels().length / 10)}KB
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Sample Data Preview</h4>
                  <div className="space-y-2">
                    {getFilteredParcels()
                      .slice(0, 3)
                      .map((parcel) => (
                        <div
                          key={parcel._id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {parcel.trackingNumber}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {parcel.recipientName} • {parcel.status}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-sm">
                              {parcel.cost} BDT
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(parcel.createdAt), "MMM dd")}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                  {getFilteredParcels().length > 3 && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      +{getFilteredParcels().length - 3} more records
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
