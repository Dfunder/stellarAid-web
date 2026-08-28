'use client';

import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/app/services/api';
import type { Artist } from '@/app/features/artists/artistsSlice';
import type { Portfolio } from '@/app/features/portfolios/portfoliosSlice';
import type { Service } from '@/app/features/services/servicesSlice';
import {
  setCurrentJob,
  setMatches,
  setMatchingLoading,
  setMatchingError,
  addFeedback,
  setFeedbackHistory,
  setFeedbackSubmitted,
} from './matchingSlice';
import type { MatchJob, MatchResult } from './matchingSlice';
import {
  matchArtists,
  type MatchRequest,
  type MatchFeedback,
} from '@/lib/matching/talentMatching';

/**
 * Find recommended artists for a job using client-side matching.
 * Fetches all necessary data (artists, portfolios, services) and runs
 * the matching algorithm locally.
 */
export const findMatchesForJob = createAsyncThunk(
  'matching/findMatches',
  async (job: MatchJob, { dispatch }) => {
    try {
      dispatch(setMatchingLoading(true));
      dispatch(setCurrentJob(job));

      // Fetch all data needed for matching
      const [artistsRes, portfoliosRes, servicesRes] = await Promise.all([
        api.get('/artists'),
        api.get('/portfolios'),
        api.get('/services'),
      ]);

      const artists: Artist[] = artistsRes.data || [];
      const portfolios: Portfolio[] = portfoliosRes.data || [];
      const services: Service[] = servicesRes.data || [];

      // Run the matching algorithm
      const request: MatchRequest = {
        job: {
          title: job.title,
          description: job.description,
          category: job.category,
          requiredSkills: job.requiredSkills,
          budget: job.budget,
          deadline: job.deadline,
        },
        artists,
        portfolios,
        services,
      };

      const scores = matchArtists(request);

      // Transform to MatchResult[]
      const results: MatchResult[] = scores.map((s) => ({
        artistId: s.artist.id,
        artistName: s.artist.name,
        artistAvatar: s.artist.avatar,
        overallScore: s.overallScore,
        breakdown: s.breakdown,
        reasons: s.reasons,
        matchingSkillCount: s.matchingSkillCount,
        isAvailable: s.isAvailable,
      }));

      dispatch(setMatches(results));
      dispatch(setMatchingError(null));

      return results;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error.message || 'Failed to find matches';
      dispatch(setMatchingError(message));
      throw error;
    } finally {
      dispatch(setMatchingLoading(false));
    }
  },
);

/**
 * Find matches for a job using server-side API.
 */
export const findMatchesViaAPI = createAsyncThunk(
  'matching/findMatchesAPI',
  async (job: MatchJob, { dispatch }) => {
    try {
      dispatch(setMatchingLoading(true));
      dispatch(setCurrentJob(job));

      const { data } = await api.post('/matching/matches', {
        title: job.title,
        description: job.description,
        category: job.category,
        requiredSkills: job.requiredSkills,
        budget: job.budget,
        deadline: job.deadline,
      });

      const results: MatchResult[] = data;
      dispatch(setMatches(results));
      dispatch(setMatchingError(null));

      return results;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error.message || 'Failed to find matches via API';
      dispatch(setMatchingError(message));
      throw error;
    } finally {
      dispatch(setMatchingLoading(false));
    }
  },
);

/**
 * Submit feedback on a match recommendation.
 * This feeds into the learning algorithm for future match improvements.
 */
export const submitMatchFeedback = createAsyncThunk(
  'matching/submitFeedback',
  async (
    feedback: {
      jobId: string;
      artistId: string;
      signal: 'hired' | 'shortlisted' | 'dismissed' | 'rejected';
    },
    { dispatch },
  ) => {
    try {
      const feedbackPayload: MatchFeedback = {
        ...feedback,
        timestamp: new Date().toISOString(),
      };

      // Submit to API
      await api.post('/matching/feedback', feedback);

      // Update local state
      dispatch(addFeedback(feedbackPayload));
      dispatch(setFeedbackSubmitted(true));

      return feedbackPayload;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error.message || 'Failed to submit feedback';
      dispatch(setMatchingError(message));
      throw error;
    }
  },
);

/**
 * Fetch feedback history for the current user or job.
 */
export const fetchFeedbackHistory = createAsyncThunk(
  'matching/fetchFeedback',
  async (jobId: string | undefined, { dispatch }) => {
    try {
      dispatch(setMatchingLoading(true));

      const endpoint = jobId ? `/matching/feedback?jobId=${jobId}` : '/matching/feedback';
      const { data } = await api.get(endpoint);

      dispatch(setFeedbackHistory(data || []));
      dispatch(setMatchingError(null));

      return data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error.message || 'Failed to fetch feedback history';
      dispatch(setMatchingError(message));
      throw error;
    } finally {
      dispatch(setMatchingLoading(false));
    }
  },
);
