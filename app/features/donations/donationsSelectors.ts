'use client';

import { RootState } from '@/app/store';

// Select all donations
export const selectAllDonations = (state: RootState) => state.donations.items;

// Select user's donations
export const selectUserDonations = (state: RootState) => state.donations.userDonations;

// Select campaign donations
export const selectCampaignDonations = (state: RootState) => state.donations.campaignDonations;

// Select donations loading state
export const selectDonationsLoading = (state: RootState) => state.donations.loading;

// Select donations error
export const selectDonationsError = (state: RootState) => state.donations.error;

// Calculate total donated by current user
export const selectUserTotalDonated = (state: RootState) => {
  return state.donations.userDonations
    .filter((donation) => donation.status === 'completed')
    .reduce((total, donation) => total + donation.amount, 0);
};

// Calculate total raised for a campaign
export const selectCampaignTotalRaised = (state: RootState) => {
  return state.donations.campaignDonations
    .filter((donation) => donation.status === 'completed')
    .reduce((total, donation) => total + donation.amount, 0);
};

// Calculate total donations across all campaigns
export const selectOverallTotalDonated = (state: RootState) => {
  return state.donations.items
    .filter((donation) => donation.status === 'completed')
    .reduce((total, donation) => total + donation.amount, 0);
};

// Get recent donations
export const selectRecentDonations =
  (limit: number = 5) =>
  (state: RootState) => {
    return [...state.donations.items]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  };

// Select only successful donations
export const selectSuccessfulDonations = (state: RootState) => {
  return state.donations.items.filter((donation) => donation.status === 'completed');
};
