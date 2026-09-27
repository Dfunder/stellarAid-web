import { z } from 'zod'

/**
 * Networks this build is allowed to target. An explicit allow-list: any other
 * value (including misspellings such as `testnett` or unsupported networks such
 * as `futurenet`) is rejected instead of silently degrading the experience.
 */
export const stellarNetworkSchema = z.enum(['testnet', 'mainnet'])

/** The values a deployer is allowed to choose, used in error messages. */
const STELLAR_NETWORK_CHOICES = stellarNetworkSchema.options.join('" | "')

/**
 * Runtime environment configuration. All variables use the `VITE_` prefix and are
 * read from `import.meta.env` (see `.env.example`).
 *
 * Critical variables deliberately have **no defaults**. A missing or invalid
 * value is reported through `configError` so the app can render
 * `ConfigErrorScreen`, rather than booting against `localhost`/testnet by
 * accident. Validation runs in every build mode; there is no dev-only bypass.
 */
const envSchema = z.object({
  // Credentials travel in `Authorization` headers, so plaintext HTTP is never
  // acceptable. Zod 4 matches the `protocol` option (a `scheme` string is
  // silently ignored, which would let `http://` through).
  VITE_API_URL: z.url({
    protocol: /^https$/,
    error: 'must be an https:// URL (http:// is not allowed)',
  }),
  VITE_STELLAR_NETWORK: stellarNetworkSchema,
  VITE_APP_URL: z.url({ error: 'must be a valid URL' }),
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

/**
 * Stand-in used only when validation fails.
 *
 * The app never renders its normal tree in that state (see `src/main.tsx`), but
 * `main.tsx` statically imports the app, so modules such as
 * `services/http.ts` and `config/stellar.ts` still evaluate and read `env` at
 * module scope. Without a well-formed object they would throw during import and
 * the operator would see a blank page instead of `ConfigErrorScreen`.
 *
 * The values are intentionally unroutable: `VITE_API_URL` points at the reserved
 * `.invalid` TLD so an accidental request can never reach a real host, and
 * `VITE_STELLAR_NETWORK` has to stay a valid enum member so the network lookup
 * tables in `config/stellar.ts` remain indexable.
 */
function unconfiguredEnv(): AppEnv {
  return {
    VITE_API_URL: 'https://unconfigured.invalid',
    VITE_STELLAR_NETWORK: 'testnet',
    VITE_APP_URL: 'https://unconfigured.invalid',
    VITE_FF_MESSAGING: undefined,
    VITE_FF_NOTIFICATIONS: undefined,
    VITE_FF_ADVANCED_FILTERS: undefined,
  }
}

function describeIssues(issues: z.core.$ZodIssue[]): string {
  return issues
    .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n')
}

/**
 * Builds the operator-facing message. Every offending variable is named so the
 * ConfigErrorScreen is actionable without cross-referencing the schema.
 */
function buildConfigError(
  raw: Partial<Record<EnvKey | FlagEnvKey, string | undefined>>,
  issues: z.core.$ZodIssue[],
): string {
  const missing = REQUIRED_KEYS.filter((key) => raw[key] === undefined || raw[key] === '')
  const invalidKeys = new Set(
    issues
      .map((issue) => issue.path[0])
      .filter((key): key is EnvKey => REQUIRED_KEYS.includes(key as EnvKey)),
  )
  // Declaration order keeps the headline stable regardless of which kind of
  // failure came first.
  const failedKeys = REQUIRED_KEYS.filter((key) => missing.includes(key) || invalidKeys.has(key))

  // Only explain the rules for variables that actually failed, so the screen
  // stays free of irrelevant advice.
  const hints = [
    failedKeys.includes('VITE_API_URL')
      ? 'VITE_API_URL must be an https:// URL (http:// is not allowed).'
      : '',
    failedKeys.includes('VITE_STELLAR_NETWORK')
      ? `VITE_STELLAR_NETWORK must be one of "${STELLAR_NETWORK_CHOICES}".`
      : '',
    failedKeys.includes('VITE_APP_URL') ? 'VITE_APP_URL must be a valid URL.' : '',
  ].filter(Boolean)

  const sections = [
    `Invalid environment configuration: ${failedKeys.join(', ')}.`,
    [
      missing.length > 0
        ? `Missing variables:\n${missing.map((key) => `  - ${key}`).join('\n')}`
        : '',
      issues.length > 0 ? `Invalid values:\n${describeIssues(issues)}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
    hints.join('\n'),
    'Set the variables in your environment (see .env.example), then restart the dev server or rebuild the production bundle.',
  ]

  return sections.filter(Boolean).join('\n\n')
}

/** Outcome of loading and validating the runtime environment. */
export type EnvLoadResult =
  { ok: true; env: AppEnv; configError: null } | { ok: false; env: AppEnv; configError: string }

/**
 * Validates `import.meta.env` without ever throwing. Importing this module is
 * always safe; callers must branch on `ok`/`configError` before using the app.
 */
function loadEnv(): EnvLoadResult {
  const raw = readRawEnv()
  const validation = envSchema.safeParse(raw)

  if (validation.success) {
    return { ok: true, env: validation.data, configError: null }
  }

  const configError = buildConfigError(raw, validation.error.issues)
  console.error(`[config:env] ${configError}`)
  return { ok: false, env: unconfiguredEnv(), configError }
}

/** Parsed environment plus the reason the app must not boot, if any. */
export const loadResult: EnvLoadResult = loadEnv()

export const { env, configError } = loadResult
