import { z } from 'zod'

/** Supported Stellar networks. */
export const stellarNetworkSchema = z.enum(['testnet', 'mainnet'])

/**
 * Stellar network passphrases, the canonical way wallet extensions identify a
 * network. A build must only ever run against one of these.
 */
export const STELLAR_NETWORK_PASSPHRASES: Record<z.infer<typeof stellarNetworkSchema>, string> = {
  testnet: 'Test SDF Network ; September 2015',
  mainnet: 'Public Global Stellar Network ; September 2015',
}

/**
 * Returns a schema for an absolute URL that must use the `https:` scheme.
 * Passphrases and secrets must never travel over plaintext HTTP.
 */
function httpsUrl(fieldName: string): z.ZodType<string> {
  return z
    .string()
    .url(`${fieldName} must be a valid absolute URL`)
    .refine((value) => {
      try {
        return new URL(value).protocol === 'https:'
      } catch {
        return false
      }
    }, `${fieldName} must use the https:// scheme`)
}

/** Optional feature-flag overrides ("true"/"false"); anything else counts as unset. */
const featureFlagOverrides = {
  VITE_FF_MESSAGING: z.stringbool().optional().catch(undefined),
  VITE_FF_NOTIFICATIONS: z.stringbool().optional().catch(undefined),
  VITE_FF_ADVANCED_FILTERS: z.stringbool().optional().catch(undefined),
}

/**
 * Development defaults: the app must be able to boot against a local backend
 * with zero configuration, so localhost and testnet are the safe dev fallback.
 */
const devEnvSchema = z.object({
  VITE_API_URL: z.string().url().default('http://localhost:4000'),
  VITE_STELLAR_NETWORK: stellarNetworkSchema.default('testnet'),
  VITE_APP_URL: z.string().url().default('http://localhost:5173'),
  ...featureFlagOverrides,
})

/**
 * Production schema: every value is required and both URLs must be https.
 * There are no defaults here — a missing or wrong variable must fail closed
 * instead of silently shipping against localhost or testnet.
 */
const prodEnvSchema = z.object({
  VITE_API_URL: httpsUrl('VITE_API_URL'),
  VITE_STELLAR_NETWORK: stellarNetworkSchema,
  VITE_APP_URL: httpsUrl('VITE_APP_URL'),
  ...featureFlagOverrides,
})

export type StellarNetwork = z.infer<typeof stellarNetworkSchema>
export type AppEnv = z.infer<typeof prodEnvSchema>

const REQUIRED_KEYS = ['VITE_API_URL', 'VITE_STELLAR_NETWORK', 'VITE_APP_URL'] as const
type EnvKey = (typeof REQUIRED_KEYS)[number]
type FlagEnvKey = 'VITE_FF_MESSAGING' | 'VITE_FF_NOTIFICATIONS' | 'VITE_FF_ADVANCED_FILTERS'

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

/** Fallback env used only when configuration is invalid and ConfigErrorScreen is rendered. */
function fallbackEnv(): AppEnv {
  return {
    VITE_API_URL: 'https://api.invalid',
    VITE_STELLAR_NETWORK: 'mainnet',
    VITE_APP_URL: 'https://app.invalid',
  }
}

/**
 * Parses raw environment values against the right schema for the build mode.
 * Never throws: every failure path returns a descriptive `configError` so the
 * app can render `ConfigErrorScreen` instead of dying with an unhandled
 * module-scope exception.
 */
export function parseEnv(
  raw: Partial<Record<EnvKey | FlagEnvKey, string | undefined>>,
  isDev: boolean,
): { env: AppEnv; configError: string | null } {
  const schema = isDev ? devEnvSchema : prodEnvSchema

  const validation = schema.safeParse(raw)
  if (validation.success) {
    return { env: validation.data, configError: null }
  }

  const missing = REQUIRED_KEYS.filter((key) => raw[key] === undefined || raw[key] === '')
  const details = [
    missing.length > 0
      ? `Missing variables:\n${missing.map((key) => `  - ${key}`).join('\n')}`
      : '',
    `Invalid values:\n${formatIssues(validation.error)}`,
  ]
    .filter(Boolean)
    .join('\n')

  const message = [
    'Invalid environment configuration.',
    details,
    isDev
      ? 'Copy .env.example to .env and fix the values, then restart the dev server.'
      : 'This is a production build; all variables are required and URLs must be https. Fix the build environment and redeploy.',
  ].join('\n\n')

  console.error(`[config:env] ${message}`)
  return { env: fallbackEnv(), configError: message }
}

function loadEnv(): { env: AppEnv; configError: string | null } {
  return parseEnv(readRawEnv(), import.meta.env.DEV)
}

export const { env, configError } = loadEnv()