import { useMutation, useQuery } from '@tanstack/react-query'
import { ApiError, getErrorMessage } from '@/services'
import { invalidateQueriesFor } from '@/stores'
import { walletApi } from '../services/walletApi'
import { signWithConnectedWallet } from '../services/wallets'
import { getWalletConnection } from '../stores/walletStore'
import { authKeys } from '../queryKeys'
import type { LinkedWallet } from '../types'

/** Cache key for the signed-in user's linked wallets. */
export const linkedWalletsKey = authKeys.linkedWallets()

const DUPLICATE_ADDRESS_STATUS = 409

/** Turns a link failure into an `ApiError` the UI can show verbatim. */
function describeLinkError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    // 409 duplicate address: surface the actionable copy (already a specific
    // ApiError message from the public client).
    return error instanceof ApiError && error.status === DUPLICATE_ADDRESS_STATUS
      ? new ApiError(error.status, error.code, 'That Stellar address is already linked to an account.')
      : error
  }
  return new ApiError(null, 'WALLET_LINK_FAILED', getErrorMessage(error))
}

/** Linked wallets of the signed-in user. */
export function useLinkedWallets() {
  return useQuery({
    queryKey: linkedWalletsKey,
    queryFn: async (): Promise<LinkedWallet[]> => (await walletApi.list()).wallets,
  })
}

/**
 * Proves ownership and links the connected address: asks the backend for a
 * challenge, has the wallet sign it, then submits `{ publicKey, signedChallenge }`.
 * The backend verifies the signature before storing anything.
 */
export function useLinkWallet() {
  return useMutation({
    mutationFn: async (): Promise<LinkedWallet> => {
      const connection = getWalletConnection()
      if (!connection) throw new ApiError(null, 'WALLET_NOT_CONNECTED', 'Connect your wallet first.')

      try {
        const { challenge } = await walletApi.requestChallenge(connection.publicKey)
        const signedChallenge = await signWithConnectedWallet(challenge)
        const { wallet } = await walletApi.link({
          publicKey: connection.publicKey,
          signedChallenge,
        })
        return wallet
      } catch (error) {
        throw describeLinkError(error)
      }
    },
    onSuccess: () => {
      void invalidateQueriesFor(linkedWalletsKey)
    },
  })
}

/** Removes a linked address after the user confirms. */
export function useUnlinkWallet() {
  return useMutation({
    mutationFn: (walletId: string) => walletApi.unlink(walletId),
    onSuccess: () => {
      void invalidateQueriesFor(linkedWalletsKey)
    },
  })
}

/** Toggles whether the address is shown on the public artist profile. */
export function useSetWalletVisibility() {
  return useMutation({
    mutationFn: ({ walletId, isPublic }: { walletId: string; isPublic: boolean }) =>
      walletApi.setVisibility(walletId, isPublic),
    onSuccess: () => {
      void invalidateQueriesFor(linkedWalletsKey)
    },
  })
}
