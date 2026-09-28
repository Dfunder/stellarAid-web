import { describe, expect, it } from 'vitest'
import type { Notification, NotificationType, Paginated } from '@/types'
import {
  DEFAULT_PAGE_SIZE,
  NOTIFICATION_KINDS,
  NOTIFICATION_KIND_LABELS,
  UNREAD_POLL_INTERVAL_MS,
  adjustUnreadCount,
  applyReadState,
  applyReadToPages,
  countUnread,
  dedupeById,
  emptyPage,
  filterNotifications,
  matchesFilters,
  mergePage,
  unreadIds,
} from './utils'

function makeNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: 'n1',
    type: 'order',
    title: 'Order shipped',
    body: 'Your order is on its way',
    read: false,
    link: null,
    createdAt: new Date('2026-01-01T10:00:00.000Z'),
    ...overrides,
  }
}

function page(items: Notification[], overrides: Partial<Paginated<Notification>> = {}): Paginated<Notification> {
  return { items, page: 1, pageSize: DEFAULT_PAGE_SIZE, total: items.length, hasNextPage: false, ...overrides }
}

describe('notification kind metadata', () => {
  it('covers every kind the mapper can produce', () => {
    // `mapNotification` narrows an unknown wire type to 'system', so the
    // feature must have metadata for all six possible outcomes.
    expect([...NOTIFICATION_KINDS].sort()).toEqual(
      ['commission', 'message', 'order', 'payment', 'review', 'system'].sort(),
    )
  })

  it('has a label for every kind', () => {
    for (const kind of NOTIFICATION_KINDS) {
      expect(NOTIFICATION_KIND_LABELS[kind]).toBeTruthy()
    }
  })
})

describe('countUnread', () => {
  it('counts only unread notifications', () => {
    expect(
      countUnread([
        makeNotification({ id: 'a' }),
        makeNotification({ id: 'b', read: true }),
        makeNotification({ id: 'c' }),
      ]),
    ).toBe(2)
  })

  it('is zero for an empty list', () => {
    expect(countUnread([])).toBe(0)
  })
})

describe('unreadIds', () => {
  it('returns only the unread ids, in order', () => {
    expect(
      unreadIds([
        makeNotification({ id: 'a' }),
        makeNotification({ id: 'b', read: true }),
        makeNotification({ id: 'c' }),
      ]),
    ).toEqual(['a', 'c'])
  })
})

describe('dedupeById', () => {
  it('keeps the first occurrence of a repeated id', () => {
    const first = makeNotification({ id: 'a', title: 'first' })
    const second = makeNotification({ id: 'a', title: 'second' })
    const result = dedupeById([first, makeNotification({ id: 'b' }), second])

    expect(result).toHaveLength(2)
    expect(result[0]?.title).toBe('first')
  })

  it('leaves a unique list untouched', () => {
    const list = [makeNotification({ id: 'a' }), makeNotification({ id: 'b' })]
    expect(dedupeById(list)).toEqual(list)
  })
})

describe('mergePage', () => {
  it('never produces a duplicate after a refetch', () => {
    const cached = [makeNotification({ id: 'a' }), makeNotification({ id: 'b' })]
    const refetched = [makeNotification({ id: 'a' }), makeNotification({ id: 'b' }), makeNotification({ id: 'c' })]

    const result = mergePage(cached, refetched)
    expect(result).toHaveLength(3)
    expect(new Set(result.map((n) => n.id)).size).toBe(3)
  })

  it('orders newest first', () => {
    const older = makeNotification({ id: 'old', createdAt: new Date('2026-01-01T09:00:00.000Z') })
    const newer = makeNotification({ id: 'new', createdAt: new Date('2026-01-01T11:00:00.000Z') })
    expect(mergePage([older], [newer]).map((n) => n.id)).toEqual(['new', 'old'])
  })

  it('does not mutate its inputs', () => {
    const cached = [makeNotification({ id: 'a' })]
    mergePage(cached, [makeNotification({ id: 'b' })])
    expect(cached).toHaveLength(1)
  })
})

