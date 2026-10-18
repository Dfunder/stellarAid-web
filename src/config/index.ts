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
  isSupportedNetworkPassphrase,
  STELLAR_NETWORK_LABELS,
  stellarAccountExplorerUrl,
  SUPPORTED_NETWORK_PASSPHRASES,
} from './stellar'
export {
  ASSETS,
  DISPLAY_FALLBACK_PRECISION,
  getAssetMeta,
  isSupportedAsset,
} from './assets'
export type { AssetMeta, SupportedAssetCode } from './assets'
