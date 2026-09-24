import { useSyncExternalStore } from 'react'
import { isFeatureEnabled, subscribeToFeatureFlags, type FeatureFlag } from '@/config'

/** `true` when the typed feature flag is enabled; re-renders when flags change. */
export function useFeatureFlag(flag: FeatureFlag): boolean {
  return useSyncExternalStore(subscribeToFeatureFlags, () => isFeatureEnabled(flag))
}
