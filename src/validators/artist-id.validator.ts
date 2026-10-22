import { z } from 'zod'

/** Positive integer (never 0, never negative). */
export const POSITIVE_INTEGER_REGEX = /^[1-9]\d*$/

/** Standard RFC 4122 UUID (versions 1-5, variant 8/9/a/b). */
export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/** Conservative single-segment resource token. */
export const SAFE_RESOURCE_SLUG_REGEX = /^[A-Za-z0-9][A-Za-z0-9._~@:+-]{0,127}$/

/**
 * Checks for path traversal sequences like `..`, `/`, `\`, null bytes,
 * and URL-encoded variants.
 */
export function hasPathTraversal(input: string): boolean {
  if (input.includes('..') || input.includes('/') || input.includes('\\') || input.includes('\0')) {
    return true
  }
  try {
    const decoded = decodeURIComponent(input)
    if (
      decoded.includes('..') ||
      decoded.includes('/') ||
      decoded.includes('\\') ||
      decoded.includes('\0')
    ) {
      return true
    }
  } catch {
    return true
  }
  return false
}

/**
 * Checks for SQL/NoSQL injection signatures and comment markers.
 */
export function hasSqlInjection(input: string): boolean {
  const sqlPatterns = [
    /--/,
    /\/\*/,
    /\*\//,
    /'/,
    /"/,
    /;/,
    /\b(OR|AND)\s+['"\d\w\s=<>!-]+/i,
    /\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC)\b/i,
  ]
  if (sqlPatterns.some((pattern) => pattern.test(input))) {
    return true
  }
  try {
    const decoded = decodeURIComponent(input)
    if (sqlPatterns.some((pattern) => pattern.test(decoded))) {
      return true
    }
  } catch {
    return true
  }
  return false
}

/**
 * Zod schema for artist ID parameter (#940).
 * Validates that `id` is a positive integer or a valid UUID format,
 * and rejects path traversal and SQL injection attempts.
 */
export const artistIdSchema = z
  .string()
  .trim()
  .min(1, 'Artist ID is required.')
  .refine((val) => !hasPathTraversal(val), {
    message: 'Path traversal attempt detected in artist ID.',
  })
  .refine((val) => !hasSqlInjection(val), {
    message: 'SQL injection attempt detected in artist ID.',
  })
  .refine((val) => POSITIVE_INTEGER_REGEX.test(val) || UUID_REGEX.test(val), {
    message: 'Invalid artist id: expected a positive integer or UUID.',
  })

/**
 * Zod schema for general resource IDs (marketplace, portfolio) (#940).
 */
export const resourceIdSchema = z
  .string()
  .trim()
  .min(1, 'Resource ID is required.')
  .refine((val) => !hasPathTraversal(val), {
    message: 'Path traversal attempt detected in resource ID.',
  })
  .refine((val) => !hasSqlInjection(val), {
    message: 'SQL injection attempt detected in resource ID.',
  })
  .refine(
    (val) =>
      POSITIVE_INTEGER_REGEX.test(val) ||
      UUID_REGEX.test(val) ||
      SAFE_RESOURCE_SLUG_REGEX.test(val),
    {
      message: 'Invalid resource id format.',
    },
  )

export const marketplaceIdSchema = resourceIdSchema
export const portfolioIdSchema = resourceIdSchema

export type ValidationResult = { success: true; data: string } | { success: false; error: string }

/**
 * Validates an artist ID using `artistIdSchema`.
 */
export function validateArtistId(id: unknown): ValidationResult {
  const result = artistIdSchema.safeParse(id)
  if (result.success) {
    return { success: true, data: result.data }
  }
  const firstError = result.error.issues[0]?.message ?? 'Invalid artist id.'
  return { success: false, error: firstError }
}

/**
 * Validates a marketplace ID using `marketplaceIdSchema`.
 */
export function validateMarketplaceId(id: unknown): ValidationResult {
  const result = marketplaceIdSchema.safeParse(id)
  if (result.success) {
    return { success: true, data: result.data }
  }
  const firstError = result.error.issues[0]?.message ?? 'Invalid marketplace id.'
  return { success: false, error: firstError }
}

/**
 * Validates a portfolio ID using `portfolioIdSchema`.
 */
export function validatePortfolioId(id: unknown): ValidationResult {
  const result = portfolioIdSchema.safeParse(id)
  if (result.success) {
    return { success: true, data: result.data }
  }
  const firstError = result.error.issues[0]?.message ?? 'Invalid portfolio id.'
  return { success: false, error: firstError }
}
