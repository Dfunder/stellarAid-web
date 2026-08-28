'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import {
  selectCurrentJob,
  selectMatches,
  selectMatchingLoading,
  selectMatchingError,
  selectFeedbackHistory,
  selectFeedbackSubmitted,
  selectTopMatches,
  selectAvailableMatches,
  selectMatchCount,
  selectHasMatches,
  selectArtistMatch,
} from '@/app/features/matching/matchingSelectors';
import {
  findMatchesForJob,
  findMatchesViaAPI,
  submitMatchFeedback,
  fetchFeedbackHistory,
} from '@/app/features/matching/matchingThunks';
import { clearMatches, clearMatchingState, setFeedbackSubmitted } from '@/app/features/matching/matchingSlice';
import type { MatchJob } from '@/app/features/matching/matchingSlice';

export function useTalentMatching() {
  const dispatch = useAppDispatch();

  const currentJob = useAppSelector(selectCurrentJob);
  const matches = useAppSelector(selectMatches);
  const loading = useAppSelector(selectMatchingLoading);
  const error = useAppSelector(selectMatchingError);
  const feedbackHistory = useAppSelector(selectFeedbackHistory);
  const feedbackSubmitted = useAppSelector(selectFeedbackSubmitted);
  const matchCount = useAppSelector(selectMatchCount);
  const hasMatches = useAppSelector(selectHasMatches);

  const findMatches = useCallback(
    async (job: MatchJob) => {
      try {
        return await dispatch(findMatchesForJob(job)).unwrap();
      } catch {
        // Fallback to API-based matching
        try {
          return await dispatch(findMatchesViaAPI(job)).unwrap();
        } catch (apiError) {
          throw apiError;
        }
      }
    },
    [dispatch],
  );

  const getTopMatches = useCallback(
    (limit: number = 5) => {
      return matches.slice(0, limit);
    },
    [matches],
  );

  const getAvailableMatches = useCallback(() => {
    return matches.filter((m) => m.isAvailable);
  }, [matches]);

  const getArtistMatchScore = useCallback(
    (artistId: string) => {
      return matches.find((m) => m.artistId === artistId) || null;
    },
    [matches],
  );

  const submitFeedback = useCallback(
    async (
      artistId: string,
      signal: 'hired' | 'shortlisted' | 'dismissed' | 'rejected',
    ) => {
      if (!currentJob?.id) {
        throw new Error('No current job to submit feedback for');
      }
      try {
        return await dispatch(
          submitMatchFeedback({
            jobId: currentJob.id,
            artistId,
            signal,
          }),
        ).unwrap();
      } finally {
        // Reset the submitted flag after a short delay
        setTimeout(() => {
          dispatch(setFeedbackSubmitted(false));
        }, 2000);
      }
    },
    [dispatch, currentJob],
  );

  const loadFeedbackHistory = useCallback(
    async (jobId?: string) => {
      return dispatch(fetchFeedbackHistory(jobId)).unwrap();
    },
    [dispatch],
  );

  const clearMatchResults = useCallback(() => {
    dispatch(clearMatches());
  }, [dispatch]);

  const resetMatching = useCallback(() => {
    dispatch(clearMatchingState());
  }, [dispatch]);

  return {
    // State
    currentJob,
    matches,
    loading,
    error,
    feedbackHistory,
    feedbackSubmitted,
    matchCount,
    hasMatches,

    // Actions
    findMatches,
    findMatchesViaAPI,
    getTopMatches,
    getAvailableMatches,
    getArtistMatchScore,
    submitFeedback,
    loadFeedbackHistory,
    clearMatchResults,
    resetMatching,
  };
}

/**
 * Lightweight hook for getting a single artist's match score.
 * Useful in artist list components that need to show relevance.
 */
export function useArtistMatchScore(artistId: string) {
  const match = useAppSelector(selectArtistMatch(artistId));
  return match;
}
