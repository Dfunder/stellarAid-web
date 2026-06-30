import { createAsyncThunk } from '@reduxjs/toolkit';
import { setCredentials, clearCredentials, setAuthLoading, setAuthError } from './authSlice';

// Async thunk for user registration
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { dispatch }) => {
    dispatch(setAuthLoading(true));
    try {
      // Replace with your actual API call
      const response = await new Promise((resolve) => setTimeout(() => resolve({ user: userData, token: 'fake-token' }), 1000));
      dispatch(setCredentials(response));
      return response;
    } catch (error) {
      dispatch(setAuthError(error.message));
      throw error;
    }
  }
);

// Async thunk for user login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { dispatch }) => {
    dispatch(setAuthLoading(true));
    try {
      // Replace with your actual API call
      const response = await new Promise((resolve) => setTimeout(() => resolve({ user: { email: credentials.email }, token: 'fake-token' }), 1000));
      dispatch(setCredentials(response));
      return response;
    } catch (error) {
      dispatch(setAuthError(error.message));
      throw error;
    }
  }
);

// Async thunk for user logout
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { dispatch }) => {
    try {
      // Replace with your actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(clearCredentials());
    } catch (error) {
      // Even if logout fails, clear credentials from the client
      dispatch(clearCredentials());
    }
  }
);

// Async thunk for email verification
export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token, { dispatch }) => {
    dispatch(setAuthLoading(true));
    try {
      // Replace with your actual API call
      const response = await new Promise((resolve) => setTimeout(() => resolve({ message: 'Email verified successfully' }), 1000));
      dispatch(setAuthLoading(false));
      return response;
    } catch (error) {
      dispatch(setAuthError(error.message));
      throw error;
    }
  }
);

// Async thunk for forgot password
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { dispatch }) => {
    dispatch(setAuthLoading(true));
    try {
      // Replace with your actual API call
      const response = await new Promise((resolve) => setTimeout(() => resolve({ message: 'Password reset link sent' }), 1000));
      dispatch(setAuthLoading(false));
      return response;
    } catch (error) {
      dispatch(setAuthError(error.message));
      throw error;
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token: string, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw Object.assign(new Error('Email verification failed'), { code: data?.code, response: { data } });
      }

      dispatch(setError(null));
      return true;
    } catch (error: any) {
      dispatch(setError(getErrorMessage(error)));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const resendVerificationEmail = createAsyncThunk(
  'auth/resendVerificationEmail',
  async (email: string, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw Object.assign(new Error('Failed to resend verification email'), { code: data?.code, response: { data } });
      }

      dispatch(setError(null));
      return true;
    } catch (error: any) {
      dispatch(setError(getErrorMessage(error)));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);
// Async thunk for reset password
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { dispatch }) => {
    dispatch(setAuthLoading(true));
    try {
      // Replace with your actual API call
      const response = await new Promise((resolve) => setTimeout(() => resolve({ message: 'Password reset successfully' }), 1000));
      dispatch(setAuthLoading(false));
      return response;
    } catch (error) {
      dispatch(setAuthError(error.message));
      throw error;
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
