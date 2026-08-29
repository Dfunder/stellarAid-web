'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TwoFactorState {
  enabled: boolean;
  pendingSetup: boolean;
  secret: string | null;
  otpauthUrl: string | null;
  qrCodeUrl: string | null;
  backupCodes: string[];
  backupCodesGenerated: boolean;
  tempToken: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: TwoFactorState = {
  enabled: false,
  pendingSetup: false,
  secret: null,
  otpauthUrl: null,
  qrCodeUrl: null,
  backupCodes: [],
  backupCodesGenerated: false,
  tempToken: null,
  loading: false,
  error: null,
};

const twoFactorSlice = createSlice({
  name: 'twoFactor',
  initialState,
  reducers: {
    setTwoFactorLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setTwoFactorError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.loading = false;
    },
    clearTwoFactorError(state) {
      state.error = null;
    },
    startSetup(state, action: PayloadAction<{ secret: string; otpauthUrl: string; qrCodeUrl?: string; backupCodes: string[] }>) {
      state.pendingSetup = true;
      state.secret = action.payload.secret;
      state.otpauthUrl = action.payload.otpauthUrl;
      state.qrCodeUrl = action.payload.qrCodeUrl || null;
      state.backupCodes = action.payload.backupCodes;
      state.backupCodesGenerated = true;
      state.error = null;
      state.loading = false;
    },
    completeSetup(state) {
      state.pendingSetup = false;
      state.enabled = true;
      state.secret = null;
      state.otpauthUrl = null;
      state.qrCodeUrl = null;
      state.loading = false;
    },
    cancelSetup(state) {
      state.pendingSetup = false;
      state.secret = null;
      state.otpauthUrl = null;
      state.qrCodeUrl = null;
      state.backupCodes = [];
      state.backupCodesGenerated = false;
      state.loading = false;
    },
    disableTwoFactor(state) {
      state.enabled = false;
      state.pendingSetup = false;
      state.secret = null;
      state.otpauthUrl = null;
      state.qrCodeUrl = null;
      state.backupCodes = [];
      state.backupCodesGenerated = false;
      state.error = null;
      state.loading = false;
    },
    setTempToken(state, action: PayloadAction<string>) {
      state.tempToken = action.payload;
    },
    clearTempToken(state) {
      state.tempToken = null;
    },
    regenerateBackupCodes(state, action: PayloadAction<string[]>) {
      state.backupCodes = action.payload;
      state.backupCodesGenerated = true;
    },
  },
});

export const {
  setTwoFactorLoading,
  setTwoFactorError,
  clearTwoFactorError,
  startSetup,
  completeSetup,
  cancelSetup,
  disableTwoFactor,
  setTempToken,
  clearTempToken,
  regenerateBackupCodes,
} = twoFactorSlice.actions;

export default twoFactorSlice.reducer;
