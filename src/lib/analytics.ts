export interface ErrorReportInfo {
  componentStack: string | null
  /** When true, skip the server monitoring POST (tests). */
  skipServer?: boolean
}

export type ErrorReporter = (error: Error, info: ErrorReportInfo) => void

let errorReporter: ErrorReporter | null = null

/**
 * Registers the analytics handler invoked for render errors. Replacing the
 * default console-only reporting (e.g. with a real analytics SDK).
 */
export function setErrorReporter(reporter: ErrorReporter | null): void {
  errorReporter = reporter
}

/** Logs a render error to the console, server monitoring (#936), and optional reporter. */
export function reportError(error: Error, info: ErrorReportInfo): void {
  if (info.componentStack) {
    console.error('[ErrorBoundary] render error:', error, info.componentStack)
  } else {
    console.error('[ErrorBoundary] render error:', error)
  }

  if (!info.skipServer) {
    // Dynamic import avoided for sync componentDidCatch — use fire-and-forget.
    void import('./error-tracking')
      .then(({ logErrorToServer }) =>
        logErrorToServer(error, {
          componentStack: info.componentStack,
          source: 'error_boundary',
        }),
      )
      .catch(() => {})
  }

  if (!errorReporter) return
  try {
    errorReporter(error, info)
  } catch {
    // A reporter must never mask the original error.
  }
}

/**
 * Product analytics events. Naming convention: `snake_case`, `<object>_<action>`
 * (or a single verb for account-level actions), past-tense-free, and stable -
 * rename an event only together with its dashboards. See CONTRIBUTING.md.
 */
export type AnalyticsEvent =
  | 'render_error'
  | 'signup'
  | 'login'
  | 'wallet_connect'
  | 'artwork_view'
  | 'checkout_start'
  | 'payment_complete'
  | 'commission_request'
  | 'not_found'

/** Flat, primitive-only event properties. Never include PII (emails, wallet addresses). */
export type AnalyticsProps = Record<string, string | number | boolean | null>

/** Vendor adapter: implement this to forward events to a real analytics SDK. */
export interface AnalyticsProvider {
  track(event: AnalyticsEvent, props: AnalyticsProps): void
}

const noopProvider: AnalyticsProvider = { track: () => {} }
let analyticsProvider: AnalyticsProvider = noopProvider

/**
 * #846 — provider failures used to be swallowed by an empty `catch {}`, so a
 * broken provider dropped every event with no signal at all. They are now counted
 * and the most recent message is retained, so a silently-dead provider is
 * detectable instead of invisible.
 */
let failedEventCount = 0
let lastProviderError: string | null = null

/**
 * Key names that never carry an event property, whatever the value is (#865).
 * Extended with `secret`/`otp`/`passcode`/`authorization` so a credential added
 * under a new name is still dropped.
 */
const PII_KEY_PATTERN = /email|wallet|address|password|token|phone|secret|otp|passcode|credential|authorization/i

const EMAIL_PATTERN = /[^\s@]+@[^\s@]+\.[^\s@]+/

/** A Stellar account (`G`) or muxed account (`M`) address, in any casing. */
const STELLAR_ADDRESS_PATTERN = /\b(?:G[A-Z2-7]{55}|M[A-Z2-7]{55,68})\b/i

/** A JWT, the shape an access/refresh/reset token takes. */
const JWT_PATTERN = /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/

/** Any opaque 32+ character credential-looking blob. */
const OPAQUE_TOKEN_PATTERN = /\b[A-Za-z0-9_-]{32,}\b/

/**
 * Value-shape check. Keys alone are not trusted: an address or an email under
 * an unrecognised key is still personal data and must not reach a provider.
 */
function isSensitiveString(value: string): boolean {
  return (
    EMAIL_PATTERN.test(value) ||
    STELLAR_ADDRESS_PATTERN.test(value) ||
    JWT_PATTERN.test(value) ||
    OPAQUE_TOKEN_PATTERN.test(value)
  )
}

/**
 * Recursively drops anything that looks like PII.
 *
 * Nested objects and arrays are walked too, so an email under an unrecognised
 * key is stripped rather than forwarded whole (#865).
 */
function sanitize(value: unknown, key?: string): { keep: boolean; value?: unknown } {
  if (key !== undefined && PII_KEY_PATTERN.test(key)) return { keep: false }

  if (typeof value === 'string') {
    return isSensitiveString(value) ? { keep: false } : { keep: true, value }
  }
  if (typeof value === 'number' || typeof value === 'boolean' || value === null) {
    return { keep: true, value }
  }
  if (Array.isArray(value)) {
    const kept: unknown[] = []
    for (const item of value) {
      const result = sanitize(item)
      if (result.keep) kept.push(result.value)
    }
    return { keep: true, value: kept }
  }
  if (typeof value === 'object') {
    const kept: Record<string, unknown> = {}
    for (const [entryKey, entryValue] of Object.entries(value as Record<string, unknown>)) {
      const result = sanitize(entryValue, entryKey)
      if (result.keep) kept[entryKey] = result.value
    }
    return { keep: true, value: kept }
  }
  return { keep: false }
}

function stripPii(props: AnalyticsProps): AnalyticsProps {
  const result = sanitize(props)
  return (result.value ?? {}) as AnalyticsProps
}

export const analytics = {
  /** Replaces the vendor provider (`null` restores the default no-op provider). */
  setProvider(provider: AnalyticsProvider | null): void {
    analyticsProvider = provider ?? noopProvider
  },

  /** Tracks a product event. PII is stripped before it reaches the provider. */
  track(event: AnalyticsEvent, props: AnalyticsProps = {}): void {
    const safeProps = stripPii(props)
    if (import.meta.env.DEV) {
      console.debug('[analytics]', event, safeProps)
    }
    try {
      analyticsProvider.track(event, safeProps)
    } catch (error) {
      // Analytics must never break the app, but it must not vanish either.
      failedEventCount += 1
      lastProviderError = error instanceof Error ? error.message : String(error)
      console.warn('[analytics] provider failed, event dropped:', event, lastProviderError)
    }
  },

  /** How many events have been dropped because the provider threw (#846). */
  getFailedEventCount(): number {
    return failedEventCount
  },

  /** Message from the most recent provider failure, or `null` if none (#846). */
  getLastProviderError(): string | null {
    return lastProviderError
  },
}
