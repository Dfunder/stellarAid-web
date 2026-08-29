'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PrizeTier {
  id: string;
  rank: number;
  label: string;
  amount: number;
  asset: 'XLM' | 'USDC';
  winnerId?: string;
  winnerName?: string;
  status: 'pending' | 'processing' | 'distributed' | 'failed';
  txHash?: string;
  distributedAt?: string;
}

export interface Competition {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'draft' | 'open' | 'judging' | 'completed' | 'cancelled';
  prizePool: number;
  prizeAsset: 'XLM' | 'USDC';
  prizeTiers: PrizeTier[];
  entryFee: number;
  maxParticipants: number;
  participantsCount: number;
  startDate: string;
  endDate: string;
  judgingEndDate?: string;
  winnerIds?: string[];
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PrizeDistributionPayload {
  competitionId: string;
  prizeTierId: string;
  winnerPublicKey: string;
}

interface CompetitionsState {
  items: Competition[];
  currentCompetition: Competition | null;
  prizeDistributions: Record<string, PrizeDistributionPayload[]>;
  loading: boolean;
  error: string | null;
}

const initialState: CompetitionsState = {
  items: [],
  currentCompetition: null,
  prizeDistributions: {},
  loading: false,
  error: null,
};

const competitionsSlice = createSlice({
  name: 'competitions',
  initialState,
  reducers: {
    setCompetitions: (state, action: PayloadAction<Competition[]>) => {
      state.items = action.payload;
      state.error = null;
    },
    addCompetition: (state, action: PayloadAction<Competition>) => {
      state.items.unshift(action.payload);
    },
    updateCompetitionInList: (state, action: PayloadAction<Competition>) => {
      const index = state.items.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      if (state.currentCompetition?.id === action.payload.id) {
        state.currentCompetition = action.payload;
      }
    },
    removeCompetition: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((c) => c.id !== action.payload);
      if (state.currentCompetition?.id === action.payload) {
        state.currentCompetition = null;
      }
    },
    setCurrentCompetition: (state, action: PayloadAction<Competition | null>) => {
      state.currentCompetition = action.payload;
    },
    updatePrizeTier: (state, action: PayloadAction<{ competitionId: string; tier: PrizeTier }>) => {
      const { competitionId, tier } = action.payload;
      const competition = state.items.find((c) => c.id === competitionId);
      if (competition) {
        const index = competition.prizeTiers.findIndex((t) => t.id === tier.id);
        if (index !== -1) {
          competition.prizeTiers[index] = tier;
        }
      }
      if (state.currentCompetition?.id === competitionId) {
        const index = state.currentCompetition.prizeTiers.findIndex((t) => t.id === tier.id);
        if (index !== -1) {
          state.currentCompetition.prizeTiers[index] = tier;
        }
      }
    },
    setPrizeDistributions: (state, action: PayloadAction<{ competitionId: string; distributions: PrizeDistributionPayload[] }>) => {
      state.prizeDistributions[action.payload.competitionId] = action.payload.distributions;
    },
    clearCompetitions: () => initialState,
    setCompetitionsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setCompetitionsError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setCompetitions,
  addCompetition,
  updateCompetitionInList,
  removeCompetition,
  setCurrentCompetition,
  updatePrizeTier,
  setPrizeDistributions,
  clearCompetitions,
  setCompetitionsLoading,
  setCompetitionsError,
} = competitionsSlice.actions;

export default competitionsSlice.reducer;
