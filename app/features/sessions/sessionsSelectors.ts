'use client';

import { RootState } from '@/app/store';

export const selectActiveSessions = (state: RootState) => state.sessions.activeSessions;
export const selectSessionSettings = (state: RootState) => state.sessions.sessionSettings;
export const selectSessionHistory = (state: RootState) => state.sessions.sessionHistory;
export const selectSessionWarning = (state: RootState) => state.sessions.warning;
export const selectSessionsLoading = (state: RootState) => state.sessions.loading;
export const selectSessionsError = (state: RootState) => state.sessions.error;
export const selectCurrentSession = (state: RootState) =>
  state.sessions.activeSessions.find((s) => s.isCurrent) || null;
