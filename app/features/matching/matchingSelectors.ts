'use client';

import { RootState } from '@/app/store';

export const selectCurrentJob = (state: RootState) => state.matching.currentJob;
export const selectMatches = (state: RootState) => state.matching.matches;
export const selectMatchingLoading = (state: RootState) => state.matching.loading;
export const selectMatchingError = (state: RootState) => state.matching.error;
export const selectFeedbackHistory = (state: RootState) => state.matching.feedbackHistory;
export const selectFeedbackSubmitted = (state: RootState) => state.matching.feedbackSubmitted;

/** Top N matches (default 5) */
export const selectTopMatches = (limit: number = 5) => (state: RootState) =>
  state.matching.matches.slice(0, limit);

/** Only available artists from matches */
export const selectAvailableMatches = (state: RootState) =>
  state.matching.matches.filter((m) => m.isAvailable);

/** Matches with skill match score above a threshold */
export const selectHighSkillMatches = (threshold: number = 50) => (state: RootState) =>
  state.matching.matches.filter((m) => m.breakdown.skillMatch >= threshold);

/** Get a specific artist's match score */
export const selectArtistMatch = (artistId: string) => (state: RootState) =>
  state.matching.matches.find((m) => m.artistId === artistId);

/** Count of matches returned */
export const selectMatchCount = (state: RootState) => state.matching.matches.length;

/** Check if there are any matches */
export const selectHasMatches = (state: RootState) => state.matching.matches.length > 0;
