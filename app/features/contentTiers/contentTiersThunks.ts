'use client';

import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/app/services/api';
import {
  setTiers,
  setCurrentTier,
  setArtistTiers,
  addTier,
  updateTierInList,
  removeTier,
  setSubscriptions,
  setCurrentSubscription,
  setUserSubscriptions,
  addSubscription,
  updateSubscription,
  removeSubscription,
  setGatedContent,
  setAccessibleContent,
  addGatedContent,
  updateGatedContent,
  removeGatedContent,
  setContentTiersLoading,
  setContentTiersError,
  ContentTier,
  ContentTierFormData,
  Subscription,
  GatedContent,
  GatedContentFormData,
  ContentTierFilters,
  PaginatedTierResponse,
} from './contentTiersSlice';
import { toastSuccess, toastError } from '@/utils/toast';

// ============================================================
// Tier Thunks
// ============================================================

// Fetch all tiers with filters
export const fetchTiers = createAsyncThunk(
  'contentTiers/fetchTiers',
  async (filters: ContentTierFilters = {}, { dispatch }) => {
    try {
      dispatch(setContentTiersLoading(true));
      const params = new URLSearchParams();
      if (filters.artistId) params.append('artistId', filters.artistId);
      if (filters.level) params.append('level', filters.level);
      if (filters.sort) params.append('sort', filters.sort);
      params.append('page', String(filters.page ?? 1));
      params.append('limit', String(filters.limit ?? 20));

      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await api.get(`/content-tiers${query}`);
      dispatch(setTiers(response.data.tiers || response.data));
      dispatch(setContentTiersError(null));
      return response.data as PaginatedTierResponse;
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to fetch tiers';
      dispatch(setContentTiersError(message));
      throw error;
    } finally {
      dispatch(setContentTiersLoading(false));
    }
  }
);

// Fetch tiers for a specific artist
export const fetchArtistTiers = createAsyncThunk(
  'contentTiers/fetchArtistTiers',
  async (artistId: string, { dispatch }) => {
    try {
      dispatch(setContentTiersLoading(true));
      const response = await api.get(`/content-tiers/artist/${artistId}`);
      dispatch(setArtistTiers(response.data));
      dispatch(setContentTiersError(null));
      return response.data as ContentTier[];
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to fetch artist tiers';
      dispatch(setContentTiersError(message));
      throw error;
    } finally {
      dispatch(setContentTiersLoading(false));
    }
  }
);

// Fetch single tier by ID
export const fetchTierById = createAsyncThunk(
  'contentTiers/fetchTierById',
  async (tierId: string, { dispatch }) => {
    try {
      dispatch(setContentTiersLoading(true));
      const response = await api.get(`/content-tiers/${tierId}`);
      dispatch(setCurrentTier(response.data));
      dispatch(setContentTiersError(null));
      return response.data as ContentTier;
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to fetch tier';
      dispatch(setContentTiersError(message));
      throw error;
    } finally {
      dispatch(setContentTiersLoading(false));
    }
  }
);

// Create a new tier
export const createTier = createAsyncThunk(
  'contentTiers/createTier',
  async (data: ContentTierFormData, { dispatch }) => {
    try {
      dispatch(setContentTiersLoading(true));
      const response = await api.post('/content-tiers', data);
      dispatch(addTier(response.data));
      dispatch(setContentTiersError(null));
      toastSuccess('Tier created successfully!');
      return response.data as ContentTier;
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to create tier';
      dispatch(setContentTiersError(message));
      toastError(message);
      throw error;
    } finally {
      dispatch(setContentTiersLoading(false));
    }
  }
);

// Update a tier
export const updateTier = createAsyncThunk(
  'contentTiers/updateTier',
  async ({ id, data }: { id: string; data: Partial<ContentTierFormData> }, { dispatch }) => {
    try {
      dispatch(setContentTiersLoading(true));
      const response = await api.patch(`/content-tiers/${id}`, data);
      dispatch(updateTierInList(response.data));
      dispatch(setCurrentTier(response.data));
      dispatch(setContentTiersError(null));
      toastSuccess('Tier updated successfully!');
      return response.data as ContentTier;
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to update tier';
      dispatch(setContentTiersError(message));
      toastError(message);
      throw error;
    } finally {
      dispatch(setContentTiersLoading(false));
    }
  }
);

// Delete a tier
export const deleteTier = createAsyncThunk(
  'contentTiers/deleteTier',
  async (tierId: string, { dispatch }) => {
    try {
      dispatch(setContentTiersLoading(true));
      await api.delete(`/content-tiers/${tierId}`);
      dispatch(removeTier(tierId));
      dispatch(setContentTiersError(null));
      toastSuccess('Tier deleted successfully!');
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to delete tier';
      dispatch(setContentTiersError(message));
      toastError(message);
      throw error;
    } finally {
      dispatch(setContentTiersLoading(false));
    }
  }
);

// ============================================================
// Subscription Thunks
// ============================================================

