'use client';

import { configureStore } from '@reduxjs/toolkit';
import apiReducer from './slices/apiSlice';

export const store = configureStore({
  reducer: {
    api: apiReducer,
    // Add other reducers here as they are created
  },
  // Redux DevTools are automatically configured by RTK in development
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;