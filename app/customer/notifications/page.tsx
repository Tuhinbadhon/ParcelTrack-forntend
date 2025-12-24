/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, Bell, Save } from "lucide-react";
import { notificationApi } from "@/lib/api/notifications";
import toast from "react-hot-toast";
import { Switch } from "@/components/ui/switch";

export default function NotificationSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    email: true,
    sms: true,
    push: true,
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const data = await notificationApi.getPreferences();
      setPreferences(data);
    } catch (error) {
      console.error("Failed to load preferences:", error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await notificationApi.updatePreferences(preferences);
      toast.success("Notification preferences updated successfully");
    } catch {
      toast.error("Failed to update preferences");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notification Settings</h1>
        <p className="text-muted-foreground">
          Manage how you receive updates about your parcels
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notification Channels</CardTitle>
          <CardDescription>
            Choose how you want to receive notifications about your parcels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <Label htmlFor="email" className="font-medium">
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates via email
                </p>
              </div>
            </div>
            <Switch
              id="email"
              checked={preferences.email}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, email: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-950 rounded-lg">
                <MessageSquare className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <Label htmlFor="sms" className="font-medium">
                  SMS Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates via text message
                </p>
              </div>
            </div>
            <Switch
              id="sms"
              checked={preferences.sms}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, sms: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-950 rounded-lg">
                <Bell className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <Label htmlFor="push" className="font-medium">
                  Push Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive real-time browser notifications
                </p>
              </div>
            </div>
            <Switch
              id="push"
              checked={preferences.push}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, push: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What You'll Receive</CardTitle>
          <CardDescription>
            Notifications are sent for the following events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
              <span className="text-sm">When your parcel is picked up</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
              <span className="text-sm">When your parcel is in transit</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-600 rounded-full"></div>
              <span className="text-sm">When your parcel is delivered</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 bg-orange-600 rounded-full"></div>
              <span className="text-sm">When there's a delay or issue</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 bg-purple-600 rounded-full"></div>
              <span className="text-sm">
                Important updates about your account
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={loadPreferences} disabled={loading}>
          Reset
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
}
