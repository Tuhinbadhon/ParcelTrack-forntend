"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  UserCheck,
  Mail,
  Phone,
  Search,
  UserPlus,
  MoreVertical,
  Calendar,
  Package,
  TrendingUp,
} from "lucide-react";
import { userApi } from "@/lib/api/users";
import { parcelApi } from "@/lib/api/parcels";
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
import { Parcel } from "@/lib/store/slices/parcelSlice";
import AddAgentDialog from "@/components/admin/AddAgentDialog";
import ViewPerformanceDialog from "@/components/admin/ViewPerformanceDialog";
import EditAgentDialog from "@/components/admin/EditAgentDialog";
import DeleteAgentDialog from "@/components/admin/DeleteAgentDialog";

export interface Agent {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  assignedParcels?: number;
  completedParcels?: number;
  performance?: {
    totalAssigned: number;
    totalCompleted: number;
    completionRate: number;
  };
}

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalDeliveries: 0,
  });

  // Dialog states
  const [addAgentOpen, setAddAgentOpen] = useState(false);
  const [performanceOpen, setPerformanceOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [agentParcels, setAgentParcels] = useState<Parcel[]>([]);

  useEffect(() => {
    loadAgents();
  }, []);

  useEffect(() => {
    filterAgents();
  }, [searchQuery, agents]);

  // Ensure filteredAgents is populated initially
  useEffect(() => {
    setFilteredAgents(agents);
  }, [agents]);

  const loadAgents = async () => {
    try {
      const [agentsData, parcels] = await Promise.all([
        userApi.getAgents(),
        parcelApi.getParcels(),
      ]);

      const mappedAgents: Agent[] = agentsData.map((agent) => {
        const assigned = parcels.filter((p) => {
          const agentId = typeof p.agent === "object" ? p.agent?._id : p.agent;
          return agentId === agent._id;
        }).length;

        const completed = parcels.filter((p) => {
          const agentId = typeof p.agent === "object" ? p.agent?._id : p.agent;
          return (
            agentId === agent._id &&
            (p.status === "delivered" || p.status === "failed")
          );
        }).length;

        return {
          ...agent,
          isActive: (agent as any).isActive ?? true,
          assignedParcels: assigned,
          completedParcels: completed,
        } as Agent;
      });

      setAgents(mappedAgents);
      setFilteredAgents(mappedAgents);

      setStats({
        total: mappedAgents.length,
        active: mappedAgents.filter((a) => a.isActive).length,
        inactive: mappedAgents.filter((a) => !a.isActive).length,
        totalDeliveries: mappedAgents.reduce(
          (sum, a) => sum + (a.completedParcels || 0),
          0
        ),
      });
    } catch (error) {
      console.error("Failed to load agents:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAgents = () => {
    if (!searchQuery.trim()) {
      setFilteredAgents(agents);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = agents.filter(
      (agent) =>
        agent.name.toLowerCase().includes(query) ||
        agent.email.toLowerCase().includes(query) ||
        agent.phone?.toLowerCase().includes(query)
    );
    setFilteredAgents(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleViewPerformance = async (agent: Agent) => {
    setSelectedAgent(agent);
    setPerformanceOpen(true);

    try {
      const parcels = await parcelApi.getParcels();
      const agentsParcels = parcels.filter((p) => {
        const agentId = typeof p.agent === "object" ? p.agent?._id : p.agent;
        return agentId === agent._id;
      });
      setAgentParcels(agentsParcels);
    } catch (error) {
      console.error("Failed to load agent parcels:", error);
    }
  };

  const handleEdit = (agent: Agent) => {
    setSelectedAgent(agent);
    setEditOpen(true);
  };

  const handleToggleActive = async (agent: Agent) => {
    try {
      await userApi.updateUser(agent._id, {
        // @ts-ignore
        isActive: !agent.isActive,
      });
      toast.success(`Agent ${!agent.isActive ? "activated" : "deactivated"}`);
      loadAgents();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update agent");
    }
  };

  const handleDelete = (agent: Agent) => {
    setSelectedAgent(agent);
    setDeleteOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statusColor= (isActive: boolean) => {
    return isActive ? "bg-green-500" : "bg-red-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Delivery Agents</h1>
          <p className="text-muted-foreground">
            Manage delivery agents and track their performance
          </p>
        </div>
        <Button onClick={() => setAddAgentOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Agent
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.active}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <UserCheck className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.inactive}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Deliveries
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalDeliveries}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>Agent List</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAgents.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? "No agents found" : "No agents yet"}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Add your first delivery agent to get started"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAgents.map((agent) => (
                    <TableRow key={agent._id}>
                      <TableCell>
                        <div className="font-medium">{agent.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span>{agent.email}</span>
                          </div>
                          {agent.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span>{agent.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm">
                          <div className="flex items-center gap-2">
                            <Package className="h-3 w-3 text-orange-600" />
                            <span className="text-orange-600 font-medium">
                              {agent.performance?.totalAssigned || 0} assigned
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-3 w-3 text-green-600" />
                            <span className="text-green-600 font-medium">
                              {agent.performance?.totalCompleted || 0} completed
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {formatDate(agent.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColor(agent.isActive)}>
                          {agent.isActive ? "Active" : "Inactive"}
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
                              onClick={() => handleViewPerformance(agent)}
                            >
                              View Performance
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(agent)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleActive(agent)}
                            >
                              {agent.isActive ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDelete(agent)}
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
      <AddAgentDialog
        open={addAgentOpen}
        onOpenChange={setAddAgentOpen}
        onSuccess={loadAgents}
      />

      <ViewPerformanceDialog
        open={performanceOpen}
        onOpenChange={setPerformanceOpen}
        agent={selectedAgent}
        parcels={agentParcels}
      />

      <EditAgentDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        agent={selectedAgent}
        onSuccess={loadAgents}
      />

      <DeleteAgentDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        agent={selectedAgent}
        onSuccess={loadAgents}
      />
    </div>
  );
}
