import { http } from '@/services'
import type { AuthSession, AuthUser, LoginCredentials } from '../types'

export const authService = {
  login: (credentials: LoginCredentials) => http.post<AuthSession>('/auth/login', credentials),

  verifyEmail: (token: string) =>
    http.post<{ user?: AuthUser }>('/auth/verify-email', { token }, { skipRetry: true }),

  resendVerification: (email: string) =>
    http.post<void>('/auth/resend-verification', { email }, { skipRetry: true }),
}
