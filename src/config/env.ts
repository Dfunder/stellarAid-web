import { z } from 'zod'

/** Supported Stellar networks. */
export const stellarNetworkSchema = z.enum(['testnet', 'mainnet'])

/**
 * Runtime environment configuration. All variables use the `VITE_` prefix and are
 * read from `import.meta.env` (see `.env.example`).
 *
 * A default is provided for production safety so the app can still boot with a
 * reasonable configuration when a variable has not been supplied at build time.
 */
const envSchema = z.object({
  VITE_API_URL: z.url().default('http://localhost:4000'),
  VITE_STELLAR_NETWORK: stellarNetworkSchema.default('testnet'),
  VITE_APP_URL: z.url().default('http://localhost:5173'),
})

export type StellarNetwork = z.infer<typeof stellarNetworkSchema>
export type AppEnv = z.infer<typeof envSchema>

const REQUIRED_KEYS = ['VITE_API_URL', 'VITE_STELLAR_NETWORK', 'VITE_APP_URL'] as const
type EnvKey = (typeof REQUIRED_KEYS)[number]

/**
 * Single access point for the raw `import.meta.env` values. No other module in
 * the app should touch `import.meta.env` directly.
 */
function readRawEnv(): Partial<Record<EnvKey, string | undefined>> {
  return {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_STELLAR_NETWORK: import.meta.env.VITE_STELLAR_NETWORK,
    VITE_APP_URL: import.meta.env.VITE_APP_URL,
  }
}

function formatIssues(error: z.ZodError<AppEnv>): string {
  return error.issues
    .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n')
}

function loadEnv(): { env: AppEnv; configError: string | null } {
  const raw = readRawEnv()

  if (import.meta.env.DEV) {
    const missing = REQUIRED_KEYS.filter((key) => raw[key] === undefined || raw[key] === '')
    const validation = envSchema.safeParse(raw)

    if (missing.length === 0 && validation.success) {
      return { env: validation.data, configError: null }
    }

    const details = [
      missing.length > 0
        ? `Missing variables:\n${missing.map((key) => `  - ${key}`).join('\n')}`
        : '',
      !validation.success ? `Invalid values:\n${formatIssues(validation.error)}` : '',
    ]
      .filter(Boolean)
      .join('\n')

    const message = [
      'Invalid environment configuration.',
      details,
      'Copy .env.example to .env and fix the values, then restart the dev server.',
    ].join('\n\n')

    console.error(`[config:env] ${message}`)
    return { env: envSchema.parse({}), configError: message }
  }

  // Production: safe defaults are used for anything that is not provided.
  return { env: envSchema.parse(raw), configError: null }
}

export const { env, configError } = loadEnv()
