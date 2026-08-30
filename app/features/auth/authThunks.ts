import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  setCredentials,
  clearCredentials,
  setAuthLoading,
  setAuthError,
  setPending2FA,
  setTwoFactorEnabled,
} from './authSlice';
import { apiClient } from '@/utils/apiClient';
import { registerSchema } from '@/lib/validations/auth';

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData: { fullName: string; email: string; password: string }, { dispatch }) => {
    dispatch(setAuthLoading(true));
    try {
      const validatedData = registerSchema.parse(userData);
      const response = await apiClient.post('/api/auth/register', validatedData);
      dispatch(setAuthLoading(false));
      return response.data;
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const message = error.errors[0].message;
        dispatch(setAuthError(message));
        throw error;
      }
      const message = error.response?.data?.message || 'Registration failed';
      dispatch(setAuthError(message));
      throw error;
    }
  }
);

import { loginSchema } from '@/lib/validations/auth';

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: { email: string; password: string }, { dispatch }) => {
    dispatch(setAuthLoading(true));
    try {
      const validatedCredentials = loginSchema.parse(credentials);
      const response = await apiClient.post('/api/auth/login', validatedCredentials);
      const { user, accessToken, refreshToken, requires2FA, tempToken } = response.data;
      localStorage.setItem('refreshToken', refreshToken);
      if (requires2FA && tempToken) {
        dispatch(setPending2FA({ pending: true, tempToken }));
        dispatch(setAuthLoading(false));
        dispatch(setAuthError(null));
        return { requires2FA: true, tempToken };
      }
      dispatch(setTwoFactorEnabled(response.data.twoFactorEnabled || false));
      dispatch(setCredentials({ user, token: accessToken }));
      dispatch(setAuthLoading(false));
      return response.data;
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const message = error.errors[0].message;
        dispatch(setAuthError(message));
        throw error;
      }
      const message = error.response?.data?.message || 'Login failed';
      dispatch(setAuthError(message));
      throw error;
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, { dispatch }) => {
  try {
    await apiClient.post('/api/auth/logout');
  } catch {
    // Proceed with local logout even if API call fails
  } finally {
    localStorage.removeItem('refreshToken');
    dispatch(clearCredentials());
  }
});

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token: string, { dispatch }) => {
    dispatch(setAuthLoading(true));
    try {
      const response = await apiClient.post('/api/auth/verify-email', { token });
      dispatch(setAuthLoading(false));
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Verification failed';
      dispatch(setAuthError(message));
      throw error;
    }
  }
);

export const resendVerificationEmail = createAsyncThunk(
  'auth/resendVerificationEmail',
  async (email: string, { dispatch }) => {
    dispatch(setAuthLoading(true));
    try {
      const response = await apiClient.post('/api/auth/resend-verification', { email });
      dispatch(setAuthLoading(false));
      return response.data;
    } catch (error: any) {
      dispatch(setAuthError(error.response?.data?.message || 'Failed to resend'));
      throw error;
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string, { dispatch }) => {
    dispatch(setAuthLoading(true));
    try {
      await apiClient.post('/api/auth/forgot-password', { email });
      dispatch(setAuthLoading(false));
      return { success: true };
    } catch {
      // Always show success to prevent email enumeration
      dispatch(setAuthLoading(false));
      return { success: true };
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }: { token: string; password: string }, { dispatch }) => {
    dispatch(setAuthLoading(true));
    try {
      const response = await apiClient.post('/api/auth/reset-password', { token, password });
      dispatch(setAuthLoading(false));
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Reset failed';
      dispatch(setAuthError(message));
      throw error;
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { dispatch }) => {
    dispatch(setAuthLoading(true));
    try {
      const response = await apiClient.get('/api/auth/me');
      const { user } = response.data;
      dispatch(setCredentials({ user, token: '' }));
      dispatch(setAuthLoading(false));
      return response.data;
    } catch (error: any) {
      dispatch(setAuthError(error.response?.data?.message || 'Failed to fetch user'));
      throw error;
    }
  }
);
