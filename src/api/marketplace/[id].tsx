/* eslint-disable react-refresh/only-export-components */
import { validateMarketplaceId } from '@/validators/artist-id.validator'
import type { ApiRequest, ApiResponse } from '../artist/[id]'

/**
 * Mock parameterized database fetch for marketplace listing.
 * Prevents SQL injection by using parameters rather than string concatenation (#940).
 */
export async function getMarketplaceItemById(listingId: string) {
  // Parameterized query simulation:
  // e.g. db.query('SELECT * FROM listings WHERE id = $1', [listingId])
  return {
    id: listingId,
    title: 'Marketplace Listing',
    status: 'active',
  }
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

  const validation = validateMarketplaceId(rawId)
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

  const listing = await getMarketplaceItemById(validation.data)
  return new Response(JSON.stringify(listing), {
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

  const validation = validateMarketplaceId(rawId)
  if (!validation.success) {
    return res.status(400).json({
      error: 'Bad Request',
      message: validation.error,
    })
  }

  const listing = await getMarketplaceItemById(validation.data)
  return res.status(200).json(listing)
}
