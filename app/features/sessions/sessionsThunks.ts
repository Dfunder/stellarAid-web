'use client';

import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  setSessionsLoading,
  setSessionsError,
  clearSessionsError,
  setActiveSessions,
  removeSession,
  clearAllSessions,
  setSessionSettings,
  setSessionHistory,
} from './sessionsSlice';
import {
  getActiveSessions,
  revokeSession as revokeSessionApi,
  revokeAllSessions as revokeAllSessionsApi,
  getSessionSettings as getSessionSettingsApi,
  updateSessionSettings as updateSessionSettingsApi,
  getSessionHistory as getSessionHistoryApi,
} from '@/lib/api/sessions';

export const fetchActiveSessions = createAsyncThunk(
  'sessions/fetchActiveSessions',
  async (_, { dispatch }) => {
    dispatch(setSessionsLoading(true));
    dispatch(clearSessionsError());
    try {
      const response = await getActiveSessions();
      dispatch(setActiveSessions(response.sessions));
      dispatch(setSessionsLoading(false));
      return response.sessions;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch sessions';
      dispatch(setSessionsError(message));
      throw error;
    }
  }
);

export const revokeUserSession = createAsyncThunk(
  'sessions/revokeUserSession',
  async (sessionId: string, { dispatch }) => {
    dispatch(setSessionsLoading(true));
    dispatch(clearSessionsError());
    try {
      await revokeSessionApi(sessionId);
      dispatch(removeSession(sessionId));
      dispatch(setSessionsLoading(false));
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to revoke session';
      dispatch(setSessionsError(message));
      throw error;
    }
  }
);

export const revokeAllUserSessions = createAsyncThunk(
  'sessions/revokeAllUserSessions',
  async (_, { dispatch }) => {
    dispatch(setSessionsLoading(true));
    dispatch(clearSessionsError());
    try {
      await revokeAllSessionsApi();
      dispatch(clearAllSessions());
      dispatch(setSessionsLoading(false));
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to revoke all sessions';
      dispatch(setSessionsError(message));
      throw error;
    }
  }
);

export const fetchSessionSettings = createAsyncThunk(
  'sessions/fetchSessionSettings',
  async (_, { dispatch }) => {
    try {
      const response = await getSessionSettingsApi();
      dispatch(setSessionSettings(response));
      return response;
    } catch {
      return null;
    }
  }
);

export const updateUserSessionSettings = createAsyncThunk(
  'sessions/updateUserSessionSettings',
  async (settings: { timeoutMinutes?: number; warningMinutes?: number }, { dispatch }) => {
    dispatch(setSessionsLoading(true));
    dispatch(clearSessionsError());
    try {
      const response = await updateSessionSettingsApi(settings);
      dispatch(setSessionSettings(response));
      dispatch(setSessionsLoading(false));
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update settings';
      dispatch(setSessionsError(message));
      throw error;
    }
  }
);

export const fetchSessionHistory = createAsyncThunk(
  'sessions/fetchSessionHistory',
  async (_, { dispatch }) => {
    dispatch(setSessionsLoading(true));
    dispatch(clearSessionsError());
    try {
      const response = await getSessionHistoryApi();
      dispatch(setSessionHistory(response.history));
      dispatch(setSessionsLoading(false));
      return response.history;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch session history';
      dispatch(setSessionsError(message));
      throw error;
    }
  }
);
