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
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfDay,
  endOfDay,
} from "date-fns";
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
    prepaidRevenue: 0,
    codRevenue: 0,
  });
  const [exportHistory, setExportHistory] = useState<
    Array<{
      id: string;
      timestamp: Date;
      type: string;
      format: "PDF" | "CSV";
      dateRange: string;
      recordCount: number;
    }>
  >([]);

  const metricCards = [
    {
      id: "total",
      title: "Total Parcels",
      value: stats.total,
      icon: Package,
      iconClass: "text-blue-600",
      meta: "In selected period",
    },
    {
      id: "delivered",
      title: "Delivered",
      value: stats.delivered,
      icon: TrendingUp,
      iconClass: "text-green-600",
      meta:
        stats.total > 0
          ? `${((stats.delivered / stats.total) * 100).toFixed(
              1
            )}% success rate`
          : "0% success rate",
    },
    {
      id: "prepaid",
      title: "Prepaid Revenue",
      value: `${stats.prepaidRevenue} BDT`,
      icon: DollarSign,
      iconClass: "text-purple-600",
      meta: "Online payments",
    },
    {
      id: "cod",
      title: "COD Revenue",
      value: `${stats.codRevenue} BDT`,
      icon: DollarSign,
      iconClass: "text-orange-600",
      meta: "Cash on delivery",
    },
  ];

  const getDateRangeFilter = useCallback(
    (range?: string) => {
      const now = new Date();
      const dr = range ?? dateRange;
      switch (dr) {
        case "today":
          return { start: startOfDay(now), end: endOfDay(now) };
        case "last-7-days":
          return { start: startOfDay(subDays(now, 7)), end: endOfDay(now) };
        case "last-30-days":
          return { start: startOfDay(subDays(now, 30)), end: endOfDay(now) };
        case "this-month":
          return {
            start: startOfDay(startOfMonth(now)),
            end: endOfDay(endOfMonth(now)),
          };
        case "last-month": {
          const lastMonth = subMonths(now, 1);
          return {
            start: startOfDay(startOfMonth(lastMonth)),
            end: endOfDay(endOfMonth(lastMonth)),
          };
        }
        case "all-time":
          return null;
        default:
          return { start: startOfDay(subDays(now, 30)), end: endOfDay(now) };
      }
    },
    [dateRange]
  );

  const formatDateRangeLabel = (range?: string) => {
    const dr = range ?? dateRange;
    if (dr === "all-time") return "All Time";
    const filter = getDateRangeFilter(range);
    if (!filter) return "All Time";
    return `${format(filter.start, "PPP")} - ${format(filter.end, "PPP")}`;
  };

  const fetchParcels = useCallback(
    async (overrideRange?: string) => {
      try {
        setLoading(true);
        const data = await parcelApi.getParcels();

        // Filter by date range using Date comparison
        const dateFilter = getDateRangeFilter(overrideRange);
        let filtered = data;
        if (dateFilter) {
          const { start, end } = dateFilter;
          filtered = data.filter((parcel) => {
            const parcelDate = new Date(parcel.createdAt);
            return parcelDate >= start && parcelDate <= end;
          });
        }

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
          .filter((p) =>  p.paymentStatus === "paid")
          .reduce((sum, p) => sum + p.cost, 0);
        const prepaidRevenue = filtered
          .filter(
            (p) => p.paymentType === "prepaid" && p.paymentStatus === "paid"
          )
          .reduce((sum, p) => sum + p.cost, 0);
        const codRevenue = filtered
          .filter((p) => p.paymentType === "cod" && p.paymentStatus === "paid")
          .reduce((sum, p) => sum + p.cost, 0);

        setStats({
          total: filtered.length,
          delivered,
          pending,
          failed,
          revenue,
          prepaidRevenue,
          codRevenue,
        });

        return filtered;
      } catch {
        toast.error("Failed to fetch parcels");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [getDateRangeFilter]
  );
  useEffect(() => {
    fetchParcels();
  }, [fetchParcels]);

  const applyReportTypeFilter = (parcelsList: Parcel[]) => {
    switch (reportType) {
      case "all-parcels":
        return parcelsList;
      case "delivered":
        return parcelsList.filter((p) => p.status === "delivered");
      case "pending":
        return parcelsList.filter(
          (p) =>
            p.status === "pending" ||
            p.status === "picked_up" ||
            p.status === "in_transit"
        );
      case "failed":
        return parcelsList.filter((p) => p.status === "failed");
      case "cod":
        return parcelsList.filter((p) => p.paymentType === "cod");
      case "revenue":
        return parcelsList.filter((p) => p.paymentStatus === "paid");
      default:
        return parcelsList;
    }
  };

  const getFilteredParcels = () => applyReportTypeFilter(parcels);

  const handleExportCSV = async (overrideRange?: string) => {
    setLoading(true);
    try {
      const fetchedParcels = await fetchParcels(overrideRange);
      const filteredData = applyReportTypeFilter(fetchedParcels);
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

      const label = formatDateRangeLabel(overrideRange).replace(
        /[^a-z0-9]/gi,
        "_"
      );
      a.download = `${reportType}-report-${label}-${format(
        new Date(),
        "yyyy-MM-dd"
      )}.csv`;
      a.click();

      // Track export history
      setExportHistory((prev) =>
        [
          {
            id: Date.now().toString(),
            timestamp: new Date(),
            type: reportType.replace("-", " ").toUpperCase(),
            format: "CSV" as const,
            dateRange: formatDateRangeLabel(overrideRange),
            recordCount: filteredData.length,
          },
          ...prev,
        ].slice(0, 10)
      ); // Keep last 10

      toast.success("CSV exported successfully");
    } catch {
      toast.error("Failed to export CSV");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async (overrideRange?: string) => {
    setLoading(true);
    try {
      const fetchedParcels = await fetchParcels(overrideRange);
      const filteredData = applyReportTypeFilter(fetchedParcels);
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
      doc.text(`Date Range: ${formatDateRangeLabel(overrideRange)}`, 14, 36);
      doc.text(`Generated on: ${format(new Date(), "PPP")}`, 14, 42);

      // Summary stats
      doc.setFontSize(12);
      doc.text("Summary Statistics", 14, 52);
      doc.setFontSize(10);
      doc.text(`Total Parcels: ${stats.total}`, 14, 58);
      doc.text(`Delivered: ${stats.delivered}`, 14, 64);
      doc.text(`Pending: ${stats.pending}`, 14, 70);
      doc.text(`Failed: ${stats.failed}`, 14, 76);
      doc.text(`Total Revenue: ${stats.revenue} BDT`, 14, 82);
      doc.text(`Prepaid Revenue: ${stats.prepaidRevenue} BDT`, 14, 88);
      doc.text(`COD Revenue: ${stats.codRevenue} BDT`, 14, 94);

      // Table
      autoTable(doc, {
        startY: 101,
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
          typeof parcel.senderId === "object" ? parcel.senderId.name : "N/A",
          parcel.recipientName,
          parcel.status,
          `${parcel.cost} BDT`,
          parcel.paymentType,
          format(new Date(parcel.createdAt), "PP"),
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] },
      });

      const filenameLabel = formatDateRangeLabel(overrideRange).replace(
        /[^a-z0-9]/gi,
        "_"
      );
      doc.save(
        `${reportType}-report-${filenameLabel}-${format(
          new Date(),
          "yyyy-MM-dd"
        )}.pdf`
      );

      // Track export history
      setExportHistory((prev) =>
        [
          {
            id: Date.now().toString(),
            timestamp: new Date(),
            type: reportType.replace("-", " ").toUpperCase(),
            format: "PDF" as const,
            dateRange: formatDateRangeLabel(overrideRange),
            recordCount: filteredData.length,
          },
          ...prev,
        ].slice(0, 10)
      ); // Keep last 10

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
      await handleExportPDF(newRange);

      // Restore original range and refresh
      setDateRange(tempDateRange);
      await fetchParcels(tempDateRange);
    } catch (err) {
      console.error(err);
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
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {metricCards.map((card) => {
          const Icon = card.icon as any;
          return (
            <Card key={card.id} className="py-3 gap-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${card.iconClass}`} />
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold`}>{card.value}</div>
                <p className="text-xs text-muted-foreground">{card.meta}</p>
              </CardContent>
            </Card>
          );
        })}
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
                  <SelectItem value="all-time">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => handleExportCSV()}
              disabled={loading}
              className="flex-1"
            >
              <TableIcon className="h-4 w-4 mr-2" />
              Export as CSV
            </Button>
            <Button
              onClick={() => handleExportPDF()}
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
          <CardTitle>Export Preview</CardTitle>
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

      {exportHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Export History</CardTitle>
            <CardDescription>Recent export activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {exportHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {item.format === "PDF" ? (
                        <FileText className="h-4 w-4 text-red-500" />
                      ) : (
                        <TableIcon className="h-4 w-4 text-green-500" />
                      )}
                      <p className="font-medium text-sm">
                        {item.type} ({item.format})
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.dateRange} • {item.recordCount} records
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {format(item.timestamp, "PPp")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
