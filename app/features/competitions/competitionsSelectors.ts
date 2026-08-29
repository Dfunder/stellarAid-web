'use client';

import { RootState } from '@/app/store';

export const selectCompetitions = (state: RootState) => state.competitions.items;
export const selectCurrentCompetition = (state: RootState) => state.competitions.currentCompetition;
export const selectCompetitionsLoading = (state: RootState) => state.competitions.loading;
export const selectCompetitionsError = (state: RootState) => state.competitions.error;
export const selectPrizeDistributions = (state: RootState) => state.competitions.prizeDistributions;

export const selectCompetitionsByStatus = (status: string) => (state: RootState) => {
  return state.competitions.items.filter((c: any) => c.status === status);
};

export const selectOpenCompetitions = (state: RootState) => {
  return state.competitions.items.filter((c: any) => c.status === 'open');
};

export const selectCompletedCompetitions = (state: RootState) => {
  return state.competitions.items.filter((c: any) => c.status === 'completed');
};

export const selectTotalPrizePool = (state: RootState) => {
  return state.competitions.items.reduce((sum: number, c: any) => sum + c.prizePool, 0);
};

export const selectPendingPrizeDistributions = (state: RootState) => {
  const pending: any[] = [];
  state.competitions.items.forEach((c: any) => {
    c.prizeTiers?.forEach((tier: any) => {
      if (tier.status === 'pending') {
        pending.push({ ...tier, competitionId: c.id, competitionTitle: c.title });
      }
    });
  });
  return pending;
};
