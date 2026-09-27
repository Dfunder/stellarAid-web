export interface ErrorReportInfo {
  componentStack: string | null
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

/** Logs a render error to the console and forwards it to the registered reporter. */
export function reportError(error: Error, info: ErrorReportInfo): void {
  if (info.componentStack) {
    console.error('[ErrorBoundary] render error:', error, info.componentStack)
  } else {
    console.error('[ErrorBoundary] render error:', error)
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
  | 'signup'
  | 'login'
  | 'wallet_connect'
  | 'artwork_view'
  | 'checkout_start'
  | 'payment_complete'
  | 'commission_request'

/** Flat, primitive-only event properties. Never include PII (emails, wallet addresses). */
export type AnalyticsProps = Record<string, string | number | boolean | null>

/** Vendor adapter: implement this to forward events to a real analytics SDK. */
export interface AnalyticsProvider {
  track(event: AnalyticsEvent, props: AnalyticsProps): void
}

const noopProvider: AnalyticsProvider = { track: () => {} }
let analyticsProvider: AnalyticsProvider = noopProvider

const PII_KEY_PATTERN = /email|wallet|address|password|token|phone|secret|passcode|reset/i
const EMAIL_PATTERN = /[^\s@]+@[^\s@]+\.[^\s@]+/
const STELLAR_ADDRESS_PATTERN = /\b[GM][a-z2-7]{55}\b/i

/** True when a primitive value looks like an email or Stellar address. */
function looksLikePii(value: unknown): boolean {
  if (typeof value !== 'string') return false
  return EMAIL_PATTERN.test(value) || STELLAR_ADDRESS_PATTERN.test(value)
}

/**
 * Recursively removes PII-ish entries from a props payload. A value is dropped
 * when its key mentions a PII category or its shape matches an email or Stellar
 * address — key names alone are not trusted. Nested objects and arrays are
 * scrubbed in place so an email under an unrecognised key still never leaks.
 */
function stripPii<T>(input: T): T {
  if (Array.isArray(input)) {
    return input.map((item) => stripPii(item)) as T
  }
  if (input !== null && typeof input === 'object') {
    return Object.fromEntries(
      Object.entries(input as Record<string, unknown>)
        .filter(([key, value]) => !PII_KEY_PATTERN.test(key) && !looksLikePii(value))
        .map(([key, value]) => [key, stripPii(value)]),
    ) as T
  }
  return input
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
    } catch {
      // Analytics must never break the app.
    }
  },
}
