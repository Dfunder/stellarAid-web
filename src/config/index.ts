/**
 * Application configuration: environment variables and shared constants.
 */
export { configError, env } from './env'
export type { AppEnv, StellarNetwork } from './env'
export {
  activeNetworkPassphrase,
  activeStellarNetwork,
  stellarAccountExplorerUrl,
  STELLAR_EXPLORER_URLS,
  STELLAR_NETWORK_LABELS,
  STELLAR_NETWORK_PASSPHRASES,
} from './stellar'
