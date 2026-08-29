'use client';

import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/app/services/api';
import {
  setGrants,
  setCurrentGrant,
  addGrant,
  updateGrantInList,
  removeGrant,
  setApplications,
  setCurrentApplication,
  setUserApplications,
  addApplication,
  updateApplicationInList,
  removeApplication,
  setVotes,
  addVote,
  setUserVotes,
  setRecipients,
  addRecipient,
  updateRecipient,
  setImpactMetrics,
  addImpactMetric,
  setGrantsLoading,
  setGrantsError,
  Grant,
  GrantApplication,
  GrantApplicationFormData,
  GrantFormData,
  GrantFilters,
  PaginatedGrantResponse,
  VoteType,
  GrantVote,
  GrantRecipient,
  GrantImpactMetric,
} from './grantsSlice';
import { toastSuccess, toastError } from '@/utils/toast';

// ============================================================
// Grant Thunks
// ============================================================

// Fetch all grants with filters and pagination
export const fetchGrants = createAsyncThunk(
  'grants/fetchGrants',
  async (filters: GrantFilters = {}, { dispatch }) => {
    try {
      dispatch(setGrantsLoading(true));
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.search) params.append('search', filters.search);
      params.append('page', String(filters.page ?? 1));
      params.append('limit', String(filters.limit ?? 20));

      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await api.get(`/grants${query}`);
      dispatch(setGrants(response.data.grants || response.data));
      dispatch(setGrantsError(null));
      return response.data as PaginatedGrantResponse;
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to fetch grants';
      dispatch(setGrantsError(message));
      throw error;
    } finally {
      dispatch(setGrantsLoading(false));
    }
  }
);

// Fetch single grant by ID
export const fetchGrantById = createAsyncThunk(
  'grants/fetchGrantById',
  async (grantId: string, { dispatch }) => {
    try {
      dispatch(setGrantsLoading(true));
      const response = await api.get(`/grants/${grantId}`);
      dispatch(setCurrentGrant(response.data));
      dispatch(setGrantsError(null));
      return response.data as Grant;
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to fetch grant';
      dispatch(setGrantsError(message));
      throw error;
    } finally {
      dispatch(setGrantsLoading(false));
    }
  }
);

// Create a new grant
export const createGrant = createAsyncThunk(
  'grants/createGrant',
  async (data: GrantFormData, { dispatch }) => {
    try {
      dispatch(setGrantsLoading(true));
      const response = await api.post('/grants', data);
      dispatch(addGrant(response.data));
      dispatch(setGrantsError(null));
      toastSuccess('Grant created successfully!');
      return response.data as Grant;
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to create grant';
      dispatch(setGrantsError(message));
      toastError(message);
      throw error;
    } finally {
      dispatch(setGrantsLoading(false));
    }
  }
);

// Update a grant
export const updateGrant = createAsyncThunk(
  'grants/updateGrant',
  async ({ id, data }: { id: string; data: Partial<GrantFormData> }, { dispatch }) => {
    try {
      dispatch(setGrantsLoading(true));
      const response = await api.patch(`/grants/${id}`, data);
      dispatch(updateGrantInList(response.data));
      dispatch(setCurrentGrant(response.data));
      dispatch(setGrantsError(null));
      toastSuccess('Grant updated successfully!');
      return response.data as Grant;
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to update grant';
      dispatch(setGrantsError(message));
      toastError(message);
      throw error;
    } finally {
      dispatch(setGrantsLoading(false));
    }
  }
);

// Delete a grant
export const deleteGrant = createAsyncThunk(
  'grants/deleteGrant',
  async (grantId: string, { dispatch }) => {
    try {
      dispatch(setGrantsLoading(true));
      await api.delete(`/grants/${grantId}`);
      dispatch(removeGrant(grantId));
      dispatch(setGrantsError(null));
      toastSuccess('Grant deleted successfully!');
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to delete grant';
      dispatch(setGrantsError(message));
      toastError(message);
      throw error;
    } finally {
      dispatch(setGrantsLoading(false));
    }
  }
);

