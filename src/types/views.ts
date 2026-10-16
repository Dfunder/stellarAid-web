/**
 * Response contracts for the marketplace/order screens. Each screen used to declare its own copy of these inline; they
 * live here so a backend field rename is fixed in one place. (`models.ts` / `dto.ts` describe the generic entities;
 * these are the flattened shapes the listing, checkout and order endpoints return.)
 */

/** A card in an artwork grid (category pages, "recently viewed"). */
export interface ArtworkCard {
  id: string
  title: string
  thumbnail?: string
  price: string
  asset: string
  sellerName: string
  sellerUsername: string
}

export interface CategorySubCategory {
  slug: string
  name: string
  count: number
}

export interface CategorySummary {
  slug: string
  name: string
  description: string
  image?: string
  subCategories: CategorySubCategory[]
  artworkCount: number
  artistCount: number
}

/** The artwork shown on the checkout page. */
export interface CheckoutArtwork {
  id: string
  title: string
  description: string
  price: string
  asset: string
  acceptedAssets: string[]
  seller: {
    id: string
    name: string
    username: string
    avatarUrl?: string
  }
  licenseTerms: string
  images: string[]
}

export interface CheckoutSession {
  id: string
  artworkId: string
  amount: string
  asset: string
  platformFee: string
  networkFeeEstimate: string
  total: string
  expiresAt: string
}

export interface PurchaseDeliverable {
  id: string
  name: string
  url: string
  expiresAt: string
}

export type PurchaseStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'

/** A row in the buyer's purchase history. */
export interface PurchaseOrder {
  id: string
  artworkTitle: string
  artworkThumbnail?: string
  sellerName: string
  sellerUsername: string
  amount: string
  asset: string
  status: PurchaseStatus
  txHash: string | null
  createdAt: string
  deliverables?: PurchaseDeliverable[]
  failureReason?: string
}
