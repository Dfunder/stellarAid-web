'use client';

import { createAsyncThunk } from '@reduxjs/toolkit';
import { setUser, clearUser, setLoading, setError } from './authSlice';

const ERROR_MESSAGES: Record<string, string> = {
  EMAIL_NOT_VERIFIED: 'Please verify your email before logging in.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  ACCOUNT_DISABLED: 'Your account has been disabled. Please contact support.',
  TOO_MANY_REQUESTS: 'Too many login attempts. Please try again later.',
};

function getErrorMessage(error: any): string {
  const code = error?.code || error?.response?.data?.code;
  if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
  return error?.response?.data?.message || error.message || 'An unexpected error occurred.';
}

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: { email: string; password: string }, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw Object.assign(new Error('Login failed'), { code: data?.code, response: { data } });
      }

      const user = await response.json();
      dispatch(setUser(user));
      dispatch(setError(null));
      return user;
    } catch (error: any) {
      dispatch(setError(getErrorMessage(error)));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      await fetch('/api/auth/logout', { method: 'POST' });
      dispatch(clearUser());
      dispatch(setError(null));
    } catch {
      dispatch(clearUser());
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const user = await response.json();
        dispatch(setUser(user));
        return user;
      } else {
        dispatch(clearUser());
        return null;
      }
    } catch {
      dispatch(clearUser());
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await fetch('/api/users/me');
      if (!response.ok) throw new Error('Failed to fetch user profile');
      const user = await response.json();
      dispatch(setUser(user));
      dispatch(setError(null));
      return user;
    } catch (error: any) {
      dispatch(setError(error.message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      // Always show success message regardless of whether email exists
      dispatch(setError(null));
      return { success: true };
    } catch (error: any) {
      // Still show success message to prevent email enumeration
      dispatch(setError(null));
      return { success: true };
    } finally {
      dispatch(setLoading(false));
    }
  }
);
