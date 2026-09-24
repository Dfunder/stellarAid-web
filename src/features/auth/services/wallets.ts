import freighter from '@stellar/freighter-api'
import { activeNetworkPassphrase, activeStellarNetwork, STELLAR_NETWORK_LABELS } from '@/config'
import { getWalletConnection } from '../stores/walletStore'

/** Why a wallet interaction failed, so the UI can react (e.g. show install steps). */
export type WalletErrorCode =
  'NOT_INSTALLED' | 'NOT_CONNECTED' | 'NETWORK_MISMATCH' | 'REJECTED' | 'UNSUPPORTED' | 'UNKNOWN'

export class WalletError extends Error {
  readonly code: WalletErrorCode

  constructor(code: WalletErrorCode, message: string) {
    super(message)
    this.name = 'WalletError'
    this.code = code
  }
}

export function isWalletError(error: unknown): error is WalletError {
  return error instanceof WalletError
}

/** The slice of a wallet extension's API that Lumora needs. */
export interface WalletAdapter {
  readonly id: string
  readonly name: string
  readonly installUrl: string
  /** Whether the extension is present in this browser. */
  isInstalled(): Promise<boolean>
  /** Asks the wallet for the user's public key. */
  connect(): Promise<string>
  /** Network passphrase the wallet points at, or `null` when it will not say. */
  getNetworkPassphrase(): Promise<string | null>
  /** Signs `message` and returns the signature as base64. */
  signMessage(message: string, publicKey: string): Promise<string>
}

/**
 * Freighter reports failures as an `error` field instead of throwing, and its
 * published types reference an internal path alias. Normalizing through
 * `unknown` keeps the adapter independent of both.
 */
async function callFreighter<T>(invoke: () => Promise<unknown>, rejection: string): Promise<T> {
  const raw: unknown = await invoke()

  if (typeof raw !== 'object' || raw === null) {
    throw new WalletError('UNKNOWN', rejection)
  }

  const result = raw as Record<string, unknown>
  const error = result['error']
  if (error) {
    const message =
      typeof error === 'object' && error !== null
        ? String((error as { message?: unknown }).message ?? '')
        : ''
    throw new WalletError('REJECTED', message || rejection)
  }

  return result as T
}

/** Freighter returns the signature as base64 text (v4) or raw bytes (v3). */
function encodeSignature(signed: string | Uint8Array | null | undefined): string {
  if (signed === null || signed === undefined) {
    throw new WalletError('REJECTED', 'The signature request was rejected.')
  }
  if (typeof signed === 'string') return signed

  let binary = ''
  for (const byte of signed) binary += String.fromCharCode(byte)
  return btoa(binary)
}

const freighterAdapter: WalletAdapter = {
  id: 'freighter',
  name: 'Freighter',
  installUrl: 'https://www.freighter.app/',

  async isInstalled(): Promise<boolean> {
    try {
      const result = await callFreighter<{ isConnected?: boolean }>(
        () => freighter.isConnected(),
        'Freighter is not available.',
      )
      return result.isConnected === true
    } catch {
      // A wallet that cannot answer the handshake is treated as not installed.
      return false
    }
  },

  async connect(): Promise<string> {
    const result = await callFreighter<{ address?: string }>(
      () => freighter.getAddress(),
      'Freighter did not share an address.',
    )
    if (!result.address) {
      throw new WalletError('REJECTED', 'Freighter did not share an address.')
    }
    return result.address
  },

  async getNetworkPassphrase(): Promise<string | null> {
    try {
      const result = await callFreighter<{ networkPassphrase?: string }>(
        () => freighter.getNetwork(),
        'Freighter did not report its network.',
      )
      return result.networkPassphrase ?? null
    } catch {
      // Older versions refuse to report the network before the site is approved.
      return null
    }
  },

  async signMessage(message: string, publicKey: string): Promise<string> {
    const result = await callFreighter<{ signedMessage?: string | Uint8Array | null }>(
      () => freighter.signMessage(message, { address: publicKey }),
      'The signature request was rejected.',
    )
    return encodeSignature(result.signedMessage)
  },
}

/** Wallets the picker offers. Add adapters here as support grows. */
export const walletAdapters: readonly WalletAdapter[] = [freighterAdapter]

export function getWalletAdapter(id: string): WalletAdapter | undefined {
  return walletAdapters.find((adapter) => adapter.id === id)
}

/** Ids of the adapters whose extension is installed in this browser. */
export async function detectInstalledWallets(): Promise<string[]> {
  const detected = await Promise.all(
    walletAdapters.map(async (adapter) => ((await adapter.isInstalled()) ? adapter.id : null)),
  )
  return detected.filter((id): id is string => id !== null)
}

/**
 * Whether a reported passphrase belongs to a different network than this build.
 * `null` means "unknown" and is deliberately not treated as a mismatch.
 */
export function isNetworkMismatch(networkPassphrase: string | null): boolean {
  return networkPassphrase !== null && networkPassphrase !== activeNetworkPassphrase
}

/** Signs with whichever wallet is connected, failing with an actionable message. */
export async function signWithConnectedWallet(message: string): Promise<string> {
  const connection = getWalletConnection()
  if (!connection) {
    throw new WalletError('NOT_CONNECTED', 'Connect your wallet first.')
  }

  const adapter = getWalletAdapter(connection.adapterId)
  if (!adapter) {
    throw new WalletError('UNSUPPORTED', 'The connected wallet is no longer supported.')
  }

  if (isNetworkMismatch(connection.networkPassphrase)) {
    throw new WalletError(
      'NETWORK_MISMATCH',
      `Switch ${adapter.name} to ${STELLAR_NETWORK_LABELS[activeStellarNetwork]} and try again.`,
    )
  }

  return adapter.signMessage(message, connection.publicKey)
}
