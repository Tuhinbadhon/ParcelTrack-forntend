import { apiClient } from "./client";
import { Parcel, ParcelStatus } from "../store/slices/parcelSlice";

export interface CreateParcelData {
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  pickupAddress: string;
  weight: number;
  description?: string;
  cost: number;
}

export interface UpdateParcelStatusData {
  status: ParcelStatus;
  location?: string;
  note?: string;
}

export interface AssignAgentData {
  agentId: string;
}

export interface UpdateLocationData {
  lat: number;
  lng: number;
}

export const parcelApi = {
  // Create new parcel
  createParcel: async (data: CreateParcelData): Promise<Parcel> => {
    const response = await apiClient.post("/parcels", data);
    return response.data;
  },

  // Get all parcels with optional filters
  getParcels: async (filters?: any): Promise<Parcel[]> => {
    const response = await apiClient.get("/parcels", { params: filters });
    return response.data;
  },

  // Get parcel by ID
  getParcelById: async (id: string): Promise<Parcel> => {
    const response = await apiClient.get(`/parcels/${id}`);
    return response.data;
  },

  // Track parcel by tracking number
  trackParcel: async (trackingNumber: string): Promise<Parcel> => {
    const response = await apiClient.get(`/parcels/track/${trackingNumber}`);
    return response.data;
  },

  // Get current user's parcels (customer)
  getMyParcels: async (): Promise<Parcel[]> => {
    const response = await apiClient.get("/parcels/my-parcels");
    return response.data;
  },

  // Get agent's assigned parcels
  getAssignedParcels: async (): Promise<Parcel[]> => {
    const response = await apiClient.get("/parcels/assigned");
    return response.data;
  },

  // Update parcel status
  updateParcelStatus: async (
    id: string,
    data: UpdateParcelStatusData
  ): Promise<Parcel> => {
    const response = await apiClient.patch(`/parcels/${id}/status`, data);
    return response.data;
  },

  // Assign agent to parcel
  assignAgent: async (id: string, data: AssignAgentData): Promise<Parcel> => {
    const response = await apiClient.patch(`/parcels/${id}/assign`, data);
    return response.data;
  },

  // Update parcel location
  updateLocation: async (
    id: string,
    data: UpdateLocationData
  ): Promise<Parcel> => {
    const response = await apiClient.patch(`/parcels/${id}/location`, data);
    return response.data;
  },

  // Delete parcel
  deleteParcel: async (id: string): Promise<Parcel> => {
    const response = await apiClient.delete(`/parcels/${id}`);
    return response.data;
  },

  // Get statistics
  getStatistics: async (): Promise<{
    total: number;
    pending: number;
    inTransit: number;
    delivered: number;
  }> => {
    const response = await apiClient.get("/parcels/statistics");
    return response.data;
  },
};
