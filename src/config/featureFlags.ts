import { env } from './env'

/**
 * Feature flags gate incomplete or risky features. Every flag defaults to
 * `false`, so a missing or broken config always hides the feature.
 *
 * Precedence: remote config > env override (`VITE_FF_*`) > default.
 * Lifecycle (add -> ship -> remove) is documented in CONTRIBUTING.md.
 */
const FLAG_DEFAULTS = {
  messaging: false,
  notifications: false,
  advancedFilters: false,
} satisfies Record<string, boolean>

export type FeatureFlag = keyof typeof FLAG_DEFAULTS
export type FeatureFlags = Record<FeatureFlag, boolean>

const envOverrides: Partial<FeatureFlags> = {
  messaging: env.VITE_FF_MESSAGING,
  notifications: env.VITE_FF_NOTIFICATIONS,
  advancedFilters: env.VITE_FF_ADVANCED_FILTERS,
}

let remoteOverrides: Partial<FeatureFlags> = {}
const listeners = new Set<() => void>()

function resolveFlags(): FeatureFlags {
  const flags: FeatureFlags = { ...FLAG_DEFAULTS }
  for (const flag of Object.keys(FLAG_DEFAULTS) as FeatureFlag[]) {
    flags[flag] = remoteOverrides[flag] ?? envOverrides[flag] ?? FLAG_DEFAULTS[flag]
  }
  return flags
}

let currentFlags = resolveFlags()

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return currentFlags[flag]
}

/** Subscribe to flag changes (e.g. after remote config loads); returns an unsubscribe. */
export function subscribeToFeatureFlags(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Applies remote overrides; only known boolean flags are accepted. */
export function setRemoteFeatureFlags(overrides: Partial<Record<string, unknown>>): void {
  remoteOverrides = Object.fromEntries(
    Object.entries(overrides).filter(
      ([flag, value]) => flag in FLAG_DEFAULTS && typeof value === 'boolean',
    ),
  ) as Partial<FeatureFlags>
  currentFlags = resolveFlags()
  listeners.forEach((listener) => listener())
}

/**
 * Remote config stub: pass a real fetcher once a config service exists.
 * Any failure keeps the env/default flags in place.
 */
export async function loadRemoteFeatureFlags(
  fetchConfig: () => Promise<Partial<Record<string, unknown>>> = async () => ({}),
): Promise<void> {
  try {
    setRemoteFeatureFlags(await fetchConfig())
  } catch {
    // Keep env/default flags.
  }
}
