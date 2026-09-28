import { describe, expect, it } from 'vitest'
import {
  MAX_REFRESH_LATENCY_MS,
  POLL_INTERVAL_MS,
  STICK_TO_BOTTOM_THRESHOLD_PX,
  dayKey,
  dayLabel,
  distanceFromBottom,
  formatMessageTime,
  groupMessagesByDay,
  pollIntervalFor,
  preserveScrollTop,
  shouldStickToBottom,
  type ConversationMessage,
} from './conversation'

const NOW = new Date(2026, 2, 15, 14, 30) // 15 Mar 2026, local zone

function message(id: string, createdAt: Date, overrides: Partial<ConversationMessage> = {}): ConversationMessage {
  return {
    id,
    senderId: 'u1',
    senderName: 'Ada',
    body: `message ${id}`,
    createdAt,
    ...overrides,
  }
}

describe('polling cadence', () => {
  it('keeps a new message within the stated latency budget', () => {
    expect(POLL_INTERVAL_MS).toBeGreaterThan(0)
    expect(POLL_INTERVAL_MS).toBeLessThanOrEqual(MAX_REFRESH_LATENCY_MS)
  })

  it('polls while the thread is focused and active', () => {
    expect(pollIntervalFor({ isFocused: true, isActive: true })).toBe(POLL_INTERVAL_MS)
  })

  it('stops polling in a hidden tab or an inactive thread', () => {
    expect(pollIntervalFor({ isFocused: false, isActive: true })).toBe(false)
    expect(pollIntervalFor({ isFocused: true, isActive: false })).toBe(false)
    expect(pollIntervalFor({ isFocused: false, isActive: false })).toBe(false)
  })
})

describe('dayKey', () => {
  it('is zero-padded and sortable', () => {
    expect(dayKey(new Date(2026, 0, 5))).toBe('2026-01-05')
    expect(dayKey(new Date(2026, 11, 31))).toBe('2026-12-31')
  })
})

describe('dayLabel', () => {
  it('labels today and yesterday relatively', () => {
    expect(dayLabel(dayKey(NOW), NOW)).toBe('Today')
    expect(dayLabel(dayKey(new Date(2026, 2, 14, 23, 59)), NOW)).toBe('Yesterday')
  })

  it('falls back to a formatted date for older days', () => {
    expect(dayLabel('2026-01-05', NOW)).not.toBe('Today')
    expect(dayLabel('2026-01-05', NOW)).toContain('2026')
  })

  it('returns the key itself when it cannot be parsed', () => {
    expect(dayLabel('not-a-date', NOW)).toBe('not-a-date')
  })

  it('handles a month boundary', () => {
    const firstOfMonth = new Date(2026, 2, 1, 9, 0)
    expect(dayLabel(dayKey(new Date(2026, 1, 28)), firstOfMonth)).toBe('Yesterday')
  })
})

describe('groupMessagesByDay', () => {
  it('splits a thread into one segment per day, oldest first', () => {
    const segments = groupMessagesByDay(
      [
        message('c', new Date(2026, 2, 15, 12, 0)),
        message('a', new Date(2026, 2, 14, 9, 0)),
        message('b', new Date(2026, 2, 14, 10, 0)),
      ],
      NOW,
    )

    expect(segments.map((segment) => segment.key)).toEqual(['2026-03-14', '2026-03-15'])
    expect(segments[0]?.messages.map((m) => m.id)).toEqual(['a', 'b'])
    expect(segments[1]?.label).toBe('Today')
    expect(segments[0]?.label).toBe('Yesterday')
  })

  it('orders messages within a day oldest first regardless of input order', () => {
    const [segment] = groupMessagesByDay(
      [message('late', new Date(2026, 2, 15, 18, 0)), message('early', new Date(2026, 2, 15, 8, 0))],
      NOW,
    )
    expect(segment?.messages.map((m) => m.id)).toEqual(['early', 'late'])
  })

  it('returns nothing for an empty thread', () => {
    expect(groupMessagesByDay([], NOW)).toEqual([])
  })

  it('drops a message with an unparseable timestamp instead of grouping it wrongly', () => {
    const segments = groupMessagesByDay(
      [message('bad', new Date('nonsense')), message('good', new Date(2026, 2, 15, 8, 0))],
      NOW,
    )
    expect(segments).toHaveLength(1)
    expect(segments[0]?.messages.map((m) => m.id)).toEqual(['good'])
  })

  it('does not mutate the caller array', () => {
    const list = [message('b', new Date(2026, 2, 15, 12, 0)), message('a', new Date(2026, 2, 14, 9, 0))]
    groupMessagesByDay(list, NOW)
    expect(list.map((m) => m.id)).toEqual(['b', 'a'])
  })

  it('keeps two days separate across a month boundary', () => {
    const segments = groupMessagesByDay(
      [message('a', new Date(2026, 2, 31, 23, 59)), message('b', new Date(2026, 3, 1, 0, 1))],
      new Date(2026, 3, 1, 12, 0),
    )
    expect(segments.map((segment) => segment.key)).toEqual(['2026-03-31', '2026-04-01'])
  })
})

describe('preserveScrollTop', () => {
  it('keeps the reader in place when older messages are prepended', () => {
    // Content grew 400px above the viewport; scrolling by 400px holds the
    // same message under the same pixel.
    expect(preserveScrollTop(300, 2000, 2400)).toBe(700)
  })

  it('does not move when the height is unchanged', () => {
    expect(preserveScrollTop(300, 2000, 2000)).toBe(300)
  })

  it('never returns a negative position', () => {
    expect(preserveScrollTop(10, 2000, 1000)).toBe(0)
  })

  it('holds the anchor at the top of the thread', () => {
    expect(preserveScrollTop(0, 2000, 2400)).toBe(400)
  })
})

describe('distanceFromBottom', () => {
  it('is zero at the bottom and negative-safe past it', () => {
    expect(distanceFromBottom(1000, 500, 1500)).toBe(0)
    expect(distanceFromBottom(1200, 500, 1500)).toBe(0)
  })

  it('reports the remaining distance when scrolled up', () => {
    expect(distanceFromBottom(0, 500, 1500)).toBe(1000)
  })
})

describe('shouldStickToBottom', () => {
  it('sticks while the user is at the bottom', () => {
    expect(shouldStickToBottom(1000, 500, 1500)).toBe(true)
  })

  it('sticks within the threshold so a small bounce does not unstick', () => {
    const justInside = 1500 - 500 - (STICK_TO_BOTTOM_THRESHOLD_PX - 1)
    expect(shouldStickToBottom(justInside, 500, 1500)).toBe(true)
  })

  it('does not fight a user who scrolled up to read history', () => {
    const farUp = 1500 - 500 - (STICK_TO_BOTTOM_THRESHOLD_PX + 50)
    expect(shouldStickToBottom(farUp, 500, 1500)).toBe(false)
  })

  it('honours a custom threshold', () => {
    expect(shouldStickToBottom(0, 500, 1500, 2000)).toBe(true)
  })
})

describe('formatMessageTime', () => {
  it('renders a time for a valid date', () => {
    expect(formatMessageTime(new Date(2026, 2, 15, 14, 5))).toMatch(/\d{1,2}:\d{2}/)
  })

  it('renders nothing for an invalid date rather than "Invalid Date"', () => {
    expect(formatMessageTime(new Date('nonsense'))).toBe('')
  })
})
