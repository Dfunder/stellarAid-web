'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ErrorState {
  globalError: string | null;
  apiErrors: Record<string, string | null>;
}

const initialState: ErrorState = {
  globalError: null,
  apiErrors: {},
};

const errorSlice = createSlice({
  name: 'errors',
  initialState,
  reducers: {
    setGlobalError: (state, action: PayloadAction<string | null>) => {
      state.globalError = action.payload;
    },
    setApiError: (state, action: PayloadAction<{ key: string; message: string | null }>) => {
      state.apiErrors[action.payload.key] = action.payload.message;
    },
    clearApiError: (state, action: PayloadAction<string>) => {
      delete state.apiErrors[action.payload];
    },
    clearAllApiErrors: (state) => {
      state.apiErrors = {};
    },
    clearAllErrors: (state) => {
      state.globalError = null;
      state.apiErrors = {};
    },
  },
});

export const { setGlobalError, setApiError, clearApiError, clearAllApiErrors, clearAllErrors } = errorSlice.actions;
export default errorSlice.reducer;