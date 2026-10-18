import { useCallback, useRef, useState } from 'react'
import { ApiError, getErrorMessage } from '@/services'
import { authApi } from '../services/authApi'
import { isWalletError, signWithConnectedWallet, WalletError } from '../services/wallets'
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
        // Step 1: Request challenge nonce from backend.
        //
        // A server-issued, single-use nonce is what makes this flow replay-safe.
        // There is deliberately no client-side fallback: if the nonce endpoint is
        // unreachable we surface the error and let the user retry, rather than
        // fabricating a challenge the server never issued (#861).
        const nonceData = await authApi.requestWalletNonce(connection.publicKey)

        if (abortController.signal.aborted) return null

        // An expired challenge must never be signed (#861).
        if (nonceData.expiresAt && new Date(nonceData.expiresAt).getTime() <= Date.now()) {
          throw new Error('Your authentication challenge has expired. Please try again.')
        }

        // Step 2: Request wallet signature with timeout. The challenge signed is
        // always the server-issued value, never a locally generated one.
        const signPromise = signWithConnectedWallet(nonceData.challenge)
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
          useAuthStore.getState().setSession({
            tokens: session.tokens,
            user: { ...session.user, avatarUrl: session.user.avatarUrl ?? null },
          })

          pendingAuthRef.current = null
          setIsSigningIn(false)
          return session.user
        } catch (loginErr) {
          // Only a genuine "wallet not registered" 404 may create an account.
          // A 400 (malformed request) or any error whose text merely contains
          // "not found" must not silently register a duplicate account (#861).
          const isNotFound = loginErr instanceof ApiError && loginErr.status === 404

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

                useAuthStore.getState().setSession({
                  tokens: regSession.tokens,
                  user: { ...regSession.user, avatarUrl: regSession.user.avatarUrl ?? null },
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

        useAuthStore.getState().setSession({
          tokens: session.tokens,
          user: { ...session.user, avatarUrl: session.user.avatarUrl ?? null },
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
