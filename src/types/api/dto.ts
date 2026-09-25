/**
 * Wire types matching the Express API contracts (maintained by hand, by
 * convention mirror the backend). Only services and mappers may use these.
 */

/** ISO-8601 date string. */
export type IsoDate = string

/** Amounts may arrive as strings or numbers; mappers normalize them to strings. */
export type AmountDto = string | number

export interface AssetDto {
  code: string
  issuer?: string | null
}

export interface MoneyDto {
  amount: AmountDto
  asset: AssetDto
}

export interface UserDto {
  id: string
  name: string
  email: string
  role: string
  emailVerified: boolean
  avatarUrl?: string | null
}

export interface ArtistProfileDto {
  id: string
  userId: string
  displayName: string
  bio?: string | null
  avatarUrl?: string | null
  coverUrl?: string | null
  skills?: string[]
  verified?: boolean
  rating?: number | null
  reviewCount?: number
  createdAt: IsoDate
}

export interface ArtworkDto {
  id: string
  artistId: string
  title: string
  description?: string | null
  category: string
  imageUrls?: string[]
  price: MoneyDto
  status: string
  createdAt: IsoDate
  updatedAt: IsoDate
}

export interface PortfolioItemDto {
  id: string
  artistId: string
  title: string
  description?: string | null
  imageUrls?: string[]
  createdAt: IsoDate
}

export interface OrderDto {
  id: string
  artworkId: string
  buyerId: string
  sellerId: string
  total: MoneyDto
  status: string
  transactionId?: string | null
  createdAt: IsoDate
  updatedAt: IsoDate
}

export interface CommissionDto {
  id: string
  clientId: string
  artistId: string
  title: string
  brief: string
  budget: MoneyDto
  status: string
  deadline?: IsoDate | null
  createdAt: IsoDate
  updatedAt: IsoDate
}

export interface TransactionDto {
  id: string
  hash?: string | null
  type: string
  status: string
  value: MoneyDto
  createdAt: IsoDate
}

export interface ReviewDto {
  id: string
  authorId: string
  artistId: string
  rating: number
  comment?: string | null
  createdAt: IsoDate
}

export interface NotificationDto {
  id: string
  type: string
  title: string
  body?: string | null
  read: boolean
  link?: string | null
  createdAt: IsoDate
}

/** Pagination envelope returned by list endpoints. */
export interface PaginatedResponseDto<T> {
  data: T[]
  page: number
  limit: number
  total: number
}

export interface PaginationQueryDto {
  page?: number
  limit?: number
}

export interface LoginRequestDto {
  email: string
  password: string
}

export interface RegisterRequestDto {
  name: string
  email: string
  password: string
  role: 'artist' | 'client'
}

export interface RefreshTokenRequestDto {
  refreshToken: string
}

export interface AuthTokensDto {
  accessToken: string
  refreshToken?: string | null
}

export interface AuthSessionDto extends AuthTokensDto {
  user: UserDto
}
