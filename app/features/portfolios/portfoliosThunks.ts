'use client';

import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/app/services/api';
import {
  setPortfolios,
  addPortfolio,
  updatePortfolioInList,
  removePortfolio,
  setCurrentPortfolio,
  setPortfoliosLoading,
  setPortfoliosError,
  Portfolio,
} from './portfoliosSlice';
import { toastSuccess, toastError } from '@/utils/toast';

interface PortfolioFormData {
  title: string;
  description: string;
  category: string;
  tags: string[];
  coverImage?: string;
  items?: { imageUrl: string; title: string; description?: string }[];
  status: 'draft' | 'published';
}

// Fetch all portfolios for the current artist
export const fetchMyPortfolios = createAsyncThunk(
  'portfolios/fetchMyPortfolios',
  async (_, { dispatch }) => {
    try {
      dispatch(setPortfoliosLoading(true));
      const response = await api.get('/portfolios/my');
      dispatch(setPortfolios(response.data));
      dispatch(setPortfoliosError(null));
      return response.data;
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to fetch portfolios';
      dispatch(setPortfoliosError(message));
      throw error;
    } finally {
      dispatch(setPortfoliosLoading(false));
    }
  }
);

// Fetch published portfolios for a specific artist
export const fetchArtistPortfolios = createAsyncThunk(
  'portfolios/fetchArtistPortfolios',
  async (artistId: string, { dispatch }) => {
    try {
      dispatch(setPortfoliosLoading(true));
      const response = await api.get(`/artists/${artistId}/portfolios`);
      dispatch(setPortfolios(response.data));
      dispatch(setPortfoliosError(null));
      return response.data;
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to fetch portfolios';
      dispatch(setPortfoliosError(message));
      throw error;
    } finally {
      dispatch(setPortfoliosLoading(false));
    }
  }
);

// Fetch single portfolio by ID
export const fetchPortfolioById = createAsyncThunk(
  'portfolios/fetchPortfolioById',
  async (portfolioId: string, { dispatch }) => {
    try {
      dispatch(setPortfoliosLoading(true));
      const response = await api.get(`/portfolios/${portfolioId}`);
      dispatch(setCurrentPortfolio(response.data));
      dispatch(setPortfoliosError(null));
      return response.data;
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to fetch portfolio';
      dispatch(setPortfoliosError(message));
      throw error;
    } finally {
      dispatch(setPortfoliosLoading(false));
    }
  }
);

// Create a new portfolio
export const createPortfolio = createAsyncThunk(
  'portfolios/createPortfolio',
  async (data: PortfolioFormData, { dispatch }) => {
    try {
      dispatch(setPortfoliosLoading(true));
      const response = await api.post('/portfolios', data);
      dispatch(addPortfolio(response.data));
      dispatch(setPortfoliosError(null));
      toastSuccess('Portfolio created successfully!');
      return response.data;
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to create portfolio';
      dispatch(setPortfoliosError(message));
      toastError(message);
      throw error;
    } finally {
      dispatch(setPortfoliosLoading(false));
    }
  }
);

// Update an existing portfolio
export const updatePortfolio = createAsyncThunk(
  'portfolios/updatePortfolio',
  async ({ id, data }: { id: string; data: Partial<PortfolioFormData> }, { dispatch }) => {
    try {
      dispatch(setPortfoliosLoading(true));
      const response = await api.patch(`/portfolios/${id}`, data);
      dispatch(updatePortfolioInList(response.data));
      dispatch(setCurrentPortfolio(response.data));
      dispatch(setPortfoliosError(null));
      toastSuccess('Portfolio updated successfully!');
      return response.data;
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to update portfolio';
      dispatch(setPortfoliosError(message));
      toastError(message);
      throw error;
    } finally {
      dispatch(setPortfoliosLoading(false));
    }
  }
);

// Delete a portfolio
export const deletePortfolio = createAsyncThunk(
  'portfolios/deletePortfolio',
  async (portfolioId: string, { dispatch }) => {
    try {
      dispatch(setPortfoliosLoading(true));
      await api.delete(`/portfolios/${portfolioId}`);
      dispatch(removePortfolio(portfolioId));
      dispatch(setPortfoliosError(null));
      toastSuccess('Portfolio deleted successfully!');
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to delete portfolio';
      dispatch(setPortfoliosError(message));
      toastError(message);
      throw error;
    } finally {
      dispatch(setPortfoliosLoading(false));
    }
  }
);

// Toggle portfolio publish status
export const togglePortfolioStatus = createAsyncThunk(
  'portfolios/togglePortfolioStatus',
  async ({ id, currentStatus }: { id: string; currentStatus: 'draft' | 'published' }, { dispatch }) => {
    try {
      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      const response = await api.patch(`/portfolios/${id}`, { status: newStatus });
      dispatch(updatePortfolioInList(response.data));
      toastSuccess(`Portfolio ${newStatus === 'published' ? 'published' : 'unpublished'}!`);
      return response.data;
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to update portfolio status';
      toastError(message);
      throw error;
    }
  }
);
