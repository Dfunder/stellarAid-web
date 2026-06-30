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