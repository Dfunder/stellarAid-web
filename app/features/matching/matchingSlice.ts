'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface MatchBreakdown {
  skillMatch: number;
  portfolioRelevance: number;
  availability: number;
  rating: number;
  feedback: number;
}

export interface MatchResult {
  artistId: string;
  artistName: string;
  artistAvatar?: string;
  overallScore: number;
  breakdown: MatchBreakdown;
  reasons: string[];
  matchingSkillCount: number;
  isAvailable: boolean;
}

export interface MatchJob {
  id?: string;
  title: string;
  description: string;
  category: string;
  requiredSkills: string[];
  budget?: number;
  deadline?: string;
}

export interface MatchFeedback {
  jobId: string;
  artistId: string;
  signal: 'hired' | 'shortlisted' | 'dismissed' | 'rejected';
  timestamp: string;
}

interface MatchingState {
  /** Current job being matched against */
  currentJob: MatchJob | null;
  /** Current match results (ranked) */
  matches: MatchResult[];
  /** Feedback history for learning */
  feedbackHistory: MatchFeedback[];
  /** Whether matching is in progress */
  loading: boolean;
  /** Error message */
  error: string | null;
  /** Whether feedback was submitted successfully */
  feedbackSubmitted: boolean;
}

const initialState: MatchingState = {
  currentJob: null,
  matches: [],
  feedbackHistory: [],
  loading: false,
  error: null,
  feedbackSubmitted: false,
};

const matchingSlice = createSlice({
  name: 'matching',
  initialState,
  reducers: {
    setCurrentJob: (state, action: PayloadAction<MatchJob | null>) => {
      state.currentJob = action.payload;
    },
    setMatches: (state, action: PayloadAction<MatchResult[]>) => {
      state.matches = action.payload;
      state.error = null;
    },
    addMatch: (state, action: PayloadAction<MatchResult>) => {
      state.matches.push(action.payload);
    },
    updateMatchScore: (
      state,
      action: PayloadAction<{ artistId: string; overallScore: number }>,
    ) => {
      const match = state.matches.find((m) => m.artistId === action.payload.artistId);
      if (match) {
        match.overallScore = action.payload.overallScore;
      }
      // Re-sort after update
      state.matches.sort((a, b) => b.overallScore - a.overallScore);
    },
    removeMatch: (state, action: PayloadAction<string>) => {
      state.matches = state.matches.filter((m) => m.artistId !== action.payload);
    },
    addFeedback: (state, action: PayloadAction<MatchFeedback>) => {
      state.feedbackHistory.push(action.payload);
    },
    setFeedbackHistory: (state, action: PayloadAction<MatchFeedback[]>) => {
      state.feedbackHistory = action.payload;
    },
    setMatchingLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setMatchingError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setFeedbackSubmitted: (state, action: PayloadAction<boolean>) => {
      state.feedbackSubmitted = action.payload;
    },
    clearMatches: (state) => {
      state.matches = [];
      state.currentJob = null;
      state.error = null;
    },
    clearMatchingState: (state) => {
      state.currentJob = null;
      state.matches = [];
      state.feedbackHistory = [];
      state.loading = false;
      state.error = null;
      state.feedbackSubmitted = false;
    },
  },
});

export const {
  setCurrentJob,
  setMatches,
  addMatch,
  updateMatchScore,
  removeMatch,
  addFeedback,
  setFeedbackHistory,
  setMatchingLoading,
  setMatchingError,
  setFeedbackSubmitted,
  clearMatches,
  clearMatchingState,
} = matchingSlice.actions;

export default matchingSlice.reducer;
