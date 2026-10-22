/* eslint-disable react-refresh/only-export-components */
import { validateArtistId } from '@/validators/artist-id.validator'

/** Rate limit bucket storage for artist endpoint */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
export const ARTIST_ROUTE_LIMIT = { maxRequests: 30, windowMs: 60_000 }

export function resetArtistApiRateLimits(): void {
  rateLimitMap.clear()
}

/** Check rate limiting for a client key/IP */
export function checkArtistRouteRateLimit(key = 'client-default'): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(key)
  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + ARTIST_ROUTE_LIMIT.windowMs })
    return true
  }
  if (entry.count >= ARTIST_ROUTE_LIMIT.maxRequests) {
    return false
  }
  entry.count += 1
  return true
}

/**
 * Mock parameterized database fetch for artist.
 * Prevents SQL injection by using parameters rather than string concatenation (#940).
 */
export async function getArtistById(artistId: string) {
  // Parameterized query simulation:
  // e.g. db.query('SELECT * FROM artists WHERE id = $1', [artistId])
  return {
    id: artistId,
    name: 'Artist Profile',
    verified: true,
  }
}

export interface ApiRequest {
  url?: string
  headers?: Headers | Record<string, string | undefined>
  query?: Record<string, string | string[] | undefined>
  params?: Record<string, string | undefined>
}

export interface ApiResponse {
  status: (code: number) => ApiResponse
  json: (body: unknown) => void
}

/**
 * Next.js App Router style route handler:
 * GET(request, { params })
 */
export async function GET(
  request: Request | ApiRequest,
  context?: { params?: { id?: string } | Promise<{ id?: string }> },
): Promise<Response> {
  const resolvedParams = context?.params ? await context.params : undefined
  const rawId =
    resolvedParams?.id ?? (request as ApiRequest)?.query?.id ?? (request as ApiRequest)?.params?.id

  // 1. Rate limiting check (#940)
  const clientKey = 'client-default'
  if (!checkArtistRouteRateLimit(clientKey)) {
    return new Response(
      JSON.stringify({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded for artist API endpoint. Please try again later.',
      }),
      {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  // 2. Validate id parameter (#940)
  const validation = validateArtistId(rawId)
  if (!validation.success) {
    return new Response(
      JSON.stringify({
        error: 'Bad Request',
        message: validation.error,
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  // 3. Fetch artist with parameterized query
  const artist = await getArtistById(validation.data)
  return new Response(JSON.stringify(artist), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Next.js Pages Router / Express style handler:
 * handler(req, res)
 */
export default async function handler(req: ApiRequest, res: ApiResponse) {
  const rawId = req.query?.id ?? req.params?.id

  if (!checkArtistRouteRateLimit('client-default')) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded for artist API endpoint. Please try again later.',
    })
  }

  const validation = validateArtistId(rawId)
  if (!validation.success) {
    return res.status(400).json({
      error: 'Bad Request',
      message: validation.error,
    })
  }

  const artist = await getArtistById(validation.data)
  return res.status(200).json(artist)
}
