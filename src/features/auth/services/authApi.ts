import { http } from '@/services'
import type {
  AuthSession,
  AuthTokens,
  LoginCredentials,
  ResetPasswordPayload,
  User,
  WalletLoginPayload,
  WalletNonceResponse,
  WalletRegisterPayload,
} from '../types'

/**
 * Auth endpoints.
 *
 * Auth calls pass `skipRetry` so a rejected credential or an expired token is
 * reported immediately instead of being retried by the HTTP layer.
 */
export const authApi = {
  login(credentials: LoginCredentials): Promise<AuthSession> {
    return http.post<AuthSession>('/auth/login', credentials, { skipRetry: true })
  },

  /** Requests a cryptographic nonce for signing with the connected wallet. */
  requestWalletNonce(publicKey: string): Promise<WalletNonceResponse> {
    return http.post<WalletNonceResponse>(
      '/auth/wallet/nonce',
      { publicKey },
      { skipRetry: true },
    )
  },

  /** Submits the wallet signature and nonce in exchange for a full JWT session. */
  loginWithWallet(payload: WalletLoginPayload): Promise<AuthSession> {
    return http.post<AuthSession>('/auth/wallet/login', payload, { skipRetry: true })
  },

  /** Registers a new user account tied to the connected wallet address. */
  registerWithWallet(payload: WalletRegisterPayload): Promise<AuthSession> {
    return http.post<AuthSession>('/auth/wallet/register', payload, { skipRetry: true })
  },

  /** Profile of the current bearer token; the session bootstrap's source of truth. */
  me(): Promise<{ user: User }> {
    return http.get<{ user: User }>('/auth/me')
  },

  /** Exchanges a refresh token for a new access/refresh pair. */
  refresh(refreshToken: string): Promise<{ tokens: AuthTokens }> {
    return http.post<{ tokens: AuthTokens }>('/auth/refresh', { refreshToken }, { skipRetry: true })
  },

  /** Revokes the refresh token server-side. */
  logout(refreshToken: string): Promise<void> {
    return http.post<void>('/auth/logout', { refreshToken }, { skipRetry: true })
  },

  /**
   * Requests a password-reset email.
   *
   * The backend answers with the same payload whether or not the address
   * exists, so the UI must never branch on the result.
   */
  forgotPassword(email: string): Promise<void> {
    return http.post<void>('/auth/forgot-password', { email }, { skipRetry: true })
  },

  /** Checks whether a reset token is still usable. */
  validateResetToken(token: string): Promise<{ valid: boolean }> {
    return http.get<{ valid: boolean }>(`/auth/reset-password/${encodeURIComponent(token)}`, {
      skipRetry: true,
    })
  },

  resetPassword(payload: ResetPasswordPayload): Promise<void> {
    return http.post<void>('/auth/reset-password', payload, { skipRetry: true })
  },
}
