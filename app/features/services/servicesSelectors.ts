'use client';

import { RootState } from '@/app/store';

export const selectServices = (state: RootState) => state.services.services;
export const selectCurrentService = (state: RootState) => state.services.currentService;
export const selectServicesLoading = (state: RootState) => state.services.loading;
export const selectServicesError = (state: RootState) => state.services.error;

export const selectPublishedServices = (state: RootState) =>
  state.services.services.filter((s) => s.status === 'published');

export const selectDraftServices = (state: RootState) =>
  state.services.services.filter((s) => s.status === 'draft');

export const selectInactiveServices = (state: RootState) =>
  state.services.services.filter((s) => s.status === 'inactive');
