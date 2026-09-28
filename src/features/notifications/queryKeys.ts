import type { NotificationType } from '@/types'

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters: NotificationFilters = {}) => [...notificationKeys.lists(), filters] as const,
  unreadCount: () => [...notificationKeys.all, 'unreadCount'] as const,
}

/**
 * List filters. Kept as a plain object so it can be a stable part of a query
 * key: React Query hashes the key, and two calls with equal filters hit the
 * same cache entry.
 */
export interface NotificationFilters {
  /** Narrows to specific kinds; omitted or empty means every kind. */
  types?: readonly NotificationType[]
  /** Restricts to unread (`true`) or already-read (`false`) notifications. */
  read?: boolean
  page?: number
  pageSize?: number
}
