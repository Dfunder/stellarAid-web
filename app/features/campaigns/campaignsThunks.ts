'use client';

import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  setCampaigns,
  setCurrentCampaign,
  addCampaign,
  updateCampaign,
  removeCampaign,
  setLoading,
  setError,
} from './campaignsSlice';

// Fetch all campaigns
export const fetchCampaigns = createAsyncThunk(
  'campaigns/fetchCampaigns',
  async (_, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await fetch('/api/campaigns');

      if (!response.ok) throw new Error('Failed to fetch campaigns');

      const campaigns = await response.json();
      dispatch(setCampaigns(campaigns));
      dispatch(setError(null));
      return campaigns;
    } catch (error: any) {
      dispatch(setError(error.message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Fetch a single campaign by ID
export const fetchCampaignById = createAsyncThunk(
  'campaigns/fetchCampaignById',
  async (id: string, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await fetch(`/api/campaigns/${id}`);

      if (!response.ok) throw new Error('Failed to fetch campaign');

      const campaign = await response.json();
      dispatch(setCurrentCampaign(campaign));
      dispatch(setError(null));
      return campaign;
    } catch (error: any) {
      dispatch(setError(error.message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Create a new campaign
export const createCampaign = createAsyncThunk(
  'campaigns/createCampaign',
  async (campaignData: Partial<any>, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData),
      });

      if (!response.ok) throw new Error('Failed to create campaign');

      const newCampaign = await response.json();
      dispatch(addCampaign(newCampaign));
      dispatch(setError(null));
      return newCampaign;
    } catch (error: any) {
      dispatch(setError(error.message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Update an existing campaign
export const updateExistingCampaign = createAsyncThunk(
  'campaigns/updateExistingCampaign',
  async ({ id, data }: { id: string; data: Partial<any> }, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await fetch(`/api/campaigns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update campaign');

      const updatedCampaign = await response.json();
      dispatch(updateCampaign(updatedCampaign));
      dispatch(setError(null));
      return updatedCampaign;
    } catch (error: any) {
      dispatch(setError(error.message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Delete a campaign
export const deleteCampaign = createAsyncThunk(
  'campaigns/deleteCampaign',
  async (id: string, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await fetch(`/api/campaigns/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete campaign');

      dispatch(removeCampaign(id));
      dispatch(setError(null));
    } catch (error: any) {
      dispatch(setError(error.message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);
