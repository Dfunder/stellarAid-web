/**
 * Application configuration: environment variables and shared constants.
 */
export { configError, env, loadResult } from './env'
export type { AppEnv, EnvLoadResult, StellarNetwork } from './env'
export {
  isFeatureEnabled,
  loadRemoteFeatureFlags,
  setRemoteFeatureFlags,
  subscribeToFeatureFlags,
} from './featureFlags'
export type { FeatureFlag, FeatureFlags } from './featureFlags'
export {
  activeNetworkPassphrase,
  activeStellarNetwork,
  STELLAR_NETWORK_LABELS,
  stellarAccountExplorerUrl,
} from './stellar'
