'use client';

import { RootState } from '@/app/store';

export const selectTwoFactorEnabled = (state: RootState) => state.twoFactor.enabled;
export const selectTwoFactorPendingSetup = (state: RootState) => state.twoFactor.pendingSetup;
export const selectTwoFactorSecret = (state: RootState) => state.twoFactor.secret;
export const selectTwoFactorOtpAuthUrl = (state: RootState) => state.twoFactor.otpauthUrl;
export const selectTwoFactorQrCodeUrl = (state: RootState) => state.twoFactor.qrCodeUrl;
export const selectTwoFactorBackupCodes = (state: RootState) => state.twoFactor.backupCodes;
export const selectTwoFactorBackupCodesGenerated = (state: RootState) => state.twoFactor.backupCodesGenerated;
export const selectTwoFactorTempToken = (state: RootState) => state.twoFactor.tempToken;
export const selectTwoFactorLoading = (state: RootState) => state.twoFactor.loading;
export const selectTwoFactorError = (state: RootState) => state.twoFactor.error;
