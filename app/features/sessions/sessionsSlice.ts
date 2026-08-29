'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SessionData {
  id: string;
  device: string;
  browser?: string;
  os?: string;
  ipAddress: string;
  location?: string;
  lastActive: string;
  createdAt: string;
  isCurrent: boolean;
}

export interface SessionSettingsData {
  timeoutMinutes: number;
  extendOnActivity: boolean;
  warningMinutes: number;
}

export interface SessionWarning {
  show: boolean;
  timeRemaining: number;
}

interface SessionsState {
  activeSessions: SessionData[];
  sessionSettings: SessionSettingsData;
  sessionHistory: SessionData[];
  warning: SessionWarning | null;
  loading: boolean;
  error: string | null;
}

const initialState: SessionsState = {
  activeSessions: [],
  sessionSettings: {
    timeoutMinutes: 30,
    extendOnActivity: true,
    warningMinutes: 5,
  },
  sessionHistory: [],
  warning: null,
  loading: false,
  error: null,
};

const sessionsSlice = createSlice({
  name: 'sessions',
  initialState,
  reducers: {
    setSessionsLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setSessionsError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.loading = false;
    },
    clearSessionsError(state) {
      state.error = null;
    },
    setActiveSessions(state, action: PayloadAction<SessionData[]>) {
      state.activeSessions = action.payload;
    },
    removeSession(state, action: PayloadAction<string>) {
      state.activeSessions = state.activeSessions.filter((s) => s.id !== action.payload);
    },
    clearAllSessions(state) {
      state.activeSessions = state.activeSessions.filter((s) => s.isCurrent);
    },
    setSessionSettings(state, action: PayloadAction<Partial<SessionSettingsData>>) {
      state.sessionSettings = { ...state.sessionSettings, ...action.payload };
    },
    setSessionHistory(state, action: PayloadAction<SessionData[]>) {
      state.sessionHistory = action.payload;
    },
    setSessionWarning(state, action: PayloadAction<SessionWarning | null>) {
      state.warning = action.payload;
    },
    dismissWarning(state) {
      state.warning = null;
    },
  },
});

export const {
  setSessionsLoading,
  setSessionsError,
  clearSessionsError,
  setActiveSessions,
  removeSession,
  clearAllSessions,
  setSessionSettings,
  setSessionHistory,
  setSessionWarning,
  dismissWarning,
} = sessionsSlice.actions;

export default sessionsSlice.reducer;
