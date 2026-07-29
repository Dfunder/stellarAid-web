'use client';

import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  setDonations,
  setUserDonations,
  setCampaignDonations,
  addDonation,
  updateDonation,
  setLoading,
  setError,
} from './donationsSlice';

// Fetch all donations (admin only)
export const fetchAllDonations = createAsyncThunk(
  'donations/fetchAllDonations',
  async (_, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await fetch('/api/donations');

      if (!response.ok) throw new Error('Failed to fetch donations');

      const donations = await response.json();
      dispatch(setDonations(donations));
      dispatch(setError(null));
      return donations;
    } catch (error: any) {
      dispatch(setError(error.message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Fetch user's donations
export const fetchUserDonations = createAsyncThunk(
  'donations/fetchUserDonations',
  async (userId: string, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await fetch(`/api/users/${userId}/donations`);

      if (!response.ok) throw new Error('Failed to fetch user donations');

      const donations = await response.json();
      dispatch(setUserDonations(donations));
      dispatch(setError(null));
      return donations;
    } catch (error: any) {
      dispatch(setError(error.message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Fetch donations for a specific campaign
export const fetchCampaignDonations = createAsyncThunk(
  'donations/fetchCampaignDonations',
  async (campaignId: string, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await fetch(`/api/campaigns/${campaignId}/donations`);

      if (!response.ok) throw new Error('Failed to fetch campaign donations');

      const donations = await response.json();
      dispatch(setCampaignDonations(donations));
      dispatch(setError(null));
      return donations;
    } catch (error: any) {
      dispatch(setError(error.message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Process a new donation
export const processDonation = createAsyncThunk(
  'donations/processDonation',
  async (donationData: any, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donationData),
      });

      if (!response.ok) throw new Error('Failed to process donation');

      const newDonation = await response.json();
      dispatch(addDonation(newDonation));
      dispatch(setError(null));
      return newDonation;
    } catch (error: any) {
      dispatch(setError(error.message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Update donation status
export const updateDonationStatus = createAsyncThunk(
  'donations/updateDonationStatus',
  async ({ id, status }: { id: string; status: string }, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await fetch(`/api/donations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update donation status');

      const updatedDonation = await response.json();
      dispatch(updateDonation(updatedDonation));
      dispatch(setError(null));
      return updatedDonation;
    } catch (error: any) {
      dispatch(setError(error.message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);
