'use client';

import { RootState } from '../../store';

export const selectGlobalError = (state: RootState) => state.errors.globalError;
export const selectApiErrors = (state: RootState) => state.errors.apiErrors;
export const selectApiErrorByKey = (key: string) => (state: RootState) => state.errors.apiErrors[key] || null;