'use client';

import { RootState } from '@/app/store';

// Select dashboard stats
export const selectDashboardStats = (state: RootState) => state.dashboard.stats;

// Select recent activity
export const selectRecentActivity = (state: RootState) => state.dashboard.recentActivity;

// Select dashboard loading state
export const selectDashboardLoading = (state: RootState) => state.dashboard.loading;

// Select dashboard error
export const selectDashboardError = (state: RootState) => state.dashboard.error;

// Calculate campaign success rate
export const selectCampaignSuccessRate = (state: RootState) => {
  if (!state.dashboard.stats) return 0;
  const { totalCampaigns, activeCampaigns } = state.dashboard.stats;
  if (totalCampaigns === 0) return 0;
  return ((totalCampaigns - activeCampaigns) / totalCampaigns) * 100;
};

// Get average donation amount
export const selectAverageDonation = (state: RootState) => {
  if (!state.dashboard.stats) return 0;
  const { totalDonations, totalRaised } = state.dashboard.stats;
  if (totalDonations === 0) return 0;
  return totalRaised / totalDonations;
};

// Filter activity by type
export const selectActivityByType = (type: string) => (state: RootState) => {
  return state.dashboard.recentActivity.filter((activity) => activity.type === type);
};
