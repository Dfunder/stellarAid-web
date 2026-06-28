'use client';

import { createAsyncThunk } from '@reduxjs/toolkit';
import { setUser, clearUser, setLoading, setError } from './authSlice';

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

      if (!response.ok) throw new Error('Login failed');

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

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      await fetch('/api/auth/logout', { method: 'POST' });
      dispatch(clearUser());
      dispatch(setError(null));
    } catch (error: any) {
      dispatch(setError(error.message));
      throw error;
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
