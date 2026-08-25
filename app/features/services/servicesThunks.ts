'use client';

import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/app/services/api';
import {
  setServices,
  addService,
  updateServiceInList,
  removeService,
  setCurrentService,
  setServicesLoading,
  setServicesError,
  Service,
  ServiceStatus,
} from './servicesSlice';
import { toastSuccess, toastError } from '@/utils/toast';

export interface ServiceFilters {
  category?: string | string[];
  minPrice?: number;
  maxPrice?: number;
  maxDeliveryDays?: number;
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'top-rated';
  search?: string;
  artistId?: string;
}

export interface ServiceFormData {
  title: string;
  description: string;
  category: string;
  features: string[];
  price: number;
  deliveryDays: number;
  revisions: number;
  status: ServiceStatus;
}

// Fetch marketplace services with filters
export const fetchServices = createAsyncThunk(
  'services/fetchServices',
  async (filters: ServiceFilters = {}, { dispatch }) => {
    try {
      dispatch(setServicesLoading(true));
      const params = new URLSearchParams();
      if (filters.category) {
        const categories = Array.isArray(filters.category) ? filters.category : [filters.category];
        const validCategories = categories.filter((c) => c && c !== 'all');
        validCategories.forEach((c) => params.append('category', c));
      }
      if (filters.minPrice !== undefined) params.append('minPrice', String(filters.minPrice));
      if (filters.maxPrice !== undefined) params.append('maxPrice', String(filters.maxPrice));
      if (filters.maxDeliveryDays !== undefined) params.append('maxDeliveryDays', String(filters.maxDeliveryDays));
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.search) params.append('search', filters.search);
      if (filters.artistId) params.append('artistId', filters.artistId);

      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await api.get(`/services${query}`);
      dispatch(setServices(response.data));
      dispatch(setServicesError(null));
      return response.data;
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to fetch services';
      dispatch(setServicesError(message));
      throw error;
    } finally {
      dispatch(setServicesLoading(false));
    }
  }
);

// Fetch single service by ID
export const fetchServiceById = createAsyncThunk(
  'services/fetchServiceById',
  async (serviceId: string, { dispatch }) => {
    try {
      dispatch(setServicesLoading(true));
      const response = await api.get(`/services/${serviceId}`);
      dispatch(setCurrentService(response.data));
      dispatch(setServicesError(null));
      return response.data;
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to fetch service';
      dispatch(setServicesError(message));
      throw error;
    } finally {
      dispatch(setServicesLoading(false));
    }
  }
);

// Fetch current artist's services
export const fetchMyServices = createAsyncThunk(
  'services/fetchMyServices',
  async (_, { dispatch }) => {
    try {
      dispatch(setServicesLoading(true));
      const response = await api.get('/services/my');
      dispatch(setServices(response.data));
      dispatch(setServicesError(null));
      return response.data;
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to fetch your services';
      dispatch(setServicesError(message));
      throw error;
    } finally {
      dispatch(setServicesLoading(false));
    }
  }
);

// Create a new service
export const createService = createAsyncThunk(
  'services/createService',
  async (data: ServiceFormData, { dispatch }) => {
    try {
      dispatch(setServicesLoading(true));
      const response = await api.post('/services', data);
      dispatch(addService(response.data));
      dispatch(setServicesError(null));
      toastSuccess(data.status === 'draft' ? 'Service saved as draft!' : 'Service published successfully!');
      return response.data;
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to create service';
      dispatch(setServicesError(message));
      toastError(message);
      throw error;
    } finally {
      dispatch(setServicesLoading(false));
    }
  }
);

// Update an existing service
export const updateService = createAsyncThunk(
  'services/updateService',
  async ({ id, data }: { id: string; data: Partial<ServiceFormData> }, { dispatch }) => {
    try {
      dispatch(setServicesLoading(true));
      const response = await api.patch(`/services/${id}`, data);
      dispatch(updateServiceInList(response.data));
      dispatch(setCurrentService(response.data));
      dispatch(setServicesError(null));
      toastSuccess('Service updated successfully!');
      return response.data;
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to update service';
      dispatch(setServicesError(message));
      toastError(message);
      throw error;
    } finally {
      dispatch(setServicesLoading(false));
    }
  }
);

// Delete a service
export const deleteService = createAsyncThunk(
  'services/deleteService',
  async (serviceId: string, { dispatch }) => {
    try {
      dispatch(setServicesLoading(true));
      await api.delete(`/services/${serviceId}`);
      dispatch(removeService(serviceId));
      dispatch(setServicesError(null));
      toastSuccess('Service deleted successfully!');
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to delete service';
      dispatch(setServicesError(message));
      toastError(message);
      throw error;
    } finally {
      dispatch(setServicesLoading(false));
    }
  }
);

// Toggle service active/inactive status
export const toggleServiceStatus = createAsyncThunk(
  'services/toggleServiceStatus',
  async ({ id, currentStatus }: { id: string; currentStatus: ServiceStatus }, { dispatch }) => {
    try {
      const newStatus = currentStatus === 'published' ? 'inactive' : 'published';
      const response = await api.patch(`/services/${id}/status`, { status: newStatus });
      dispatch(updateServiceInList(response.data));
      dispatch(setCurrentService(response.data));
      toastSuccess(`Service ${newStatus === 'published' ? 'activated' : 'deactivated'}!`);
      return response.data;
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to update service status';
      dispatch(setServicesError(message));
      toastError(message);
      throw error;
    }
  }
);
