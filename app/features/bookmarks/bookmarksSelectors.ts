'use client';

import { RootState } from '@/app/store';

// Select all bookmarks
export const selectAllBookmarks = (state: RootState) => state.bookmarks.items;

// Select bookmarks loading state
export const selectBookmarksLoading = (state: RootState) => state.bookmarks.loading;

// Select bookmarks error
export const selectBookmarksError = (state: RootState) => state.bookmarks.error;

// Check if a campaign is bookmarked
export const isCampaignBookmarked = (campaignId: string) => (state: RootState) => {
  return state.bookmarks.items.some((bookmark) => bookmark.campaignId === campaignId);
};

// Get bookmark ID for a campaign if it exists
export const getBookmarkIdForCampaign = (campaignId: string) => (state: RootState) => {
  const bookmark = state.bookmarks.items.find((b) => b.campaignId === campaignId);
  return bookmark?.id || null;
};

// Get total bookmarks count
export const selectBookmarksCount = (state: RootState) => state.bookmarks.items.length;

// Get bookmark notes for a specific campaign
export const getBookmarkNotes = (campaignId: string) => (state: RootState) => {
  const bookmark = state.bookmarks.items.find((b) => b.campaignId === campaignId);
  return bookmark?.notes || '';
};

// Get recently added bookmarks
export const selectRecentBookmarks =
  (limit: number = 5) =>
  (state: RootState) => {
    return [...state.bookmarks.items]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  };
