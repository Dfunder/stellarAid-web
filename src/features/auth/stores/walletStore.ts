/** The wallet the user connected during this browsing session. */
export interface WalletConnection {
  adapterId: string
  publicKey: string
  /** Passphrase reported by the wallet, used to detect a network mismatch. */
  networkPassphrase: string | null
}

export interface WalletState {
  connection: WalletConnection | null
  /** Ids of the wallet adapters detected as installed. */
  installedAdapterIds: string[]
  isDetecting: boolean
  isConnecting: boolean
  isSigning: boolean
  error: string | null
}

/**
 * Wallet connection state, kept outside React so the navbar button and the
 * wallet-linking settings section share one connection.
 *
 * The connection is intentionally not persisted: a wallet extension must
 * re-approve the site on every page load.
 */
let state: WalletState = {
  connection: null,
  installedAdapterIds: [],
  isDetecting: true,
  isConnecting: false,
  isSigning: false,
  error: null,
}

const listeners = new Set<() => void>()

function setState(patch: Partial<WalletState>): void {
  state = { ...state, ...patch }
  listeners.forEach((listener) => listener())
}

/** Subscribes to wallet changes; returns an unsubscribe function. */
export function subscribeWallet(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Current wallet snapshot. Stable between updates, safe for `useSyncExternalStore`. */
export function getWalletState(): WalletState {
  return state
}

/** Active connection, readable from non-React code such as the signing service. */
export function getWalletConnection(): WalletConnection | null {
  return state.connection
}

export const walletStore = {
  setInstalledAdapterIds(installedAdapterIds: string[]): void {
    setState({ installedAdapterIds, isDetecting: false })
  },
  setConnection(connection: WalletConnection): void {
    setState({ connection, error: null })
  },
  clearConnection(): void {
    setState({ connection: null, error: null })
  },
  setConnecting(isConnecting: boolean): void {
    setState({ isConnecting })
  },
  setSigning(isSigning: boolean): void {
    setState({ isSigning })
  },
  setError(error: string | null): void {
    setState({ error })
  },
}
