'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DashboardStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalDonations: number;
  totalRaised: number;
  totalUsers: number;
}

interface RecentActivity {
  id: string;
  type: 'donation' | 'campaign_created' | 'user_registered';
  description: string;
  timestamp: string;
}

interface DashboardState {
  stats: DashboardStats | null;
  recentActivity: RecentActivity[];
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: null,
  recentActivity: [],
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setStats: (state, action: PayloadAction<DashboardStats>) => {
      state.stats = action.payload;
    },
    setRecentActivity: (state, action: PayloadAction<RecentActivity[]>) => {
      state.recentActivity = action.payload;
    },
    addActivity: (state, action: PayloadAction<RecentActivity>) => {
      state.recentActivity.unshift(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setStats, setRecentActivity, addActivity, setLoading, setError } =
  dashboardSlice.actions;
export default dashboardSlice.reducer;
