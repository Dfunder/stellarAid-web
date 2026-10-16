import { z } from 'zod'

export const DEFAULT_AUTHENTICATED_PATH = '/dashboard'

/** Whitespace and control characters browsers trim or ignore inside a URL. */
const UNSAFE_REDIRECT_CHARS = /[\s\u0000-\u001f]/

/**
 * A post-login destination is only safe when it is an app-relative path.
 *
 * A leading `//` (protocol-relative) or `/\` is read by browsers as an
 * absolute URL, and an encoded variant such as `/%09/` decodes to the same
 * thing — so the value is decoded before it is checked (#798).
 */
export function safeRedirect(value: string | null): string {
  if (!value || !value.startsWith('/')) return DEFAULT_AUTHENTICATED_PATH

  let decoded: string
  try {
    decoded = decodeURIComponent(value)
  } catch {
    // A malformed escape sequence is not a path we can vouch for.
    return DEFAULT_AUTHENTICATED_PATH
  }

  if (!decoded.startsWith('/')) return DEFAULT_AUTHENTICATED_PATH
  if (decoded.startsWith('//') || decoded.startsWith('/\\')) return DEFAULT_AUTHENTICATED_PATH
  if (UNSAFE_REDIRECT_CHARS.test(decoded)) return DEFAULT_AUTHENTICATED_PATH

  return value
}

export const MIN_PASSWORD_LENGTH = 8

/** Password rules enforced by the reset form (and any future sign-up form). */
export const passwordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters.`)
  .regex(/[a-z]/, 'Add a lowercase letter.')
  .regex(/[A-Z]/, 'Add an uppercase letter.')
  .regex(/\d/, 'Add a number.')

export const emailSchema = z.email('Enter a valid email address.')

/** Every unmet password requirement, empty when the password is acceptable. */
export function getPasswordIssues(password: string): string[] {
  const result = passwordSchema.safeParse(password)
  return result.success ? [] : result.error.issues.map((issue) => issue.message)
}

export type PasswordStrengthScore = 0 | 1 | 2 | 3 | 4

export interface PasswordStrength {
  score: PasswordStrengthScore
  /** Empty while the field is untouched, so no label is shown prematurely. */
  label: string
}

const STRENGTH_LABELS = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong']
const STRENGTH_SCORES = [0, 1, 2, 3, 4] as const

/** Rough 0-4 strength estimate used to drive the strength meter. */
export function getPasswordStrength(password: string): PasswordStrength {
  if (password.length === 0) return { score: 0, label: '' }

  const passed = [
    password.length >= MIN_PASSWORD_LENGTH,
    password.length >= 12,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length

  // Indexed through a literal tuple so the type is a runtime guarantee rather
  // than an unchecked `as` cast (#798).
  const score = STRENGTH_SCORES[Math.min(passed, 4)] ?? 0
  return { score, label: STRENGTH_LABELS[score] ?? '' }
}

/**
 * Reads the `exp` claim (as a millisecond timestamp) from a JWT without
 * verifying the signature - only used to schedule a proactive refresh.
 */
export function decodeJwtExpiry(token: string): number | null {
  const payload = token.split('.')[1]
  if (!payload) return null

  try {
    const claims: unknown = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    const exp = (claims as { exp?: unknown }).exp
    // `NaN` and `Infinity` are numbers, but neither is a usable expiry (#798).
    return typeof exp === 'number' && Number.isFinite(exp) ? exp * 1000 : null
  } catch {
    // Malformed or non-JSON token: fall back to reactive refresh on 401.
    return null
  }
}
