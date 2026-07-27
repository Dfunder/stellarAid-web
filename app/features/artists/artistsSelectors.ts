'use client';

import { RootState } from '@/app/store';

export const selectCurrentArtist = (state: RootState) => state.artists.currentArtist;
export const selectArtistsLoading = (state: RootState) => state.artists.loading;
export const selectArtistsError = (state: RootState) => state.artists.error;
