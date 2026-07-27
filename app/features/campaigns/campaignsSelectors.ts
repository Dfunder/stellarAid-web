'use client';

import { RootState } from '@/app/store';

// Select all campaigns
export const selectAllCampaigns = (state: RootState) => state.campaigns.items;

// Select current campaign
export const selectCurrentCampaign = (state: RootState) => state.campaigns.currentCampaign;

// Select campaigns loading state
export const selectCampaignsLoading = (state: RootState) => state.campaigns.loading;

// Select campaigns error
export const selectCampaignsError = (state: RootState) => state.campaigns.error;

// Select active campaigns (not ended)
export const selectActiveCampaigns = (state: RootState) => {
  const now = new Date().toISOString();
  return state.campaigns.items.filter((campaign) => campaign.endDate > now);
};

// Select campaigns by category
export const selectCampaignsByCategory = (category: string) => (state: RootState) => {
  return state.campaigns.items.filter((campaign) => campaign.category === category);
};

// Select campaigns by organizer ID
export const selectCampaignsByOrganizer = (organizerId: string) => (state: RootState) => {
  return state.campaigns.items.filter((campaign) => campaign.organizerId === organizerId);
};

// Calculate total raised across all campaigns
export const selectTotalRaised = (state: RootState) => {
  return state.campaigns.items.reduce((total, campaign) => total + campaign.raised, 0);
};

// Calculate total goal across all campaigns
export const selectTotalGoal = (state: RootState) => {
  return state.campaigns.items.reduce((total, campaign) => total + campaign.goal, 0);
};
