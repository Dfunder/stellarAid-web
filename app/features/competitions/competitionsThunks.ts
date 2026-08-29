'use client';

import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/app/services/api';
import {
  setCompetitions,
  addCompetition,
  updateCompetitionInList,
  removeCompetition,
  setCurrentCompetition,
  setCompetitionsLoading,
  setCompetitionsError,
  Competition,
  PrizeTier,
  PrizeDistributionPayload,
} from './competitionsSlice';
import { toastSuccess, toastError } from '@/utils/toast';

export interface CompetitionFormData {
  title: string;
  description: string;
  category: string;
  prizePool: number;
  prizeAsset: 'XLM' | 'USDC';
  prizeTiers: Omit<PrizeTier, 'id' | 'status'>[];
  entryFee: number;
  maxParticipants: number;
  startDate: string;
  endDate: string;
  judgingEndDate?: string;
  coverImage?: string;
}

// Fetch all competitions
export const fetchCompetitions = createAsyncThunk(
  'competitions/fetchCompetitions',
  async (_, { dispatch }) => {
    try {
      dispatch(setCompetitionsLoading(true));
      const response = await api.get('/competitions');
      dispatch(setCompetitions(response.data));
      dispatch(setCompetitionsError(null));
      return response.data;
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to fetch competitions';
      dispatch(setCompetitionsError(message));
      throw error;
    } finally {
      dispatch(setCompetitionsLoading(false));
    }
  }
);

// Fetch single competition by ID
export const fetchCompetitionById = createAsyncThunk(
  'competitions/fetchCompetitionById',
  async (competitionId: string, { dispatch }) => {
    try {
      dispatch(setCompetitionsLoading(true));
      const response = await api.get(`/competitions/${competitionId}`);
      dispatch(setCurrentCompetition(response.data));
      dispatch(setCompetitionsError(null));
      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error.message || 'Failed to fetch competition';
      dispatch(setCompetitionsError(message));
      throw error;
    } finally {
      dispatch(setCompetitionsLoading(false));
    }
  }
);

// Create a new competition
export const createCompetition = createAsyncThunk(
  'competitions/createCompetition',
  async (data: CompetitionFormData, { dispatch }) => {
    try {
      dispatch(setCompetitionsLoading(true));
      const response = await api.post('/competitions', data);
      dispatch(addCompetition(response.data));
      dispatch(setCompetitionsError(null));
      toastSuccess('Competition created successfully!');
      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error.message || 'Failed to create competition';
      dispatch(setCompetitionsError(message));
      toastError(message);
      throw error;
    } finally {
      dispatch(setCompetitionsLoading(false));
    }
  }
);

// Update an existing competition
export const updateCompetition = createAsyncThunk(
  'competitions/updateCompetition',
  async ({ id, data }: { id: string; data: Partial<CompetitionFormData> }, { dispatch }) => {
    try {
      dispatch(setCompetitionsLoading(true));
      const response = await api.patch(`/competitions/${id}`, data);
      dispatch(updateCompetitionInList(response.data));
      dispatch(setCurrentCompetition(response.data));
      dispatch(setCompetitionsError(null));
      toastSuccess('Competition updated successfully!');
      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error.message || 'Failed to update competition';
      dispatch(setCompetitionsError(message));
      toastError(message);
      throw error;
    } finally {
      dispatch(setCompetitionsLoading(false));
    }
  }
);

// Delete a competition
export const deleteCompetition = createAsyncThunk(
  'competitions/deleteCompetition',
  async (competitionId: string, { dispatch }) => {
    try {
      dispatch(setCompetitionsLoading(true));
      await api.delete(`/competitions/${competitionId}`);
      dispatch(removeCompetition(competitionId));
      dispatch(setCompetitionsError(null));
      toastSuccess('Competition deleted successfully!');
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error.message || 'Failed to delete competition';
      dispatch(setCompetitionsError(message));
      toastError(message);
      throw error;
    } finally {
      dispatch(setCompetitionsLoading(false));
    }
  }
);

