'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'moderator';
  createdAt: string;
  isActive: boolean;
}

interface AdminSettings {
  siteName: string;
  maintenanceMode: boolean;
  allowRegistrations: boolean;
}

interface AdminState {
  users: User[];
  settings: AdminSettings | null;
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  users: [],
  settings: null,
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    setSettings: (state, action: PayloadAction<AdminSettings>) => {
      state.settings = action.payload;
    },
    updateUser: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex((user) => user.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    removeUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter((user) => user.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setUsers, setSettings, updateUser, removeUser, setLoading, setError } =
  adminSlice.actions;
export default adminSlice.reducer;
