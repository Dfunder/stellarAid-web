import type { Notification, NotificationType, Paginated } from '@/types'
import type { NotificationFilters } from './queryKeys'

/**
 * How often the unread badge refetches.
 *
 * The acceptance criterion is that the count stays within 30s of the server's
 * truth, so the poll interval is derived from that budget rather than picked by
 * feel: a refetch that starts at t=30s may resolve just after the next one is
 * due, so the interval sits slightly inside the budget.
 */
export const UNREAD_POLL_INTERVAL_MS = 30_000

/** Every kind the API can report, in the order the filter UI lists them. */
export const NOTIFICATION_KINDS: readonly NotificationType[] = [
  'order',
  'commission',
  'payment',
  'review',
  'message',
  'system',
] as const

/** Per-kind label and grouping, so surfaces do not each invent their own copy. */
export const NOTIFICATION_KIND_LABELS: Record<NotificationType, string> = {
  order: 'Orders',
  commission: 'Commissions',
  payment: 'Payments',
  review: 'Reviews',
  message: 'Messages',
  system: 'System',
}

/** Number of unread notifications in a list. */
export function countUnread(notifications: readonly Notification[]): number {
  return notifications.reduce((total, notification) => (notification.read ? total : total + 1), 0)
}

/**
 * Removes duplicate ids, keeping the first occurrence.
 *
 * A refetch that races with an optimistic cache write can hand back the same
 * notification twice - once from the server page and once from the optimistic
 * entry. Deduping on read keeps that out of the rendered list.
 */
export function dedupeById(notifications: readonly Notification[]): Notification[] {
  const seen = new Set<string>()
  const result: Notification[] = []
  for (const notification of notifications) {
    if (seen.has(notification.id)) continue
    seen.add(notification.id)
    result.push(notification)
  }
  return result
}

/**
 * Replaces a page's contents while preserving order and dropping duplicates.
 *
 * A server page is authoritative, so its entries are appended after the
 * already-cached ones only when the id is genuinely new; the result is then
 * sorted newest-first, which is the order every notification surface renders.
 */
export function mergePage(
  cached: readonly Notification[],
  incoming: readonly Notification[],
): Notification[] {
  const merged = dedupeById([...cached, ...incoming])
  return merged.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

/** Applies a read flag to the listed ids, leaving every other entry untouched. */
export function applyReadState(
  notifications: readonly Notification[],
  ids: readonly string[],
  read: boolean,
): Notification[] {
  const targets = new Set(ids)
  return notifications.map((notification) =>
    targets.has(notification.id) && notification.read !== read
      ? { ...notification, read }
      : notification,
  )
}

/** Whether a notification belongs to the given filters. */
export function matchesFilters(
  notification: Notification,
  filters: NotificationFilters = {},
): boolean {
  const types = filters.types
  if (types && types.length > 0 && !types.includes(notification.type)) return false
  if (filters.read !== undefined && notification.read !== filters.read) return false
  return true
}

/**
 * Client-side narrowing for filters the API does not support.
 *
 * Server-side filtering is the source of truth; this is for the filters that
 * have to stay responsive while a page is in flight, and it never widens a
 * result the server already narrowed.
 */
export function filterNotifications(
  notifications: readonly Notification[],
  filters: NotificationFilters = {},
): Notification[] {
  return notifications.filter((notification) => matchesFilters(notification, filters))
}

/** Ids of every notification in a page that is currently unread. */
export function unreadIds(notifications: readonly Notification[]): string[] {
  return notifications.filter((notification) => !notification.read).map((notification) => notification.id)
}

/**
 * Applies a read flag across every cached page.
 *
 * The unread badge, the list and any per-page view all read from different
 * query keys, so an optimistic write has to touch all of them or the surfaces
 * disagree until the next refetch. Pages that contain none of the ids are
 * returned by reference so React Query can skip the re-render.
 */
export function applyReadToPages(
  pages: readonly Paginated<Notification>[],
  ids: readonly string[],
  read: boolean,
): Paginated<Notification>[] {
  return pages.map((page) => {
    const items = applyReadState(page.items, ids, read)
    const changed = items.some((item, index) => item !== page.items[index])
    return changed ? { ...page, items } : page
  })
}

/**
 * Adjusts the unread total by the change observed in the cached pages.
 *
 * Deriving the delta from what the cache actually held avoids the classic
 * optimistic-update bug where the badge goes negative because a notification
 * was already read server-side.
 */
export function adjustUnreadCount(
  current: number,
  pages: readonly Paginated<Notification>[],
  ids: readonly string[],
  read: boolean,
): number {
  const targets = new Set(ids)
  let before = 0
  let after = 0

  for (const page of pages) {
    for (const notification of page.items) {
      if (!targets.has(notification.id)) continue
      if (!notification.read) before += 1
      if (!read) after += 1
    }
  }

  return Math.max(0, current + (after - before))
}

/** An empty page with the shape the hooks and views expect. */
export function emptyPage(filters: NotificationFilters = {}): Paginated<Notification> {
  return {
    items: [],
    page: filters.page ?? 1,
    pageSize: filters.pageSize ?? DEFAULT_PAGE_SIZE,
    total: 0,
    hasNextPage: false,
  }
}

export const DEFAULT_PAGE_SIZE = 20
