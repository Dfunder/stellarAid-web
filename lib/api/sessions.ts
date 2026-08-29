import { apiClient } from '@/utils/apiClient';

export interface ActiveSession {
  id: string;
  device: string;
  browser?: string;
  os?: string;
  ipAddress: string;
  location?: string;
  lastActive: string;
  createdAt: string;
  isCurrent: boolean;
}

export interface SessionSettings {
  timeoutMinutes: number;
  extendOnActivity: boolean;
  warningMinutes: number;
}

export function getActiveSessions() {
  return apiClient.get<{ sessions: ActiveSession[] }>('/api/auth/sessions').then((r) => r.data);
}

export function revokeSession(sessionId: string) {
  return apiClient.delete(`/api/auth/sessions/${sessionId}`).then((r) => r.data);
}

export function revokeAllSessions() {
  return apiClient.delete('/api/auth/sessions').then((r) => r.data);
}

export function getSessionSettings() {
  return apiClient.get<SessionSettings>('/api/auth/sessions/settings').then((r) => r.data);
}

export function updateSessionSettings(settings: Partial<SessionSettings>) {
  return apiClient.patch<SessionSettings>('/api/auth/sessions/settings', settings).then((r) => r.data);
}

export function extendSession() {
  return apiClient.post('/api/auth/sessions/extend').then((r) => r.data);
}

export function getSessionHistory() {
  return apiClient.get<{ history: ActiveSession[] }>('/api/auth/sessions/history').then((r) => r.data);
}
