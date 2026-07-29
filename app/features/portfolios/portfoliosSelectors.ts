'use client';

import { RootState } from '@/app/store';

export const selectPortfolios = (state: RootState) => state.portfolios.portfolios;
export const selectCurrentPortfolio = (state: RootState) => state.portfolios.currentPortfolio;
export const selectPortfoliosLoading = (state: RootState) => state.portfolios.loading;
export const selectPortfoliosError = (state: RootState) => state.portfolios.error;

export const selectPublishedPortfolios = (state: RootState) =>
  state.portfolios.portfolios.filter((p) => p.status === 'published');

export const selectDraftPortfolios = (state: RootState) =>
  state.portfolios.portfolios.filter((p) => p.status === 'draft');
