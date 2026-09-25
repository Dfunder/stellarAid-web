/**
 * UI domain models. Services return these (never raw DTOs): dates are `Date`,
 * enums are narrowed unions and money amounts are decimal strings.
 */

export type UserRole = 'artist' | 'client'

/** A Stellar asset. `issuer` is `null` for native XLM. */
export interface Asset {
  code: string
  issuer: string | null
}

/** Money is kept as a decimal string (e.g. `"12.5000000"`) to avoid float errors. */
export interface Money {
  amount: string
  asset: Asset
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  emailVerified: boolean
  avatarUrl: string | null
}

export interface ArtistProfile {
  id: string
  userId: string
  displayName: string
  bio: string
  avatarUrl: string | null
  coverUrl: string | null
  skills: string[]
  verified: boolean
  rating: number | null
  reviewCount: number
  createdAt: Date
}

export type ArtworkStatus = 'draft' | 'published' | 'sold' | 'unpublished'

export interface Artwork {
  id: string
  artistId: string
  title: string
  description: string
  category: string
  imageUrls: string[]
  price: Money
  status: ArtworkStatus
  createdAt: Date
  updatedAt: Date
}

export interface PortfolioItem {
  id: string
  artistId: string
  title: string
  description: string
  imageUrls: string[]
  createdAt: Date
}

export type OrderStatus = 'pending' | 'paid' | 'delivered' | 'completed' | 'cancelled' | 'refunded'

export interface Order {
  id: string
  artworkId: string
  buyerId: string
  sellerId: string
  total: Money
  status: OrderStatus
  transactionId: string | null
  createdAt: Date
  updatedAt: Date
}

export type CommissionStatus =
  'requested' | 'accepted' | 'declined' | 'in_progress' | 'delivered' | 'completed' | 'cancelled'

export interface Commission {
  id: string
  clientId: string
  artistId: string
  title: string
  brief: string
  budget: Money
  status: CommissionStatus
  deadline: Date | null
  createdAt: Date
  updatedAt: Date
}

export type TransactionType = 'payment' | 'escrow' | 'release' | 'refund' | 'withdrawal'
export type TransactionStatus = 'pending' | 'success' | 'failed'

export interface Transaction {
  id: string
  hash: string | null
  type: TransactionType
  status: TransactionStatus
  value: Money
  createdAt: Date
}

export interface Review {
  id: string
  authorId: string
  artistId: string
  rating: number
  comment: string
  createdAt: Date
}

export type NotificationType = 'order' | 'commission' | 'payment' | 'review' | 'message' | 'system'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  body: string
  read: boolean
  link: string | null
  createdAt: Date
}

export interface Paginated<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
  hasNextPage: boolean
}
