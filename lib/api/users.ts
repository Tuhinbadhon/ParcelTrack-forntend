import { apiClient } from "./client";

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "agent" | "customer";
  address?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  role?: string;
}

export const userApi = {
  // Get all users (admin only)
  getAllUsers: async (): Promise<User[]> => {
    const response = await apiClient.get("/users");
    return response.data;
  },

  // Get all agents (admin only)
  getAgents: async (): Promise<User[]> => {
    const response = await apiClient.get("/users/agents");
    return response.data;
  },

  // Get user by ID
  getUserById: async (id: string): Promise<User> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  // Update user
  updateUser: async (id: string, data: UpdateUserData): Promise<User> => {
    const response = await apiClient.patch(`/users/${id}`, data);
    return response.data;
  },

  // Delete user (admin only)
  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  // Add agent (admin only)
  addAgent: async (data: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    password: string;
  }): Promise<User> => {
    const response = await apiClient.post("/users/agents", data);
    return response.data;
  },

  // Add customer (admin only)
  addCustomer: async (data: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    password: string;
  }): Promise<User> => {
    const response = await apiClient.post("/users/customers", data);
    return response.data;
  },
};
