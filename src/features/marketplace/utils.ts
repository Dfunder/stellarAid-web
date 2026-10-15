import { z } from 'zod'

/**
 * Shared marketplace form/validation helpers (#776, #777).
 *
 * zod v4 removed the `err.errors` alias in favour of `err.issues`; the
 * helpers here are the one place that mapping lives.
 */

/** Form values for the edit form, derived from a server listing. */
export interface ListingFormValues {
  title: string
  description: string
  category: string
  tags: string[]
  price: string
  asset: 'XLM' | 'USDC' | 'NGNT' | 'EURC'
  licenseTerms: string
  images: string[]
}

interface ListingPayload {
  title: string
  description: string
  category: string
  tags: string[]
  price: string
  asset: string
  licenseTerms: string
  images: string[]
}

/**
 * Maps a server listing onto the edit form's shape. Kept out of the
 * component so the population step is a pure function (the form used to be
 * populated inside a `useState` lazy initializer, which ran once while the
 * async query was still undefined — #776).
 */
export function listingToFormValues(listing: ListingPayload): ListingFormValues {
  return {
    title: listing.title,
    description: listing.description,
    category: listing.category,
    tags: listing.tags,
    price: listing.price,
    asset: listing.asset as ListingFormValues['asset'],
    licenseTerms: listing.licenseTerms,
    images: listing.images,
  }
}

/**
 * First validation message from a zod error (#777).
 *
 * Uses `issues` (the zod v4 name); an empty-string message still falls back
 * so the UI never renders a blank validation error.
 */
export function firstZodMessage(error: unknown, fallback = 'Invalid value'): string {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message || fallback
  }
  return fallback
}
