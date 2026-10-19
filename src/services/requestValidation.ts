/**
 * Request-boundary validation for dynamic API path parameters (#987).
 *
 * This app is a Vite SPA: it has no server routes of its own, so the last
 * place the client can prevent a malicious identifier from reaching the API is
 * the shared HTTP client. `validateRequestPath` rejects traversal, encoded
 * separators, SQL/NoSQL metacharacters and comment markers before a request is
 * sent; `checkRequestRateLimit` caps GET traffic to artist endpoints.
 *
 * Server-side validation and parameterised queries are still required — these
 * checks are defence in depth, not a replacement for backend checks.
 */

/** A conservative token allowed in a single path segment after decoding. */
const SAFE_PATH_SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._~@:+-]{0,127}$/

/** Positive integer, never zero and never negative. */
const POSITIVE_INTEGER_ID = /^[1-9]\d*$/

/** RFC 4122 UUID (versions 1-5, variant 8/9/a/b). */
const UUID_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/** Artist GET endpoints are capped at this many requests per minute. */
export const ARTIST_RATE_LIMIT = { limit: 30, windowMs: 60_000 } as const

const MAX_RATE_LIMIT_BUCKETS = 500

interface RateLimitBucket {
  count: number
  resetAt: number
}

const rateLimitBuckets = new Map<string, RateLimitBucket>()

function getPathname(url: string): string | null {
  try {
    return new URL(url, 'http://lumora.invalid').pathname
  } catch {
    return null
  }
}

/**
 * Extracts the raw path without letting `URL` resolve dot segments first. A
 * literal `/../` must still be visible to the segment validator.
 */
function getRawPath(url: string): string {
  let path = url
  const absolute = /^[a-z][a-z0-9+.-]*:\/\//i.exec(url)

  if (absolute) {
    const pathStart = url.indexOf('/', absolute[0].length)
    path = pathStart === -1 ? '/' : url.slice(pathStart)
  }

  const queryStart = path.search(/[?#]/)
  return queryStart === -1 ? path : path.slice(0, queryStart)
}

/**
 * Returns an error message for an unsafe request path, or `null` when every
 * path segment is a safe token.
 */
export function validateRequestPath(url: string | undefined): string | null {
  if (!url) return null

  // Protocol-relative URLs would escape the configured API origin.
  if (url.startsWith('//')) return 'Invalid request path.'

  const rawPath = getRawPath(url)

  for (const segment of rawPath.split('/').filter(Boolean)) {
    let decoded: string
    try {
      decoded = decodeURIComponent(segment)
    } catch {
      return 'Malformed URL encoding in request path.'
    }

    if (
      decoded === '.' ||
      decoded === '..' ||
      decoded.includes('/') ||
      decoded.includes('\\') ||
      decoded.includes('\0')
    ) {
      return 'Invalid request path.'
    }

    if (
      !SAFE_PATH_SEGMENT.test(decoded) ||
      decoded.includes('--') ||
      decoded.includes('/*') ||
      decoded.includes('*/')
    ) {
      return 'Invalid request path parameter.'
    }
  }

  return null
}

/** True when `value` is a positive integer or a valid UUID. */
export function validateArtistId(value: string): boolean {
  const id = value.trim()
  return POSITIVE_INTEGER_ID.test(id) || UUID_ID.test(id)
}

/**
 * Validates and returns an artist id. Throws on invalid input so server route
 * handlers / API adapters can fail fast with a 400 response.
 */
export function assertValidArtistId(value: string): string {
  const id = value.trim()
  if (!validateArtistId(id)) {
    throw new Error('Invalid artist id: expected a positive integer or UUID.')
  }
  return id
}

/** True when `value` is a safe, single-segment marketplace/portfolio id. */
export function validateResourceId(value: string): boolean {
  const id = value.trim()
  return SAFE_PATH_SEGMENT.test(id) && !id.includes('--')
}

export const validateMarketplaceId = validateResourceId
export const validatePortfolioId = validateResourceId

function artistRateLimitKey(pathname: string): string | null {
  const firstSegment = pathname.split('/').filter(Boolean)[0]?.toLowerCase()
  if (firstSegment === 'profiles' || firstSegment === 'artists' || firstSegment === 'artist') {
    return firstSegment
  }
  return null
}

/**
 * Applies a fixed-window limit to `GET` requests on artist endpoints.
 *
 * Returns an error message when the limit is exceeded, otherwise `null`.
 */
export function checkRequestRateLimit(
  url: string | undefined,
  method: string | undefined,
  now = Date.now(),
): string | null {
  if (!url) return null
  if ((method ?? 'get').toLowerCase() !== 'get') return null

  const pathname = getPathname(url)
  if (!pathname) return null

  const key = artistRateLimitKey(pathname)
  if (!key) return null

  const bucket = rateLimitBuckets.get(key)
  if (!bucket || now >= bucket.resetAt) {
    rateLimitBuckets.set(key, {
      count: 1,
      resetAt: now + ARTIST_RATE_LIMIT.windowMs,
    })

    if (rateLimitBuckets.size > MAX_RATE_LIMIT_BUCKETS) {
      const oldest = rateLimitBuckets.keys().next().value
      if (oldest) rateLimitBuckets.delete(oldest)
    }

    return null
  }

  if (bucket.count >= ARTIST_RATE_LIMIT.limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))
    return `Too many artist requests. Please wait ${retryAfterSeconds} second${
      retryAfterSeconds === 1 ? '' : 's'
    } and try again.`
  }

  bucket.count += 1
  return null
}

/** Clears rate-limit buckets. Intended for tests. */
export function resetRateLimitsForTests(): void {
  rateLimitBuckets.clear()
}
