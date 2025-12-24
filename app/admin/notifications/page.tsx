/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, MessageSquare, Send, Bell } from "lucide-react";
import { notificationApi } from "@/lib/api/notifications";
import { useAppSelector } from "@/lib/store/hooks";
import toast from "react-hot-toast";
import { format } from "date-fns";

export default function AdminNotificationsPage() {
  const [loading, setLoading] = useState(false);
  const [notificationType, setNotificationType] = useState<
    "email" | "sms" | "both"
  >("both");
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const { notifications } = useAppSelector((state) => state.notification);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await notificationApi.getHistory();
      setHistory(data);
    } catch (error) {
      console.error("Failed to load history:", error);
    }
  };

  const handleSend = async () => {
    if (!recipient || !message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await notificationApi.sendBoth({
        type: notificationType,
        recipient,
        subject: notificationType === "email" ? subject : undefined,
        message,
      });

      toast.success("Notification sent successfully");

      // Reset form
      setRecipient("");
      setSubject("");
      setMessage("");

      // Reload history
      loadHistory();
    } catch (error) {
      console.error("Failed to send notification:", error);
      toast.error("Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notifications Center</h1>
        <p className="text-muted-foreground">
          Send notifications and view system alerts
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bell className="h-4 w-4 text-blue-600" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notifications.filter((n) => !n.read).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Unread notifications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4 text-green-600" />
              Emails Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                history.filter((h) => h.type === "email" || h.type === "both")
                  .length
              }
            </div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-purple-600" />
              SMS Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                history.filter((h) => h.type === "sms" || h.type === "both")
                  .length
              }
            </div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Send Notification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Notification Type</Label>
              <Select
                value={notificationType}
                onValueChange={(value: any) => setNotificationType(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email Only</SelectItem>
                  <SelectItem value="sms">SMS Only</SelectItem>
                  <SelectItem value="both">Email & SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Recipient (Email or Phone)</Label>
              <Input
                placeholder="email@example.com or +1234567890"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>
          </div>

          {(notificationType === "email" || notificationType === "both") && (
            <div className="space-y-2">
              <Label>Email Subject</Label>
              <Input
                placeholder="Enter email subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea
              placeholder="Enter your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>

          <Button onClick={handleSend} disabled={loading} className="w-full">
            <Send className="h-4 w-4 mr-2" />
            {loading ? "Sending..." : "Send Notification"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent System Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 10).map((notif) => (
                <div
                  key={notif.id}
                  className="flex items-start justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(notif.timestamp), "PPp")}
                    </p>
                  </div>
                  <div
                    className={`text-xs px-2 py-1 rounded ${
                      notif.type === "success"
                        ? "bg-green-100 text-green-700"
                        : notif.type === "error"
                        ? "bg-red-100 text-red-700"
                        : notif.type === "warning"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {notif.type}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
