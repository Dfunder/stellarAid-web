/**
 * Shared email validation used by auth, contact, and newsletter forms.
 * Matches the acceptance regex from #932 / #933.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const INVALID_EMAIL_MESSAGE = 'Please enter a valid email address'

/** Returns true when `value` looks like a usable email address. */
export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim())
}

/**
 * Validates an email field. Returns an error message or `null` when valid.
 * Empty values get a distinct required message so forms can distinguish.
 */
export function validateEmail(
  value: string,
  options: { required?: boolean } = { required: true },
): string | null {
  const trimmed = value.trim()
  if (!trimmed) {
    return options.required ? 'Email is required' : null
  }
  if (!isValidEmail(trimmed)) {
    return INVALID_EMAIL_MESSAGE
  }
  return null
}
