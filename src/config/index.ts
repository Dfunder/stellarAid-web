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
