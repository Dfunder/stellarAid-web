import { apiClient } from '@/utils/apiClient';

export function registerArtist(data: { fullName: string; email: string; password: string }) {
  return apiClient.post('/api/auth/register', { ...data, role: 'artist' }).then((r) => r.data);
}

export function registerClient(data: { fullName: string; email: string; password: string }) {
  return apiClient.post('/api/auth/register', { ...data, role: 'client' }).then((r) => r.data);
}

export function login(data: { email: string; password: string }) {
  return apiClient.post('/api/auth/login', data).then((r) => r.data);
}

export function logout() {
  return apiClient.post('/api/auth/logout').then((r) => r.data);
}

export function refreshToken(refreshTokenStr: string) {
  return apiClient.post('/api/auth/refresh', { refreshToken: refreshTokenStr }).then((r) => r.data);
}

export function forgotPassword(email: string) {
  return apiClient.post('/api/auth/forgot-password', { email }).then((r) => r.data);
}

export function resetPassword(data: { token: string; password: string }) {
  return apiClient.post('/api/auth/reset-password', data).then((r) => r.data);
}

export function verifyEmail(token: string) {
  return apiClient.post('/api/auth/verify-email', { token }).then((r) => r.data);
}
