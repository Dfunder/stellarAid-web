/**
 * Application configuration: environment variables and shared constants.
 */
export { configError, env } from './env'
export type { AppEnv, StellarNetwork } from './env'
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
export {
  ASSETS,
  DISPLAY_FALLBACK_PRECISION,
  getAssetMeta,
  isSupportedAsset,
} from './assets'
export type { AssetMeta, SupportedAssetCode } from './assets'