// Update prize tier
export const updatePrizeTier = createAsyncThunk(
  'competitions/updatePrizeTier',
  async ({ competitionId, tier }: { competitionId: string; tier: Partial<PrizeTier> }, { dispatch }) => {
    try {
      dispatch(setCompetitionsLoading(true));
      const response = await api.patch(`/competitions/${competitionId}/prizes/${tier.id}`, tier);
      dispatch(setCurrentCompetition(response.data));
      dispatch(setCompetitionsError(null));
      toastSuccess('Prize tier updated!');
      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error.message || 'Failed to update prize tier';
      dispatch(setCompetitionsError(message));
      toastError(message);
      throw error;
    } finally {
      dispatch(setCompetitionsLoading(false));
    }
  }
);

// Distribute prize to winner via Stellar
export const distributePrize = createAsyncThunk(
  'competitions/distributePrize',
  async ({ competitionId, prizeTierId, winnerPublicKey }: PrizeDistributionPayload, { dispatch }) => {
    try {
      dispatch(setCompetitionsLoading(true));
      const response = await api.post(`/competitions/${competitionId}/prizes/distribute`, {
        prizeTierId,
        winnerPublicKey,
      });
      dispatch(setCompetitionsError(null));
      toastSuccess(`Prize distributed successfully! Transaction: ${response.data.txHash}`);
      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error.message || 'Failed to distribute prize';
      dispatch(setCompetitionsError(message));
      toastError(message);
      throw error;
    } finally {
      dispatch(setCompetitionsLoading(false));
    }
  }
);

// Publish competition (open entries)
export const publishCompetition = createAsyncThunk(
  'competitions/publishCompetition',
  async (competitionId: string, { dispatch }) => {
    try {
      dispatch(setCompetitionsLoading(true));
      const response = await api.patch(`/competitions/${competitionId}`, { status: 'open' });
      dispatch(updateCompetitionInList(response.data));
      dispatch(setCurrentCompetition(response.data));
      dispatch(setCompetitionsError(null));
      toastSuccess('Competition is now open for entries!');
      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error.message || 'Failed to publish competition';
      dispatch(setCompetitionsError(message));
      toastError(message);
      throw error;
    } finally {
      dispatch(setCompetitionsLoading(false));
    }
  }
);

// Close competition and move to judging
export const closeCompetition = createAsyncThunk(
  'competitions/closeCompetition',
  async (competitionId: string, { dispatch }) => {
    try {
      dispatch(setCompetitionsLoading(true));
      const response = await api.patch(`/competitions/${competitionId}`, { status: 'judging' });
      dispatch(updateCompetitionInList(response.data));
      dispatch(setCurrentCompetition(response.data));
      dispatch(setCompetitionsError(null));
      toastSuccess('Competition closed and moved to judging phase.');
      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error.message || 'Failed to close competition';
      dispatch(setCompetitionsError(message));
      toastError(message);
      throw error;
    } finally {
      dispatch(setCompetitionsLoading(false));
    }
  }
);

// Complete competition and distribute prizes
export const completeCompetition = createAsyncThunk(
  'competitions/completeCompetition',
  async (competitionId: string, { dispatch }) => {
    try {
      dispatch(setCompetitionsLoading(true));
      const response = await api.patch(`/competitions/${competitionId}`, { status: 'completed' });
      dispatch(updateCompetitionInList(response.data));
      dispatch(setCurrentCompetition(response.data));
      dispatch(setCompetitionsError(null));
      toastSuccess('Competition completed! Winners can now claim prizes.');
      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error.message || 'Failed to complete competition';
      dispatch(setCompetitionsError(message));
      toastError(message);
      throw error;
    } finally {
      dispatch(setCompetitionsLoading(false));
    }
  }
);