// ============================================================
// Application Thunks
// ============================================================

// Fetch applications for a grant
export const fetchGrantApplications = createAsyncThunk(
  'grants/fetchGrantApplications',
  async (grantId: string, { dispatch }) => {
    try {
      dispatch(setGrantsLoading(true));
      const response = await api.get(`/grants/${grantId}/applications`);
      dispatch(setApplications(response.data));
      dispatch(setGrantsError(null));
      return response.data as GrantApplication[];
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to fetch applications';
      dispatch(setGrantsError(message));
      throw error;
    } finally {
      dispatch(setGrantsLoading(false));
    }
  }
);

// Fetch user's applications
export const fetchMyApplications = createAsyncThunk(
  'grants/fetchMyApplications',
  async (_, { dispatch }) => {
    try {
      dispatch(setGrantsLoading(true));
      const response = await api.get('/grants/my-applications');
      dispatch(setUserApplications(response.data));
      dispatch(setGrantsError(null));
      return response.data as GrantApplication[];
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to fetch your applications';
      dispatch(setGrantsError(message));
      throw error;
    } finally {
      dispatch(setGrantsLoading(false));
    }
  }
);

// Submit a grant application
export const submitApplication = createAsyncThunk(
  'grants/submitApplication',
  async ({ grantId, data }: { grantId: string; data: GrantApplicationFormData }, { dispatch }) => {
    try {
      dispatch(setGrantsLoading(true));
      const response = await api.post(`/grants/${grantId}/applications`, data);
      dispatch(addApplication(response.data));
      dispatch(setGrantsError(null));
      toastSuccess('Application submitted successfully!');
      return response.data as GrantApplication;
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to submit application';
      dispatch(setGrantsError(message));
      toastError(message);
      throw error;
    } finally {
      dispatch(setGrantsLoading(false));
    }
  }
);

// Update application status (admin/creator only)
export const updateApplicationStatus = createAsyncThunk(
  'grants/updateApplicationStatus',
  async ({ id, status }: { id: string; status: string }, { dispatch }) => {
    try {
      dispatch(setGrantsLoading(true));
      const response = await api.patch(`/grants/applications/${id}/status`, { status });
      dispatch(updateApplicationInList(response.data));
      dispatch(setGrantsError(null));
      toastSuccess('Application status updated!');
      return response.data as GrantApplication;
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to update application';
      dispatch(setGrantsError(message));
      toastError(message);
      throw error;
    } finally {
      dispatch(setGrantsLoading(false));
    }
  }
);

// Withdraw application
export const withdrawApplication = createAsyncThunk(
  'grants/withdrawApplication',
  async (applicationId: string, { dispatch }) => {
    try {
      dispatch(setGrantsLoading(true));
      await api.delete(`/grants/applications/${applicationId}`);
      dispatch(removeApplication(applicationId));
      dispatch(setGrantsError(null));
      toastSuccess('Application withdrawn successfully!');
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to withdraw application';
      dispatch(setGrantsError(message));
      toastError(message);
      throw error;
    } finally {
      dispatch(setGrantsLoading(false));
    }
  }
);

// ============================================================
// Voting Thunks
// ============================================================

// Fetch votes for an application
export const fetchApplicationVotes = createAsyncThunk(
  'grants/fetchApplicationVotes',
  async (applicationId: string, { dispatch }) => {
    try {
      dispatch(setGrantsLoading(true));
      const response = await api.get(`/grants/applications/${applicationId}/votes`);
      dispatch(setVotes(response.data));
      dispatch(setGrantsError(null));
      return response.data as GrantVote[];
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to fetch votes';
      dispatch(setGrantsError(message));
      throw error;
    } finally {
      dispatch(setGrantsLoading(false));
    }
  }
);

