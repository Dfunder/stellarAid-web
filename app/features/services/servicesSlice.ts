'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ServiceArtist {
  id: string;
  name: string;
  avatar?: string;
  rating?: number;
  reviewCount?: number;
}

export interface ServiceReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export type ServiceStatus = 'draft' | 'published' | 'inactive';

export interface Service {
  id: string;
  artistId: string;
  artist?: ServiceArtist;
  title: string;
  description: string;
  category: string;
  features: string[];
  price: number;
  deliveryDays: number;
  revisions: number;
  status: ServiceStatus;
  rating?: number;
  reviewCount?: number;
  reviews?: ServiceReview[];
  createdAt: string;
  updatedAt: string;
}

interface ServicesState {
  services: Service[];
  currentService: Service | null;
  loading: boolean;
  error: string | null;
}

const initialState: ServicesState = {
  services: [],
  currentService: null,
  loading: false,
  error: null,
};

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    setServices: (state, action: PayloadAction<Service[]>) => {
      state.services = action.payload;
      state.error = null;
    },
    addService: (state, action: PayloadAction<Service>) => {
      state.services.unshift(action.payload);
    },
    updateServiceInList: (state, action: PayloadAction<Service>) => {
      const index = state.services.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) {
        state.services[index] = action.payload;
      }
    },
    removeService: (state, action: PayloadAction<string>) => {
      state.services = state.services.filter((s) => s.id !== action.payload);
    },
    setCurrentService: (state, action: PayloadAction<Service | null>) => {
      state.currentService = action.payload;
    },
    clearServices: (state) => {
      state.services = [];
      state.currentService = null;
    },
    setServicesLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setServicesError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setServices,
  addService,
  updateServiceInList,
  removeService,
  setCurrentService,
  clearServices,
  setServicesLoading,
  setServicesError,
} = servicesSlice.actions;

export default servicesSlice.reducer;
