import { createAsyncThunk } from '@reduxjs/toolkit';
import { setCredentials, clearCredentials, setAuthLoading, setAuthError } from './authSlice';
import { apiClient } from '@/utils/apiClient';

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData: { fullName: string; email: string; password: string }, { dispatch }) => {
    dispatch(setAuthLoading(true));
    try {
      const response = await apiClient.post('/api/auth/register', userData);
      dispatch(setAuthLoading(false));
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch(setAuthError(message));
      throw error;
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: { email: string; password: string }, { dispatch }) => {
    dispatch(setAuthLoading(true));
    try {
      const response = await apiClient.post('/api/auth/login', credentials);
      const { user, accessToken, refreshToken } = response.data;
      localStorage.setItem('refreshToken', refreshToken);
      dispatch(setCredentials({ user, token: accessToken }));
      return response.data;
    } catch (error: any) {
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
      dispatch(
        setCredentials({ user: response.data, token: localStorage.getItem('accessToken') || '' })
      );
      return response.data;
    } catch (error: any) {
      dispatch(setAuthError(error.response?.data?.message || 'Failed to fetch user'));
      throw error;
    }
  }
);