// Fetch user's votes
export const fetchMyVotes = createAsyncThunk(
  'grants/fetchMyVotes',
  async (_, { dispatch }) => {
    try {
      dispatch(setGrantsLoading(true));
      const response = await api.get('/grants/my-votes');
      dispatch(setUserVotes(response.data));
      dispatch(setGrantsError(null));
      return response.data as Record<string, VoteType>;
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to fetch votes';
      dispatch(setGrantsError(message));
      throw error;
    } finally {
      dispatch(setGrantsLoading(false));
    }
  }
);

// Cast a vote on an application
export const castVote = createAsyncThunk(
  'grants/castVote',
  async ({ applicationId, voteType }: { applicationId: string; voteType: VoteType }, { dispatch }) => {
    try {
      dispatch(setGrantsLoading(true));
      const response = await api.post(`/grants/applications/${applicationId}/votes`, { voteType });
      dispatch(addVote(response.data));
      dispatch(setGrantsError(null));
      toastSuccess('Vote recorded!');
      return response.data as GrantVote;
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to cast vote';
      dispatch(setGrantsError(message));
      toastError(message);
      throw error;
    } finally {
      dispatch(setGrantsLoading(false));
    }
  }
);

// ============================================================
// Recipient & Fund Distribution Thunks
// ============================================================

// Fetch recipients for a grant
export const fetchGrantRecipients = createAsyncThunk(
  'grants/fetchGrantRecipients',
  async (grantId: string, { dispatch }) => {
    try {
      dispatch(setGrantsLoading(true));
      const response = await api.get(`/grants/${grantId}/recipients`);
      dispatch(setRecipients(response.data));
      dispatch(setGrantsError(null));
      return response.data as GrantRecipient[];
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to fetch recipients';
      dispatch(setGrantsError(message));
      throw error;
    } finally {
      dispatch(setGrantsLoading(false));
    }
  }
);

// Distribute funds to a recipient
export const distributeFunds = createAsyncThunk(
  'grants/distributeFunds',
  async ({ recipientId, amount }: { recipientId: string; amount: number }, { dispatch }) => {
    try {
      dispatch(setGrantsLoading(true));
      const response = await api.post(`/grants/recipients/${recipientId}/distribute`, { amount });
      dispatch(updateRecipient(response.data));
      dispatch(setGrantsError(null));
      toastSuccess('Funds distributed successfully!');
      return response.data as GrantRecipient;
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to distribute funds';
      dispatch(setGrantsError(message));
      toastError(message);
      throw error;
    } finally {
      dispatch(setGrantsLoading(false));
    }
  }
);

// ============================================================
// Impact Tracking Thunks
// ============================================================

// Fetch impact metrics for a grant
export const fetchGrantImpact = createAsyncThunk(
  'grants/fetchGrantImpact',
  async (grantId: string, { dispatch }) => {
    try {
      dispatch(setGrantsLoading(true));
      const response = await api.get(`/grants/${grantId}/impact`);
      dispatch(setImpactMetrics(response.data));
      dispatch(setGrantsError(null));
      return response.data as GrantImpactMetric[];
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to fetch impact data';
      dispatch(setGrantsError(message));
      throw error;
    } finally {
      dispatch(setGrantsLoading(false));
    }
  }
);

// Report impact metric
export const reportImpactMetric = createAsyncThunk(
  'grants/reportImpactMetric',
  async (
    { grantId, metric }: { grantId: string; metric: Omit<GrantImpactMetric, 'id' | 'reportedAt'> },
    { dispatch }
  ) => {
    try {
      dispatch(setGrantsLoading(true));
      const response = await api.post(`/grants/${grantId}/impact`, metric);
      dispatch(addImpactMetric(response.data));
      dispatch(setGrantsError(null));
      toastSuccess('Impact metric reported!');
      return response.data as GrantImpactMetric;
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to report metric';
      dispatch(setGrantsError(message));
      toastError(message);
      throw error;
    } finally {
      dispatch(setGrantsLoading(false));
    }
  }
);
