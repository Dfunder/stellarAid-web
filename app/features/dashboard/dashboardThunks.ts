'use client';

import { createAsyncThunk } from '@reduxjs/toolkit';
import { setStats, setRecentActivity, setLoading, setError } from './dashboardSlice';

// Fetch dashboard statistics
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchDashboardStats',
  async (_, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await fetch('/api/dashboard/stats');

      if (!response.ok) throw new Error('Failed to fetch dashboard stats');

      const stats = await response.json();
      dispatch(setStats(stats));
      dispatch(setError(null));
      return stats;
    } catch (error: any) {
      dispatch(setError(error.message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Fetch recent activity
export const fetchRecentActivity = createAsyncThunk(
  'dashboard/fetchRecentActivity',
  async (limit: number = 10, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await fetch(`/api/dashboard/activity?limit=${limit}`);

      if (!response.ok) throw new Error('Failed to fetch recent activity');

      const activity = await response.json();
      dispatch(setRecentActivity(activity));
      dispatch(setError(null));
      return activity;
    } catch (error: any) {
      dispatch(setError(error.message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Refresh all dashboard data
export const refreshDashboard = createAsyncThunk(
  'dashboard/refreshDashboard',
  async (_, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      await Promise.all([dispatch(fetchDashboardStats()), dispatch(fetchRecentActivity(10))]);
    } catch (error: any) {
      dispatch(setError(error.message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);
