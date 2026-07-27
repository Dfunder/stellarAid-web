'use client';

import { RootState } from '@/app/store';

// Select the current user
export const selectUser = (state: RootState) => state.auth.user;

// Check if user is authenticated
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;

// Check if auth is loading
export const selectAuthLoading = (state: RootState) => state.auth.loading;

// Get any auth errors
export const selectAuthError = (state: RootState) => state.auth.error;

// Get user ID if user exists
export const selectUserId = (state: RootState) => state.auth.user?.id || null;

// Get user role if user exists
export const selectUserRole = (state: RootState) => state.auth.user?.role || null;
