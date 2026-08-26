'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Artist {
  id: string;
  name: string;
  avatar: string;
  coverImage: string;
  tagline: string;
  bio: string;
  skills: string[];
  rating: number;
  reviewCount: number;
  verified: boolean;
  portfolioCount: number;
  servicesCount: number;
  walletAddress?: string;
  portfolioUrl?: string;
  createdAt: string;
}

interface ArtistsState {
  currentArtist: Artist | null;
  loading: boolean;
  error: string | null;
}

const initialState: ArtistsState = {
  currentArtist: null,
  loading: false,
  error: null,
};

const artistsSlice = createSlice({
  name: 'artists',
  initialState,
  reducers: {
    setCurrentArtist: (state, action: PayloadAction<Artist>) => {
      state.currentArtist = action.payload;
      state.error = null;
    },
    clearCurrentArtist: (state) => {
      state.currentArtist = null;
    },
    setArtistsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setArtistsError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setCurrentArtist, clearCurrentArtist, setArtistsLoading, setArtistsError } =
  artistsSlice.actions;

export default artistsSlice.reducer;
