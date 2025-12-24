/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Mail,
  Phone,
  Search,
  UserPlus,
  MoreVertical,
  Calendar,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import toast from "react-hot-toast";
import { userApi } from "@/lib/api/users";
import Swal from "sweetalert2";
import AddCustomerDialog from "@/components/admin/AddCustomerDialog";
import EditCustomerDialog from "@/components/admin/EditCustomerDialog";

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [editOpen, setEditOpen] = useState(false);

  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const users = await userApi.getAllUsers();
      const customerUsers: Customer[] = users
        .filter((u) => u.role === "customer")
        .map((u) => ({
          _id: u._id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          role: u.role,
          isActive: u.isActive,
          createdAt: u.createdAt,
        }));

      setCustomers(customerUsers);
      setStats({
        total: customerUsers.length,
        active: customerUsers.filter((c) => c.isActive).length,
        inactive: customerUsers.filter((c) => !c.isActive).length,
      });
    } catch (error) {
      console.error("Failed to load customers:", error);
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = useCallback(() => {
    const base = showAll ? customers : customers.filter((c) => c.isActive);
    if (!searchQuery.trim()) {
      setFilteredCustomers(base);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = base.filter(
      (customer) =>
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.phone?.toLowerCase().includes(query)
    );
    setFilteredCustomers(filtered);
  }, [searchQuery, customers, showAll]);

  useEffect(() => {
    filterCustomers();
  }, [filterCustomers]);

  const handleToggleActive = async (customer: Customer) => {
    try {
      await userApi.updateUser(customer._id, {
        isActive: !customer.isActive,
      } as any);
      toast.success(
        `Customer ${!customer.isActive ? "activated" : "deactivated"}`
      );
      loadCustomers();
    } catch (error) {
      console.error("Failed to update customer:", error);
      toast.error("Failed to update customer");
    }
  };

  const handleDelete = async (customer: Customer) => {
    try {
      Swal.fire({
        title: "Delete Customer",
        text: `Are you sure you want to delete ${customer.name}? This action cannot be undone.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, delete",
        cancelButtonText: "Cancel",
        showLoaderOnConfirm: true,
        allowOutsideClick: () => !Swal.isLoading(),
        preConfirm: async () => {
          try {
            await userApi.deleteUser(customer._id);
            return true;
          } catch (error: any) {
            Swal.showValidationMessage(
              error.response?.data?.message || "Failed to delete Customer"
            );
            return false;
          }
        },
      }).then((result) => {
        if (result.isConfirmed && result.value) {
          toast.success("Customer deleted");
          loadCustomers();
        }
      });
    } catch (error) {
      console.error("Failed to delete customer:", error);
      toast.error("Failed to delete customer");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditOpen(true);
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex flex-col items-center md:items-start gap-2">
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">
            Manage customer accounts and information
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll((s) => !s)}
          >
            {showAll ? "Showing: All" : "Showing: Active"}
          </Button>
          <Button onClick={() => setAddCustomerOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
        <Card className="py-3 gap-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Customers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="py-3 gap-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.active}
            </div>
          </CardContent>
        </Card>

        <Card className="py-3 gap-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.inactive}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>Customer List</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery
                  ? "No customers found"
                  : showAll
                  ? "No customers yet"
                  : "No active customers yet"}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search query"
                  : showAll
                  ? "Add your first customer to get started"
                  : "Activate or add a customer to get started"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer._id}>
                      <TableCell>
                        <div className="font-medium">{customer.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span>{customer.email}</span>
                          </div>
                          {customer.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span>{customer.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {formatDate(customer.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className="dark:text-white"
                          variant={customer.isActive ? "active" : "inactive"}
                        >
                          {customer.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEdit(customer)}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleActive(customer)}
                            >
                              {customer.isActive ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDelete(customer)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Dialog Components */}
      <AddCustomerDialog
        open={addCustomerOpen}
        onOpenChange={setAddCustomerOpen}
        onSuccess={loadCustomers}
      />

      <EditCustomerDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        customer={selectedCustomer}
        onSuccess={loadCustomers}
      />
    </div>
  );
}
