'use client';

import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/app/services/api';
import { setCurrentArtist, setArtistsLoading, setArtistsError } from './artistsSlice';

export const fetchArtistById = createAsyncThunk(
  'artists/fetchArtistById',
  async (artistId: string, { dispatch }) => {
    try {
      dispatch(setArtistsLoading(true));
      const response = await api.get(`/artists/${artistId}`);
      dispatch(setCurrentArtist(response.data));
      dispatch(setArtistsError(null));
      return response.data;
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to fetch artist';
      dispatch(setArtistsError(message));
      throw error;
    } finally {
      dispatch(setArtistsLoading(false));
    }
  }
);
