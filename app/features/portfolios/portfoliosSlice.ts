'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PortfolioItem {
  id: string;
  imageUrl: string;
  title: string;
  description?: string;
}

export interface Portfolio {
  id: string;
  artistId: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  coverImage: string;
  items: PortfolioItem[];
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

interface PortfoliosState {
  portfolios: Portfolio[];
  currentPortfolio: Portfolio | null;
  loading: boolean;
  error: string | null;
}

const initialState: PortfoliosState = {
  portfolios: [],
  currentPortfolio: null,
  loading: false,
  error: null,
};

const portfoliosSlice = createSlice({
  name: 'portfolios',
  initialState,
  reducers: {
    setPortfolios: (state, action: PayloadAction<Portfolio[]>) => {
      state.portfolios = action.payload;
      state.error = null;
    },
    addPortfolio: (state, action: PayloadAction<Portfolio>) => {
      state.portfolios.unshift(action.payload);
    },
    updatePortfolioInList: (state, action: PayloadAction<Portfolio>) => {
      const index = state.portfolios.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.portfolios[index] = action.payload;
      }
    },
    removePortfolio: (state, action: PayloadAction<string>) => {
      state.portfolios = state.portfolios.filter((p) => p.id !== action.payload);
    },
    setCurrentPortfolio: (state, action: PayloadAction<Portfolio | null>) => {
      state.currentPortfolio = action.payload;
    },
    clearPortfolios: (state) => {
      state.portfolios = [];
      state.currentPortfolio = null;
    },
    setPortfoliosLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setPortfoliosError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setPortfolios,
  addPortfolio,
  updatePortfolioInList,
  removePortfolio,
  setCurrentPortfolio,
  clearPortfolios,
  setPortfoliosLoading,
  setPortfoliosError,
} = portfoliosSlice.actions;

export default portfoliosSlice.reducer;
