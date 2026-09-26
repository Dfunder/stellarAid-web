import type { StellarNetwork } from '@/config'

/** Roles a user can hold; mirrors the backend's role enum. */
export type UserRole = 'client' | 'artist' | 'admin'

export interface UserSocials {
  twitter?: string
  github?: string
  instagram?: string
  discord?: string
  artstation?: string
}

/** The signed-in user's profile, as returned by `/auth/me`. */
export interface User {
  id: string
  email: string
  name: string
  username?: string
  role: UserRole
  emailVerified: boolean
  avatarUrl?: string | null
  coverUrl?: string | null
  bio?: string
  location?: string
  website?: string
  socials?: UserSocials
  skills?: string[]
  /** Primary linked Stellar address, or `null` when none is linked yet. */
  publicKey: string | null
  createdAt: string
}

/** Access/refresh token pair issued by the backend. */
export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

/** Result of a successful sign-in. */
export interface AuthSession {
  user: User
  tokens: AuthTokens
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface ResetPasswordPayload {
  token: string
  password: string
}

export interface WalletNonceResponse {
  nonce: string
  challenge: string
  expiresAt: string
}

export interface WalletLoginPayload {
  publicKey: string
  signature: string
  nonce: string
}

export interface WalletRegisterPayload {
  publicKey: string
  signature: string
  nonce: string
  name?: string
  username?: string
  email?: string
  role?: UserRole
}

/**
 * Session lifecycle.
 *
 * - `loading`: a stored token is being validated (only on boot / during sign-in)
 * - `authenticated`: the profile was fetched successfully
 * - `unauthenticated`: no usable session
 */
export type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated'

export interface AuthState {
  status: SessionStatus
  user: User | null
  /** User-readable reason for the last failure, if any. */
  error: string | null
}

/** A Stellar address linked to the account, used for payouts. */
export interface LinkedWallet {
  id: string
  publicKey: string
  label: string | null
  network: StellarNetwork
  /** Whether the address is shown on the public artist profile. */
  isPublic: boolean
  isPrimary: boolean
  linkedAt: string
}

/** One-time message the backend asks the wallet to sign to prove ownership. */
export interface WalletChallenge {
  challenge: string
  expiresAt: string
}

export interface LinkWalletPayload {
  publicKey: string
  signedChallenge: string
}
