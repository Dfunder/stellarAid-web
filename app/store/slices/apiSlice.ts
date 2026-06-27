'use client';

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { toastSuccess, toastError, toastLoading, toastDismiss } from '@/utils/toast';

interface ApiState {
  loading: boolean;
  error: string | null;
  data: any | null;
}

const initialState: ApiState = {
  loading: false,
  error: null,
  data: null,
};

// Async thunk for fetching data - demonstrates toast integration in async operations
export const fetchData = createAsyncThunk(
  'api/fetchData',
  async (url: string, { rejectWithValue }) => {
    const loadingToastId = toastLoading('Fetching data from API...');
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      toastDismiss(loadingToastId);
      toastSuccess('Data fetched successfully!');
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toastDismiss(loadingToastId);
      toastError(`Failed to fetch data: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

const apiSlice = createSlice({
  name: 'api',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearData: (state) => {
      state.data = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchData.fulfilled, (state, action: PayloadAction<unknown>) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.data = null;
      });
  },
});

export const { clearError, clearData } = apiSlice.actions;
export default apiSlice.reducer;