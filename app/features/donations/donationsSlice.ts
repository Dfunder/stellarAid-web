'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Donation {
  id: string;
  amount: number;
  campaignId: string;
  userId: string;
  anonymous: boolean;
  message?: string;
  createdAt: string;
  status: 'pending' | 'completed' | 'failed';
}

interface DonationsState {
  items: Donation[];
  userDonations: Donation[];
  campaignDonations: Donation[];
  loading: boolean;
  error: string | null;
}

const initialState: DonationsState = {
  items: [],
  userDonations: [],
  campaignDonations: [],
  loading: false,
  error: null,
};

const donationsSlice = createSlice({
  name: 'donations',
  initialState,
  reducers: {
    setDonations: (state, action: PayloadAction<Donation[]>) => {
      state.items = action.payload;
    },
    setUserDonations: (state, action: PayloadAction<Donation[]>) => {
      state.userDonations = action.payload;
    },
    setCampaignDonations: (state, action: PayloadAction<Donation[]>) => {
      state.campaignDonations = action.payload;
    },
    addDonation: (state, action: PayloadAction<Donation>) => {
      state.items.push(action.payload);
      state.userDonations.push(action.payload);
      state.campaignDonations.push(action.payload);
    },
    updateDonation: (state, action: PayloadAction<Donation>) => {
      const updateInList = (list: Donation[]) => {
        const index = list.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) list[index] = action.payload;
      };
      updateInList(state.items);
      updateInList(state.userDonations);
      updateInList(state.campaignDonations);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setDonations,
  setUserDonations,
  setCampaignDonations,
  addDonation,
  updateDonation,
  setLoading,
  setError,
} = donationsSlice.actions;
export default donationsSlice.reducer;
