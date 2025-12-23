"use client";

import { useState } from "react";
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
import { FileDown, FileText, Table as TableIcon } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState("all-parcels");
  const [dateRange, setDateRange] = useState("last-30-days");
  const [loading, setLoading] = useState(false);

  const handleExportCSV = () => {
    setLoading(true);
    try {
      // Simulate export
      const csvData = [
        ["Tracking Number", "Customer", "Status", "Amount", "Date"],
        ["TRK001", "John Doe", "delivered", "1500", format(new Date(), "PP")],
        [
          "TRK002",
          "Jane Smith",
          "in_transit",
          "2500",
          format(new Date(), "PP"),
        ],
      ];

      const csvContent = csvData.map((row) => row.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `parcel-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
      a.click();

      toast.success("CSV exported successfully");
    } catch (error) {
      toast.error("Failed to export CSV");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    setLoading(true);
    try {
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text("Parcel Report", 14, 22);
      doc.setFontSize(11);
      doc.text(`Generated on: ${format(new Date(), "PPP")}`, 14, 30);

      autoTable(doc, {
        startY: 35,
        head: [
          ["Tracking Number", "Customer", "Status", "Amount (BDT)", "Date"],
        ],
        body: [
          ["TRK001", "John Doe", "delivered", "1500", format(new Date(), "PP")],
          [
            "TRK002",
            "Jane Smith",
            "in_transit",
            "2500",
            format(new Date(), "PP"),
          ],
        ],
      });

      doc.save(`parcel-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
      toast.success("PDF exported successfully");
    } catch (error) {
      toast.error("Failed to export PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">Generate and export reports</p>
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
            <Button variant="outline" size="sm" className="w-full">
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
            <Button variant="outline" size="sm" className="w-full">
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
            <Button variant="outline" size="sm" className="w-full">
              <FileDown className="h-4 w-4 mr-2" />
              Download
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: "All Parcels Report", date: new Date(), format: "PDF" },
              { name: "COD Collections", date: new Date(), format: "CSV" },
              { name: "Failed Deliveries", date: new Date(), format: "PDF" },
            ].map((report, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium">{report.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(report.date, "PPP")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded">
                    {report.format}
                  </span>
                  <Button variant="outline" size="sm">
                    <FileDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
