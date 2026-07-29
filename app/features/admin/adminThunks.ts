'use client';

import { createAsyncThunk } from '@reduxjs/toolkit';
import { setUsers, setSettings, updateUser, removeUser, setLoading, setError } from './adminSlice';

// Fetch all users (admin only)
export const fetchAllUsers = createAsyncThunk('admin/fetchAllUsers', async (_, { dispatch }) => {
  try {
    dispatch(setLoading(true));
    const response = await fetch('/api/admin/users');

    if (!response.ok) throw new Error('Failed to fetch users');

    const users = await response.json();
    dispatch(setUsers(users));
    dispatch(setError(null));
    return users;
  } catch (error: any) {
    dispatch(setError(error.message));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
});

// Update user role or status
export const updateUserDetails = createAsyncThunk(
  'admin/updateUserDetails',
  async ({ id, data }: { id: string; data: Partial<any> }, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update user');

      const updatedUser = await response.json();
      dispatch(updateUser(updatedUser));
      dispatch(setError(null));
      return updatedUser;
    } catch (error: any) {
      dispatch(setError(error.message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Delete a user
export const deleteUser = createAsyncThunk('admin/deleteUser', async (id: string, { dispatch }) => {
  try {
    dispatch(setLoading(true));
    const response = await fetch(`/api/admin/users/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error('Failed to delete user');

    dispatch(removeUser(id));
    dispatch(setError(null));
  } catch (error: any) {
    dispatch(setError(error.message));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
});

// Fetch admin settings
export const fetchAdminSettings = createAsyncThunk(
  'admin/fetchAdminSettings',
  async (_, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await fetch('/api/admin/settings');

      if (!response.ok) throw new Error('Failed to fetch settings');

      const settings = await response.json();
      dispatch(setSettings(settings));
      dispatch(setError(null));
      return settings;
    } catch (error: any) {
      dispatch(setError(error.message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Update admin settings
export const updateAdminSettings = createAsyncThunk(
  'admin/updateAdminSettings',
  async (settingsData: Partial<any>, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsData),
      });

      if (!response.ok) throw new Error('Failed to update settings');

      const updatedSettings = await response.json();
      dispatch(setSettings(updatedSettings));
      dispatch(setError(null));
      return updatedSettings;
    } catch (error: any) {
      dispatch(setError(error.message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);
