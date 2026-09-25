import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react'
import { activeStellarNetwork, STELLAR_NETWORK_LABELS } from '@/config'
import { getErrorMessage } from '@/services'
import {
  detectInstalledWallets,
  getWalletAdapter,
  isNetworkMismatch,
  isWalletError,
  signWithConnectedWallet,
  walletAdapters,
  WalletError,
} from '../services/wallets'
import { getWalletState, subscribeWallet, walletStore } from '../stores/walletStore'

export interface WalletOption {
  id: string
  name: string
  installUrl: string
  isInstalled: boolean
}

export interface UseWallet {
  /** Every supported wallet, flagged with whether its extension was detected. */
  options: WalletOption[]
  isDetecting: boolean
  isConnecting: boolean
  isSigning: boolean
  publicKey: string | null
  connectedWalletName: string | null
  /** True when the connected wallet points at a different network than this build. */
  hasNetworkMismatch: boolean
  expectedNetworkLabel: string
  error: string | null
  connect: (adapterId: string) => Promise<string | null>
  disconnect: () => void
  signMessage: (message: string) => Promise<string>
}

/** Detection is a browser-wide fact, so it only ever runs once per page load. */
let detectionStarted = false

function describeError(error: unknown): string {
  return isWalletError(error) ? error.message : getErrorMessage(error)
}

/** Detects, connects and signs with Stellar wallet extensions. */
export function useWallet(): UseWallet {
  const state = useSyncExternalStore(subscribeWallet, getWalletState)

  useEffect(() => {
    if (detectionStarted) return
    detectionStarted = true

    void detectInstalledWallets()
      .then((adapterIds) => walletStore.setInstalledAdapterIds(adapterIds))
      .catch(() => walletStore.setInstalledAdapterIds([]))
  }, [])

  const connect = useCallback(async (adapterId: string): Promise<string | null> => {
    const adapter = getWalletAdapter(adapterId)
    if (!adapter) {
      walletStore.setError('That wallet is not supported yet.')
      return null
    }

    walletStore.setConnecting(true)
    walletStore.setError(null)

    try {
      if (!(await adapter.isInstalled())) {
        // The extension may have been removed since detection; keep the picker honest.
        const installed = getWalletState().installedAdapterIds.filter((id) => id !== adapterId)
        walletStore.setInstalledAdapterIds(installed)
        throw new WalletError('NOT_INSTALLED', `${adapter.name} is not installed in this browser.`)
      }

      const publicKey = await adapter.connect()
      const networkPassphrase = await adapter.getNetworkPassphrase()
      walletStore.setConnection({ adapterId, publicKey, networkPassphrase })
      return publicKey
    } catch (error) {
      walletStore.setError(describeError(error))
      return null
    } finally {
      walletStore.setConnecting(false)
    }
  }, [])

  const disconnect = useCallback((): void => {
    walletStore.clearConnection()
  }, [])

  const signMessage = useCallback(async (message: string): Promise<string> => {
    walletStore.setSigning(true)
    walletStore.setError(null)
    try {
      return await signWithConnectedWallet(message)
    } catch (error) {
      walletStore.setError(describeError(error))
      throw error
    } finally {
      walletStore.setSigning(false)
    }
  }, [])

  const options = useMemo<WalletOption[]>(
    () =>
      walletAdapters.map((adapter) => ({
        id: adapter.id,
        name: adapter.name,
        installUrl: adapter.installUrl,
        isInstalled: state.installedAdapterIds.includes(adapter.id),
      })),
    [state.installedAdapterIds],
  )

  const connection = state.connection

  return {
    options,
    isDetecting: state.isDetecting,
    isConnecting: state.isConnecting,
    isSigning: state.isSigning,
    publicKey: connection?.publicKey ?? null,
    connectedWalletName: connection ? (getWalletAdapter(connection.adapterId)?.name ?? null) : null,
    hasNetworkMismatch: isNetworkMismatch(connection?.networkPassphrase ?? null),
    expectedNetworkLabel: STELLAR_NETWORK_LABELS[activeStellarNetwork],
    error: state.error,
    connect,
    disconnect,
    signMessage,
  }
}
