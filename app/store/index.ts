'use client';

import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';

export { rootReducer };

export const store = configureStore({
  reducer: rootReducer,
  // Redux DevTools are automatically configured by RTK in development
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;