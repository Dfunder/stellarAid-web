import { useCallback, useRef, useState } from 'react'
import { ApiError, getErrorMessage } from '@/services'
import { authApi } from '../services/authApi'
import { isWalletError, signWithConnectedWallet, WalletError } from '../services/wallets'
import { authStore } from '../stores/authStore'
import { writeTokens } from '../stores/tokenStore'
import { useAuthStore } from '../stores/useAuthStore'
import { getWalletConnection } from '../stores/walletStore'
import type { User, WalletRegisterPayload } from '../types'

const SIGNING_TIMEOUT_MS = 60_000

export interface WalletAuthOptions {
  /** Callback invoked when the wallet address has no account, allowing custom registration payload. */
  onAccountNeeded?: (publicKey: string) => Promise<Partial<WalletRegisterPayload> | null>
}

export interface UseWalletAuth {
  isSigningIn: boolean
  isAccountRequired: boolean
  pendingPublicKey: string | null
  error: string | null
  loginWithConnectedWallet: (options?: WalletAuthOptions) => Promise<User | null>
  completeRegistration: (details: { name: string; username?: string; email?: string }) => Promise<User | null>
  cancel: () => void
}

/**
 * Hook for passwordless login and registration by signing a challenge nonce with a Stellar wallet.
 * Supports timeout, clean abort on wallet rejection, and account creation fallback.
 */
export function useWalletAuth(): UseWalletAuth {
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [isAccountRequired, setIsAccountRequired] = useState(false)
  const [pendingPublicKey, setPendingPublicKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const pendingAuthRef = useRef<{ nonce: string; signature: string; publicKey: string } | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    pendingAuthRef.current = null
    setIsSigningIn(false)
    setIsAccountRequired(false)
    setPendingPublicKey(null)
    setError(null)
  }, [])

  const loginWithConnectedWallet = useCallback(
    async (options?: WalletAuthOptions): Promise<User | null> => {
      const connection = getWalletConnection()
      if (!connection) {
        setError('Please connect your Stellar wallet first.')
        return null
      }

      setIsSigningIn(true)
      setError(null)
      setIsAccountRequired(false)
      setPendingPublicKey(connection.publicKey)

      const abortController = new AbortController()
      abortControllerRef.current = abortController

      try {
        // Step 1: Request challenge nonce from backend
        let nonceData
        try {
          nonceData = await authApi.requestWalletNonce(connection.publicKey)
        } catch (nonceError) {
          // If the backend endpoint is not reachable or returns a fallback format
          const fallbackNonce = `lumora-auth-nonce-${connection.publicKey.slice(0, 8)}-${Date.now()}`
          nonceData = {
            nonce: fallbackNonce,
            challenge: `Sign this message to authenticate with Lumora:\nNonce: ${fallbackNonce}\nTimestamp: ${new Date().toISOString()}`,
            expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
          }
        }

        if (abortController.signal.aborted) return null

        // Step 2: Request wallet signature with timeout
        const signPromise = signWithConnectedWallet(nonceData.challenge || nonceData.nonce)
        const timeoutPromise = new Promise<never>((_, reject) => {
          const timer = setTimeout(() => {
            reject(new WalletError('UNKNOWN', 'Signature request timed out. Please try again.'))
          }, SIGNING_TIMEOUT_MS)

          abortController.signal.addEventListener('abort', () => {
            clearTimeout(timer)
            reject(new DOMException('Aborted by user', 'AbortError'))
          })
        })

        const signature = await Promise.race([signPromise, timeoutPromise])

        if (abortController.signal.aborted) return null

        pendingAuthRef.current = {
          nonce: nonceData.nonce,
          signature,
          publicKey: connection.publicKey,
        }

        // Step 3: Attempt wallet login
        try {
          const session = await authApi.loginWithWallet({
            publicKey: connection.publicKey,
            signature,
            nonce: nonceData.nonce,
          })

          // Save session
          writeTokens(session.tokens)
          authStore.setSession(session.user)
          useAuthStore.getState().setSession({
            accessToken: session.tokens.accessToken,
            refreshToken: session.tokens.refreshToken,
            user: {
              ...session.user,
              avatarUrl: session.user.avatarUrl ?? null,
            },
          })

          pendingAuthRef.current = null
          setIsSigningIn(false)
          return session.user
        } catch (loginErr) {
          // Check for unknown address / user not found (404 or 400 with user unknown)
          const isNotFound =
            (loginErr instanceof ApiError && (loginErr.status === 404 || loginErr.status === 400)) ||
            (loginErr instanceof Error && loginErr.message.toLowerCase().includes('not found'))

          if (isNotFound) {
            // Check if options provides automatic or custom account registration
            if (options?.onAccountNeeded) {
              const regDetails = await options.onAccountNeeded(connection.publicKey)
              if (regDetails) {
                const regSession = await authApi.registerWithWallet({
                  publicKey: connection.publicKey,
                  signature,
                  nonce: nonceData.nonce,
                  name: regDetails.name || `User ${connection.publicKey.slice(0, 6)}`,
                  username: regDetails.username,
                  email: regDetails.email,
                  role: regDetails.role || 'client',
                })

                writeTokens(regSession.tokens)
                authStore.setSession(regSession.user)
                useAuthStore.getState().setSession({
                  accessToken: regSession.tokens.accessToken,
                  refreshToken: regSession.tokens.refreshToken,
                  user: {
                    ...regSession.user,
                    avatarUrl: regSession.user.avatarUrl ?? null,
                  },
                })

                pendingAuthRef.current = null
                setIsSigningIn(false)
                return regSession.user
              }
            }

            // Otherwise, switch to account required state so UI can prompt for details
            setIsAccountRequired(true)
            setIsSigningIn(false)
            return null
          }

          throw loginErr
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return null
        }

        // Refused signatures or user cancellation abort cleanly with no persistent error
        if (isWalletError(err) && err.code === 'REJECTED') {
          setError('Signature request was cancelled in your wallet.')
        } else {
          setError(getErrorMessage(err))
        }
        return null
      } finally {
        if (!isAccountRequired) {
          setIsSigningIn(false)
        }
      }
    },
    [isAccountRequired],
  )

  const completeRegistration = useCallback(
    async (details: { name: string; username?: string; email?: string }): Promise<User | null> => {
      const pending = pendingAuthRef.current
      if (!pending) {
        setError('No pending wallet signature found. Please sign in again.')
        return null
      }

      setIsSigningIn(true)
      setError(null)

      try {
        const session = await authApi.registerWithWallet({
          publicKey: pending.publicKey,
          signature: pending.signature,
          nonce: pending.nonce,
          name: details.name.trim(),
          username: details.username?.trim(),
          email: details.email?.trim(),
          role: 'client',
        })

        writeTokens(session.tokens)
        authStore.setSession(session.user)
        useAuthStore.getState().setSession({
          accessToken: session.tokens.accessToken,
          refreshToken: session.tokens.refreshToken,
          user: {
            ...session.user,
            avatarUrl: session.user.avatarUrl ?? null,
          },
        })

        pendingAuthRef.current = null
        setIsAccountRequired(false)
        setPendingPublicKey(null)
        setIsSigningIn(false)
        return session.user
      } catch (err) {
        setError(getErrorMessage(err))
        setIsSigningIn(false)
        return null
      }
    },
    [],
  )

  return {
    isSigningIn,
    isAccountRequired,
    pendingPublicKey,
    error,
    loginWithConnectedWallet,
    completeRegistration,
    cancel,
  }
}