describe('applyReadState', () => {
  it('marks the listed ids and leaves the rest untouched', () => {
    const list = [makeNotification({ id: 'a' }), makeNotification({ id: 'b' }), makeNotification({ id: 'c', read: true })]
    const result = applyReadState(list, ['a', 'c'], true)

    expect(result.map((n) => n.read)).toEqual([true, false, true])
  })

  it('supports marking unread again', () => {
    const list = [makeNotification({ id: 'a', read: true })]
    expect(applyReadState(list, ['a'], false)[0]?.read).toBe(false)
  })

  it('ignores unknown ids', () => {
    const list = [makeNotification({ id: 'a' })]
    expect(applyReadState(list, ['missing'], true)).toEqual(list)
  })

  it('does not mutate the input list', () => {
    const list = [makeNotification({ id: 'a' })]
    applyReadState(list, ['a'], true)
    expect(list[0]?.read).toBe(false)
  })
})

describe('applyReadToPages', () => {
  it('updates every page that contains a listed id', () => {
    const pages = [
      page([makeNotification({ id: 'a' }), makeNotification({ id: 'b' })]),
      page([makeNotification({ id: 'c' })], { page: 2 }),
    ]
    const result = applyReadToPages(pages, ['a', 'c'], true)

    expect(result[0]?.items.map((n) => n.read)).toEqual([true, false])
    expect(result[1]?.items.map((n) => n.read)).toEqual([true])
  })

  it('returns an unchanged page by reference so React Query can skip the re-render', () => {
    const pages = [page([makeNotification({ id: 'a' })])]
    expect(applyReadToPages(pages, ['missing'], true)[0]).toBe(pages[0])
  })

  it('keeps each page identity for a matching id and preserves pagination fields', () => {
    const pages = [page([makeNotification({ id: 'a' })], { page: 3, total: 42, hasNextPage: true })]
    const [updated] = applyReadToPages(pages, ['a'], true)

    expect(updated).not.toBe(pages[0])
    expect(updated?.page).toBe(3)
    expect(updated?.total).toBe(42)
    expect(updated?.hasNextPage).toBe(true)
  })
})

describe('adjustUnreadCount', () => {
  it('decrements by the number that were actually unread', () => {
    const pages = [page([makeNotification({ id: 'a' }), makeNotification({ id: 'b', read: true })])]
    expect(adjustUnreadCount(7, pages, ['a', 'b'], true)).toBe(6)
  })

  it('never goes negative when the cache is behind the server', () => {
    const pages = [page([makeNotification({ id: 'a' })])]
    expect(adjustUnreadCount(0, pages, ['a'], true)).toBe(0)
  })

  it('is a no-op for ids that were not cached', () => {
    const pages = [page([makeNotification({ id: 'a' })])]
    expect(adjustUnreadCount(5, pages, ['missing'], true)).toBe(5)
  })

  it('increments when marking unread', () => {
    const pages = [page([makeNotification({ id: 'a', read: true })])]
    expect(adjustUnreadCount(5, pages, ['a'], false)).toBe(6)
  })
})

describe('filtering', () => {
  const list = [
    makeNotification({ id: 'a', type: 'order' as NotificationType }),
    makeNotification({ id: 'b', type: 'message' as NotificationType, read: true }),
    makeNotification({ id: 'c', type: 'system' as NotificationType }),
  ]

  it('matches every notification when no filter is given', () => {
    expect(matchesFilters(list[0]!, {})).toBe(true)
  })

  it('narrows by kind', () => {
    expect(filterNotifications(list, { types: ['order', 'system'] }).map((n) => n.id)).toEqual(['a', 'c'])
  })

  it('narrows by read state', () => {
    expect(filterNotifications(list, { read: false }).map((n) => n.id)).toEqual(['a', 'c'])
    expect(filterNotifications(list, { read: true }).map((n) => n.id)).toEqual(['b'])
  })

  it('combines kind and read state', () => {
    expect(filterNotifications(list, { types: ['message'], read: true }).map((n) => n.id)).toEqual(['b'])
  })

  it('treats an empty type list as "every kind"', () => {
    expect(filterNotifications(list, { types: [] })).toHaveLength(3)
  })
})

describe('freshness budget', () => {
  it('polls inside the 30s acceptance budget', () => {
    expect(UNREAD_POLL_INTERVAL_MS).toBeLessThanOrEqual(30_000)
    expect(UNREAD_POLL_INTERVAL_MS).toBeGreaterThan(0)
  })
})

describe('emptyPage', () => {
  it('uses the supplied pagination and reports no next page', () => {
    expect(emptyPage({ page: 4, pageSize: 5 })).toEqual({
      items: [],
      page: 4,
      pageSize: 5,
      total: 0,
      hasNextPage: false,
    })
  })

  it('falls back to the default page size', () => {
    expect(emptyPage().pageSize).toBe(DEFAULT_PAGE_SIZE)
    expect(emptyPage().page).toBe(1)
  })
})
