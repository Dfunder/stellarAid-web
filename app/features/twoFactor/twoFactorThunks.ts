'use client';

import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  setTwoFactorLoading,
  setTwoFactorError,
  clearTwoFactorError,
  startSetup,
  completeSetup,
  cancelSetup,
  disableTwoFactor,
  setTempToken,
  clearTempToken,
  regenerateBackupCodes,
} from './twoFactorSlice';
import {
  enableTwoFactor,
  verifyTwoFactorSetup,
  disableTwoFactor as disableTwoFactorApi,
  getTwoFactorStatus,
  verifyTwoFactorCode,
  regenerateBackupCodes as regenerateBackupCodesApi,
  adminDisableTwoFactor,
} from '@/lib/api/twoFactor';

export const setupTwoFactor = createAsyncThunk(
  'twoFactor/setupTwoFactor',
  async (_, { dispatch }) => {
    dispatch(setTwoFactorLoading(true));
    dispatch(clearTwoFactorError());
    try {
      const response = await enableTwoFactor();
      dispatch(startSetup(response));
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to enable 2FA';
      dispatch(setTwoFactorError(message));
      throw error;
    }
  }
);

export const confirmTwoFactorSetup = createAsyncThunk(
  'twoFactor/confirmTwoFactorSetup',
  async (code: string, { dispatch }) => {
    dispatch(setTwoFactorLoading(true));
    dispatch(clearTwoFactorError());
    try {
      await verifyTwoFactorSetup({ code });
      dispatch(completeSetup());
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Invalid verification code';
      dispatch(setTwoFactorError(message));
      throw error;
    }
  }
);

export const cancelTwoFactorSetup = createAsyncThunk(
  'twoFactor/cancelTwoFactorSetup',
  async (_, { dispatch }) => {
    dispatch(cancelSetup());
  }
);

export const disableUserTwoFactor = createAsyncThunk(
  'twoFactor/disableUserTwoFactor',
  async (data: { password: string; code?: string }, { dispatch }) => {
    dispatch(setTwoFactorLoading(true));
    dispatch(clearTwoFactorError());
    try {
      await disableTwoFactorApi(data);
      dispatch(disableTwoFactor());
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to disable 2FA';
      dispatch(setTwoFactorError(message));
      throw error;
    }
  }
);

export const fetchTwoFactorStatus = createAsyncThunk(
  'twoFactor/fetchTwoFactorStatus',
  async (_, { dispatch }) => {
    try {
      const response = await getTwoFactorStatus();
      if (response.enabled) {
        dispatch({ type: 'twoFactor/setEnabled', payload: response.enabled });
        dispatch({ type: 'twoFactor/setBackupCodesGenerated', payload: response.backupCodesGenerated });
      }
      return response;
    } catch {
      return null;
    }
  }
);

export const verifyLoginTwoFactor = createAsyncThunk(
  'twoFactor/verifyLoginTwoFactor',
  async ({ code, tempToken }: { code: string; tempToken: string }, { dispatch }) => {
    dispatch(setTwoFactorLoading(true));
    dispatch(clearTwoFactorError());
    try {
      const response = await verifyTwoFactorCode({ code, tempToken });
      dispatch(clearTempToken());
      dispatch(setTwoFactorLoading(false));
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Invalid 2FA code';
      dispatch(setTwoFactorError(message));
      throw error;
    }
  }
);

export const handleTwoFactorRegenerateBackupCodes = createAsyncThunk(
  'twoFactor/handleTwoFactorRegenerateBackupCodes',
  async (_, { dispatch }) => {
    dispatch(setTwoFactorLoading(true));
    dispatch(clearTwoFactorError());
    try {
      const response = await regenerateBackupCodesApi();
      dispatch(regenerateBackupCodes(response.backupCodes));
      dispatch(setTwoFactorLoading(false));
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to regenerate backup codes';
      dispatch(setTwoFactorError(message));
      throw error;
    }
  }
);

export const adminDisableUserTwoFactor = createAsyncThunk(
  'twoFactor/adminDisableUserTwoFactor',
  async (userId: string, { dispatch }) => {
    dispatch(setTwoFactorLoading(true));
    dispatch(clearTwoFactorError());
    try {
      await adminDisableTwoFactor(userId);
      dispatch(disableTwoFactor());
      dispatch(setTwoFactorLoading(false));
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to disable 2FA';
      dispatch(setTwoFactorError(message));
      throw error;
    }
  }
);
