import { http } from '@/services'
import { mapNotification, mapPaginated } from '@/types'
import type { Notification, NotificationDto, Paginated, PaginatedResponseDto } from '@/types'
import type { NotificationFilters } from '../queryKeys'

/**
 * Notification endpoints.
 *
 * DTOs are mapped to models with the shared `mapNotification` /
 * `mapPaginated` helpers, so this feature never hands a raw wire type to the
 * UI. `createdAt` becomes a `Date` and an unknown `type` narrows to `system`
 * rather than leaking through unchecked.
 */
export const notificationApi = {
  /** One page of notifications, newest first. */
  list(filters: NotificationFilters = {}): Promise<Paginated<Notification>> {
    return http
      .get<PaginatedResponseDto<NotificationDto>>('/notifications', {
        params: {
          page: filters.page ?? 1,
          limit: filters.pageSize,
          types: filters.types?.length ? filters.types.join(',') : undefined,
          read: filters.read,
        },
      })
      .then((dto) => mapPaginated(dto, mapNotification))
  },

  /** Server-side unread total, used by the badge. */
  unreadCount(): Promise<{ count: number }> {
    return http.get<{ count: number }>('/notifications/unread-count')
  },

  /** Marks one notification read or unread. */
  setRead(id: string, read: boolean): Promise<void> {
    return http.patch<void>(`/notifications/${encodeURIComponent(id)}`, { read })
  },

  /** Marks every unread notification read. */
  markAllRead(): Promise<void> {
    return http.post<void>('/notifications/read-all')
  },
}
