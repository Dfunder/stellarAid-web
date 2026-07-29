'use client';

import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  setBookmarks,
  addBookmark,
  removeBookmark,
  updateBookmarkNotes,
  setLoading,
  setError,
} from './bookmarksSlice';

// Fetch user's bookmarks
export const fetchUserBookmarks = createAsyncThunk(
  'bookmarks/fetchUserBookmarks',
  async (userId: string, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await fetch(`/api/users/${userId}/bookmarks`);

      if (!response.ok) throw new Error('Failed to fetch bookmarks');

      const bookmarks = await response.json();
      dispatch(setBookmarks(bookmarks));
      dispatch(setError(null));
      return bookmarks;
    } catch (error: any) {
      dispatch(setError(error.message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Add a new bookmark
export const createBookmark = createAsyncThunk(
  'bookmarks/createBookmark',
  async (bookmarkData: { campaignId: string; userId: string; notes?: string }, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookmarkData),
      });

      if (!response.ok) throw new Error('Failed to create bookmark');

      const newBookmark = await response.json();
      dispatch(addBookmark(newBookmark));
      dispatch(setError(null));
      return newBookmark;
    } catch (error: any) {
      dispatch(setError(error.message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Delete a bookmark
export const deleteBookmark = createAsyncThunk(
  'bookmarks/deleteBookmark',
  async (id: string, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await fetch(`/api/bookmarks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete bookmark');

      dispatch(removeBookmark(id));
      dispatch(setError(null));
    } catch (error: any) {
      dispatch(setError(error.message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Update bookmark notes
export const updateNotes = createAsyncThunk(
  'bookmarks/updateNotes',
  async ({ id, notes }: { id: string; notes: string }, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await fetch(`/api/bookmarks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) throw new Error('Failed to update bookmark notes');

      dispatch(updateBookmarkNotes({ id, notes }));
      dispatch(setError(null));
    } catch (error: any) {
      dispatch(setError(error.message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);
