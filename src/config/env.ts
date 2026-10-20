import { z } from 'zod'

/** Supported Stellar networks. */
export const stellarNetworkSchema = z.enum(['testnet', 'mainnet'])

/**
 * Runtime environment configuration. All variables use the `VITE_` prefix and
 * are read from `import.meta.env` (see `.env.example`).
 *
 * There are deliberately **no schema defaults**: the dev-only defaults live in
 * `DEV_DEFAULTS` and are applied only when the build is not a production build.
 * A production build must supply every required variable explicitly, otherwise
 * the app fails closed with a configuration error screen (#864).
 */
const envSchema = z.object({
  VITE_API_URL: z.url(),
  VITE_STELLAR_NETWORK: stellarNetworkSchema,
  VITE_APP_URL: z.url(),
  // Optional feature-flag overrides ("true"/"false"); anything else counts as unset.
  VITE_FF_MESSAGING: z.stringbool().optional().catch(undefined),
  VITE_FF_NOTIFICATIONS: z.stringbool().optional().catch(undefined),
  VITE_FF_ADVANCED_FILTERS: z.stringbool().optional().catch(undefined),
})

export type StellarNetwork = z.infer<typeof stellarNetworkSchema>
export type AppEnv = z.infer<typeof envSchema>

const REQUIRED_KEYS = ['VITE_API_URL', 'VITE_STELLAR_NETWORK', 'VITE_APP_URL'] as const
type EnvKey = (typeof REQUIRED_KEYS)[number]
type FlagEnvKey = 'VITE_FF_MESSAGING' | 'VITE_FF_NOTIFICATIONS' | 'VITE_FF_ADVANCED_FILTERS'

/**
 * Values used only while developing, so a fresh clone runs without a `.env`.
 * They are never applied to a production build.
 */
const DEV_DEFAULTS: Record<EnvKey, string> = {
  VITE_API_URL: 'http://localhost:4000',
  VITE_STELLAR_NETWORK: 'testnet',
  VITE_APP_URL: 'http://localhost:5173',
}

/**
 * Stand-in used when the configuration is rejected. The app never renders past
 * the configuration error screen in that case, so this is never used to make a
 * request — it exists so importing modules that read `env` cannot crash.
 */
const FALLBACK_ENV = {
  VITE_API_URL: 'https://invalid.localhost',
  VITE_STELLAR_NETWORK: 'testnet',
  VITE_APP_URL: 'https://invalid.localhost',
}

/**
 * Single access point for the raw `import.meta.env` values. No other module in
 * the app should touch `import.meta.env` directly.
 */
function readRawEnv(): Partial<Record<EnvKey | FlagEnvKey, string | undefined>> {
  return {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_STELLAR_NETWORK: import.meta.env.VITE_STELLAR_NETWORK,
    VITE_APP_URL: import.meta.env.VITE_APP_URL,
    VITE_FF_MESSAGING: import.meta.env.VITE_FF_MESSAGING,
    VITE_FF_NOTIFICATIONS: import.meta.env.VITE_FF_NOTIFICATIONS,
    VITE_FF_ADVANCED_FILTERS: import.meta.env.VITE_FF_ADVANCED_FILTERS,
  }
}

function formatIssues(error: z.ZodError<AppEnv>): string {
  return error.issues
    .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n')
}

/** Variable names mentioned by a validation failure, in `REQUIRED_KEYS` order. */
function invalidKeysOf(error: z.ZodError<AppEnv>): string[] {
  const keys = error.issues
    .map((issue) => issue.path[0])
    .filter((key): key is string => typeof key === 'string')
  return REQUIRED_KEYS.filter((key) => keys.includes(key))
}

function buildMessage(details: string): string {
  return [
    'Invalid environment configuration.',
    details,
    'Copy .env.example to .env and fix the values, then restart the dev server.',
  ].join('\n\n')
}

/** A production build must never talk to a plain-HTTP API: tokens would travel in the clear. */
function productionApiUrlIssue(apiUrl: string | undefined): string | null {
  if (typeof apiUrl !== 'string' || apiUrl.trim() === '') return null
  return apiUrl.trim().startsWith('https://')
    ? null
    : 'VITE_API_URL must use https:// in a production build.'
}

export interface EnvLoadResult {
  /** Always shaped, so consumers can read it; meaningless when `configError` is set. */
  env: AppEnv
  /** Copy for the configuration error screen, or `null` when the config is valid. */
  configError: string | null
  /** The variable names responsible for `configError`. */
  invalidKeys: string[]
}

/**
 * Resolves the runtime configuration without throwing at module scope, so an
 * invalid production build renders `ConfigErrorScreen` instead of a blank page
 * or an unhandled module-scope exception (#864).
 */
function loadEnv(): EnvLoadResult {
  const raw = readRawEnv()
  const isProduction = import.meta.env.PROD

  const values: Partial<Record<EnvKey | FlagEnvKey, string | undefined>> = { ...raw }
  if (!isProduction) {
    for (const key of REQUIRED_KEYS) {
      if (values[key] === undefined || values[key] === '') values[key] = DEV_DEFAULTS[key]
    }
  }

  const missing = REQUIRED_KEYS.filter(
    (key) => values[key] === undefined || values[key] === '',
  )

  const apiUrlIssue = isProduction ? productionApiUrlIssue(values.VITE_API_URL) : null

  const validation = envSchema.safeParse(values)
  if (missing.length === 0 && !apiUrlIssue && validation.success) {
    return { env: validation.data, configError: null, invalidKeys: [] }
  }

  const details = [
    missing.length > 0
      ? `Missing variables:\n${missing.map((key) => `  - ${key}`).join('\n')}`
      : '',
    !validation.success ? `Invalid values:\n${formatIssues(validation.error)}` : '',
    apiUrlIssue ? `Invalid values:\n  - VITE_API_URL: ${apiUrlIssue}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  if (isProduction) {
    console.error(`[config:env] ${buildMessage(details)}`)
  }

  const invalidKeys = [
    ...missing,
    ...(validation.success ? [] : invalidKeysOf(validation.error)),
    ...(apiUrlIssue ? (['VITE_API_URL'] as const).filter((k) => !missing.includes(k)) : []),
  ]

  return {
    env: validation.success ? validation.data : (FALLBACK_ENV as AppEnv),
    configError: buildMessage(details),
    invalidKeys: [...new Set(invalidKeys)],
  }
}

/** Result of resolving the runtime configuration. Never throws. */
export const loadResult: EnvLoadResult = loadEnv()

/** Valid runtime configuration, or the fallback shape when it is invalid. */
export const env: AppEnv = loadResult.env

/** Configuration error copy for the boot screen, or `null` when the config is valid. */
export const configError: string | null = loadResult.configError
