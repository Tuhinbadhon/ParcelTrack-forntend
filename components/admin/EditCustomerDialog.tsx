/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import { userApi } from "@/lib/api/users";

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
}

interface EditCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  onSuccess: () => void;
}

export default function EditCustomerDialog({
  open,
  onOpenChange,
  customer,
  onSuccess,
}: EditCustomerDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone || "",
        address: (customer as any).address || "",
      });
    }
  }, [customer]);

  const handleSubmit = async () => {
    if (!customer) return;

    setSubmitting(true);
    try {
      await userApi.updateUser(customer._id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      });
      toast.success("customer updated successfully");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update customer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit customer</DialogTitle>
          <DialogDescription>Update customer information</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              placeholder="Enter customer name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-phone">Phone</Label>
            <Input
              id="edit-phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-address">Address</Label>
            <Textarea
              id="edit-address"
              placeholder="Enter address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Updating..." : "Update customer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
