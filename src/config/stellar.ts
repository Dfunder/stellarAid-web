import { env, type StellarNetwork } from './env'

/**
 * Stellar network constants derived from `VITE_STELLAR_NETWORK`.
 *
 * The passphrases are the canonical way to tell networks apart: wallet
 * extensions report a display name that varies (`PUBLIC`, `Public Global Stellar
 * Network`), while the passphrase is stable.
 */
export const STELLAR_NETWORK_PASSPHRASES: Record<StellarNetwork, string> = {
  testnet: 'Test SDF Network ; September 2015',
  mainnet: 'Public Global Stellar Network ; September 2015',
}

/** Block explorer roots, used to build account links for a linked address. */
export const STELLAR_EXPLORER_URLS: Record<StellarNetwork, string> = {
  testnet: 'https://stellar.expert/explorer/testnet',
  mainnet: 'https://stellar.expert/explorer/public',
}

/** Human-readable label for a network, e.g. `Testnet`. */
export const STELLAR_NETWORK_LABELS: Record<StellarNetwork, string> = {
  testnet: 'Testnet',
  mainnet: 'Mainnet',
}

/** Network this build targets. */
export const activeStellarNetwork: StellarNetwork = env.VITE_STELLAR_NETWORK

/** Passphrase a connected wallet must report to match this build. */
export const activeNetworkPassphrase: string = STELLAR_NETWORK_PASSPHRASES[activeStellarNetwork]

/** Explorer account URL for `address` on `network`. */
export function stellarAccountExplorerUrl(address: string, network: StellarNetwork): string {
  return `${STELLAR_EXPLORER_URLS[network]}/account/${address}`
}
