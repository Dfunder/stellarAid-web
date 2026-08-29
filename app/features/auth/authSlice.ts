'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  twoFactorEnabled: boolean;
  pending2FA: boolean;
  tempToken: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  twoFactorEnabled: false,
  pending2FA: false,
  tempToken: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.error = null;
      state.pending2FA = false;
      state.tempToken = null;
    },
    clearCredentials(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.twoFactorEnabled = false;
      state.pending2FA = false;
      state.tempToken = null;
    },
    setAuthLoading(state, action) {
      state.isLoading = action.payload;
    },
    setAuthError(state, action) {
      state.error = action.payload;
      state.isLoading = false;
    },
    setPending2FA(state, action: PayloadAction<{ pending: boolean; tempToken?: string }>) {
      state.pending2FA = action.payload.pending;
      if (action.payload.tempToken) {
        state.tempToken = action.payload.tempToken;
      }
    },
    setTwoFactorEnabled(state, action: PayloadAction<boolean>) {
      state.twoFactorEnabled = action.payload;
    },
    clearTempToken(state) {
      state.tempToken = null;
    },
  },
});

export const { setCredentials, clearCredentials, setAuthLoading, setAuthError, setPending2FA, setTwoFactorEnabled, clearTempToken } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectTwoFactorEnabled = (state: { auth: AuthState }) => state.auth.twoFactorEnabled;
export const selectPending2FA = (state: { auth: AuthState }) => state.auth.pending2FA;
export const selectAuthTempToken = (state: { auth: AuthState }) => state.auth.tempToken;
