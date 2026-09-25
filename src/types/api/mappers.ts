import type {
  AmountDto,
  ArtistProfileDto,
  ArtworkDto,
  CommissionDto,
  MoneyDto,
  NotificationDto,
  OrderDto,
  PaginatedResponseDto,
  PortfolioItemDto,
  ReviewDto,
  TransactionDto,
  UserDto,
} from './dto'
import type {
  ArtistProfile,
  Artwork,
  ArtworkStatus,
  Commission,
  CommissionStatus,
  Money,
  Notification,
  NotificationType,
  Order,
  OrderStatus,
  Paginated,
  PortfolioItem,
  Review,
  Transaction,
  TransactionStatus,
  TransactionType,
  User,
  UserRole,
} from './models'

export function toDate(value: string): Date {
  return new Date(value)
}

/** Normalizes an amount to a decimal string; never does float arithmetic. */
export function toAmount(value: AmountDto): string {
  return typeof value === 'string' ? value.trim() : String(value)
}

/** Narrows an API string to a known enum member, falling back when unknown. */
export function toEnum<T extends string>(value: string, allowed: readonly T[], fallback: T): T {
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback
}

export function mapMoney(dto: MoneyDto): Money {
  return {
    amount: toAmount(dto.amount),
    asset: { code: dto.asset.code, issuer: dto.asset.issuer ?? null },
  }
}

const USER_ROLES = ['artist', 'client'] as const
const ARTWORK_STATUSES = ['draft', 'published', 'sold', 'unpublished'] as const
const ORDER_STATUSES = [
  'pending',
  'paid',
  'delivered',
  'completed',
  'cancelled',
  'refunded',
] as const
const COMMISSION_STATUSES = [
  'requested',
  'accepted',
  'declined',
  'in_progress',
  'delivered',
  'completed',
  'cancelled',
] as const
const TRANSACTION_TYPES = ['payment', 'escrow', 'release', 'refund', 'withdrawal'] as const
const TRANSACTION_STATUSES = ['pending', 'success', 'failed'] as const
const NOTIFICATION_TYPES = [
  'order',
  'commission',
  'payment',
  'review',
  'message',
  'system',
] as const

export function mapUser(dto: UserDto): User {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    role: toEnum<UserRole>(dto.role, USER_ROLES, 'client'),
    emailVerified: dto.emailVerified,
    avatarUrl: dto.avatarUrl ?? null,
  }
}

export function mapArtistProfile(dto: ArtistProfileDto): ArtistProfile {
  return {
    id: dto.id,
    userId: dto.userId,
    displayName: dto.displayName,
    bio: dto.bio ?? '',
    avatarUrl: dto.avatarUrl ?? null,
    coverUrl: dto.coverUrl ?? null,
    skills: dto.skills ?? [],
    verified: dto.verified ?? false,
    rating: dto.rating ?? null,
    reviewCount: dto.reviewCount ?? 0,
    createdAt: toDate(dto.createdAt),
  }
}

export function mapArtwork(dto: ArtworkDto): Artwork {
  return {
    id: dto.id,
    artistId: dto.artistId,
    title: dto.title,
    description: dto.description ?? '',
    category: dto.category,
    imageUrls: dto.imageUrls ?? [],
    price: mapMoney(dto.price),
    status: toEnum<ArtworkStatus>(dto.status, ARTWORK_STATUSES, 'draft'),
    createdAt: toDate(dto.createdAt),
    updatedAt: toDate(dto.updatedAt),
  }
}

export function mapPortfolioItem(dto: PortfolioItemDto): PortfolioItem {
  return {
    id: dto.id,
    artistId: dto.artistId,
    title: dto.title,
    description: dto.description ?? '',
    imageUrls: dto.imageUrls ?? [],
    createdAt: toDate(dto.createdAt),
  }
}

export function mapOrder(dto: OrderDto): Order {
  return {
    id: dto.id,
    artworkId: dto.artworkId,
    buyerId: dto.buyerId,
    sellerId: dto.sellerId,
    total: mapMoney(dto.total),
    status: toEnum<OrderStatus>(dto.status, ORDER_STATUSES, 'pending'),
    transactionId: dto.transactionId ?? null,
    createdAt: toDate(dto.createdAt),
    updatedAt: toDate(dto.updatedAt),
  }
}

export function mapCommission(dto: CommissionDto): Commission {
  return {
    id: dto.id,
    clientId: dto.clientId,
    artistId: dto.artistId,
    title: dto.title,
    brief: dto.brief,
    budget: mapMoney(dto.budget),
    status: toEnum<CommissionStatus>(dto.status, COMMISSION_STATUSES, 'requested'),
    deadline: dto.deadline ? toDate(dto.deadline) : null,
    createdAt: toDate(dto.createdAt),
    updatedAt: toDate(dto.updatedAt),
  }
}

export function mapTransaction(dto: TransactionDto): Transaction {
  return {
    id: dto.id,
    hash: dto.hash ?? null,
    type: toEnum<TransactionType>(dto.type, TRANSACTION_TYPES, 'payment'),
    status: toEnum<TransactionStatus>(dto.status, TRANSACTION_STATUSES, 'pending'),
    value: mapMoney(dto.value),
    createdAt: toDate(dto.createdAt),
  }
}

export function mapReview(dto: ReviewDto): Review {
  return {
    id: dto.id,
    authorId: dto.authorId,
    artistId: dto.artistId,
    rating: dto.rating,
    comment: dto.comment ?? '',
    createdAt: toDate(dto.createdAt),
  }
}

export function mapNotification(dto: NotificationDto): Notification {
  return {
    id: dto.id,
    type: toEnum<NotificationType>(dto.type, NOTIFICATION_TYPES, 'system'),
    title: dto.title,
    body: dto.body ?? '',
    read: dto.read,
    link: dto.link ?? null,
    createdAt: toDate(dto.createdAt),
  }
}

export function mapPaginated<TDto, TModel>(
  dto: PaginatedResponseDto<TDto>,
  mapItem: (item: TDto) => TModel,
): Paginated<TModel> {
  return {
    items: dto.data.map(mapItem),
    page: dto.page,
    pageSize: dto.limit,
    total: dto.total,
    hasNextPage: dto.page * dto.limit < dto.total,
  }
}
