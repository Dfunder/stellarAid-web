import { apiClient } from '@/utils/apiClient';

export interface TwoFactorSetup {
  secret: string;
  otpauthUrl: string;
  qrCodeUrl?: string;
  backupCodes: string[];
}

export interface TwoFactorStatus {
  enabled: boolean;
  backupCodesGenerated: boolean;
  lastUsed?: string;
}

export function enableTwoFactor() {
  return apiClient.post<TwoFactorSetup>('/api/auth/2fa/enable').then((r) => r.data);
}

export function verifyTwoFactorSetup(data: { code: string }) {
  return apiClient.post('/api/auth/2fa/verify-setup', data).then((r) => r.data);
}

export function disableTwoFactor(data: { password: string; code?: string }) {
  return apiClient.post('/api/auth/2fa/disable', data).then((r) => r.data);
}

export function getTwoFactorStatus() {
  return apiClient.get<TwoFactorStatus>('/api/auth/2fa/status').then((r) => r.data);
}

export function verifyTwoFactorCode(data: { code: string; tempToken?: string }) {
  return apiClient.post('/api/auth/2fa/verify', data).then((r) => r.data);
}

export function regenerateBackupCodes() {
  return apiClient.post<TwoFactorSetup>('/api/auth/2fa/backup-codes/regenerate').then((r) => r.data);
}

export function adminDisableTwoFactor(userId: string) {
  return apiClient.post(`/api/admin/users/${userId}/2fa/disable`).then((r) => r.data);
}
