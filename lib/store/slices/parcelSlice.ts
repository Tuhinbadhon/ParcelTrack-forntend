import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ParcelStatus =
  | "pending"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "failed";
export type PaymentType = "cod" | "prepaid";

export interface Parcel {
  _id: string;
  trackingNumber: string;
  sender: string | { _id: string; name: string; email: string };
  agent?: string | { _id: string; name: string; email: string };
  pickupAddress: string;
  recipientAddress: string;
  recipientName: string;
  recipientPhone: string;
  weight: number;
  cost: number;
  description?: string;
  status: ParcelStatus;
  currentLocation?: {
    coordinates: [number, number];
    type: string;
  };
  senderId: string | { _id: string; name: string; email: string };
  paymentType: PaymentType;
  paymentStatus: "paid" | "unpaid";
  agentId?: string | { _id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

interface ParcelState {
  parcels: Parcel[];
  selectedParcel: Parcel | null;
  isLoading: boolean;
}

const initialState: ParcelState = {
  parcels: [],
  selectedParcel: null,
  isLoading: false,
};

const parcelSlice = createSlice({
  name: "parcel",
  initialState,
  reducers: {
    setParcels: (state, action: PayloadAction<Parcel[]>) => {
      state.parcels = action.payload;
    },
    addParcel: (state, action: PayloadAction<Parcel>) => {
      state.parcels.unshift(action.payload);
    },
    updateParcel: (state, action: PayloadAction<Parcel>) => {
      const index = state.parcels.findIndex(
        (p) => p._id === action.payload._id
      );
      if (index !== -1) {
        state.parcels[index] = action.payload;
      }
      if (state.selectedParcel?._id === action.payload._id) {
        state.selectedParcel = action.payload;
      }
    },
    setSelectedParcel: (state, action: PayloadAction<Parcel | null>) => {
      state.selectedParcel = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setParcels,
  addParcel,
  updateParcel,
  setSelectedParcel,
  setLoading,
} = parcelSlice.actions;
export default parcelSlice.reducer;
