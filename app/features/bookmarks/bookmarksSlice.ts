'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Bookmark {
  id: string;
  campaignId: string;
  userId: string;
  notes?: string;
  createdAt: string;
}

interface BookmarksState {
  items: Bookmark[];
  loading: boolean;
  error: string | null;
}

const initialState: BookmarksState = {
  items: [],
  loading: false,
  error: null,
};

const bookmarksSlice = createSlice({
  name: 'bookmarks',
  initialState,
  reducers: {
    setBookmarks: (state, action: PayloadAction<Bookmark[]>) => {
      state.items = action.payload;
    },
    addBookmark: (state, action: PayloadAction<Bookmark>) => {
      state.items.push(action.payload);
    },
    removeBookmark: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((bookmark) => bookmark.id !== action.payload);
    },
    updateBookmarkNotes: (state, action: PayloadAction<{ id: string; notes: string }>) => {
      const bookmark = state.items.find((b) => b.id === action.payload.id);
      if (bookmark) {
        bookmark.notes = action.payload.notes;
      }
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
  setBookmarks,
  addBookmark,
  removeBookmark,
  updateBookmarkNotes,
  setLoading,
  setError,
} = bookmarksSlice.actions;
export default bookmarksSlice.reducer;