// Fetch user's subscriptions
export const fetchMySubscriptions = createAsyncThunk(
  'contentTiers/fetchMySubscriptions',
  async (_, { dispatch }) => {
    try {
      dispatch(setContentTiersLoading(true));
      const response = await api.get('/content-tiers/subscriptions/my');
      dispatch(setUserSubscriptions(response.data));
      dispatch(setContentTiersError(null));
      return response.data as Subscription[];
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to fetch subscriptions';
      dispatch(setContentTiersError(message));
      throw error;
    } finally {
      dispatch(setContentTiersLoading(false));
    }
  }
);

// Subscribe to a tier
export const subscribeToTier = createAsyncThunk(
  'contentTiers/subscribeToTier',
  async (tierId: string, { dispatch }) => {
    try {
      dispatch(setContentTiersLoading(true));
      const response = await api.post(`/content-tiers/tiers/${tierId}/subscribe`);
      dispatch(addSubscription(response.data));
      dispatch(setContentTiersError(null));
      toastSuccess('Subscribed successfully!');
      return response.data as Subscription;
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to subscribe';
      dispatch(setContentTiersError(message));
      toastError(message);
      throw error;
    } finally {
      dispatch(setContentTiersLoading(false));
    }
  }
);

// Cancel subscription
export const cancelSubscription = createAsyncThunk(
  'contentTiers/cancelSubscription',
  async (subscriptionId: string, { dispatch }) => {
    try {
      dispatch(setContentTiersLoading(true));
      const response = await api.post(`/content-tiers/subscriptions/${subscriptionId}/cancel`);
      dispatch(updateSubscription(response.data));
      dispatch(setContentTiersError(null));
      toastSuccess('Subscription cancelled');
      return response.data as Subscription;
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to cancel subscription';
      dispatch(setContentTiersError(message));
      toastError(message);
      throw error;
    } finally {
      dispatch(setContentTiersLoading(false));
    }
  }
);

// ============================================================
// Gated Content Thunks
// ============================================================

// Fetch gated content for a tier
export const fetchTierContent = createAsyncThunk(
  'contentTiers/fetchTierContent',
  async (tierId: string, { dispatch }) => {
    try {
      dispatch(setContentTiersLoading(true));
      const response = await api.get(`/content-tiers/tiers/${tierId}/content`);
      dispatch(setGatedContent(response.data));
      dispatch(setContentTiersError(null));
      return response.data as GatedContent[];
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to fetch content';
      dispatch(setContentTiersError(message));
      throw error;
    } finally {
      dispatch(setContentTiersLoading(false));
    }
  }
);

// Fetch accessible content for current user
export const fetchAccessibleContent = createAsyncThunk(
  'contentTiers/fetchAccessibleContent',
  async (artistId: string, { dispatch }) => {
    try {
      dispatch(setContentTiersLoading(true));
      const response = await api.get(`/content-tiers/accessible/${artistId}`);
      dispatch(setAccessibleContent(response.data));
      dispatch(setContentTiersError(null));
      return response.data as GatedContent[];
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to fetch accessible content';
      dispatch(setContentTiersError(message));
      throw error;
    } finally {
      dispatch(setContentTiersLoading(false));
    }
  }
);

// Create gated content
export const createGatedContent = createAsyncThunk(
  'contentTiers/createGatedContent',
  async ({ artistId, data }: { artistId: string; data: GatedContentFormData }, { dispatch }) => {
    try {
      dispatch(setContentTiersLoading(true));
      const response = await api.post(`/content-tiers/artists/${artistId}/content`, data);
      dispatch(addGatedContent(response.data));
      dispatch(setContentTiersError(null));
      toastSuccess('Content created successfully!');
      return response.data as GatedContent;
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to create content';
      dispatch(setContentTiersError(message));
      toastError(message);
      throw error;
    } finally {
      dispatch(setContentTiersLoading(false));
    }
  }
);

// Update gated content
export const updateGatedContentThunk = createAsyncThunk(
  'contentTiers/updateGatedContent',
  async ({ id, data }: { id: string; data: Partial<GatedContentFormData> }, { dispatch }) => {
    try {
      dispatch(setContentTiersLoading(true));
      const response = await api.patch(`/content-tiers/content/${id}`, data);
      dispatch(updateGatedContent(response.data));
      dispatch(setContentTiersError(null));
      toastSuccess('Content updated successfully!');
      return response.data as GatedContent;
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to update content';
      dispatch(setContentTiersError(message));
      toastError(message);
      throw error;
    } finally {
      dispatch(setContentTiersLoading(false));
    }
  }
);

// Delete gated content
export const deleteGatedContent = createAsyncThunk(
  'contentTiers/deleteGatedContent',
  async (contentId: string, { dispatch }) => {
    try {
      dispatch(setContentTiersLoading(true));
      await api.delete(`/content-tiers/content/${contentId}`);
      dispatch(removeGatedContent(contentId));
      dispatch(setContentTiersError(null));
      toastSuccess('Content deleted successfully!');
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to delete content';
      dispatch(setContentTiersError(message));
      toastError(message);
      throw error;
    } finally {
      dispatch(setContentTiersLoading(false));
    }
  }
);
