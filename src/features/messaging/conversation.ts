import { formatShortDate } from '@/lib'

/**
 * A message as the conversation view needs it.
 *
 * Declared locally rather than imported from a shared `types.ts` so the view
 * can be dropped into the router on its own; see the note in `index.ts` about
 * reconciling this with the composer types.
 */
export interface ConversationMessage {
  id: string
  senderId: string
  /** Display name of the sender, already resolved by the caller. */
  senderName: string
  body: string
  createdAt: Date
}

/** One day's worth of messages, with the separator that precedes them. */
export interface DaySegment {
  /** Stable `YYYY-MM-DD` key in the viewer's zone. */
  key: string
  /** Text for the separator: `Today`, `Yesterday`, or a formatted date. */
  label: string
  messages: ConversationMessage[]
}

/**
 * How often the thread refetches while it is on screen.
 *
 * The acceptance criterion is that a new message appears within a known
 * cadence, so the interval is a named budget rather than a number picked by
 * feel. React Query may deliver a poll slightly after the interval elapses, so
 * the constant stays inside {@link MAX_REFRESH_LATENCY_MS}.
 */
export const POLL_INTERVAL_MS = 15_000

/** Upper bound the cadence is allowed to drift to before a response is late. */
export const MAX_REFRESH_LATENCY_MS = 30_000

/**
 * How close to the bottom the user must be for the view to keep auto-scrolling.
 *
 * Without this, reading scrollback yanks the user back to the newest message
 * every time a poll lands.
 */
export const STICK_TO_BOTTOM_THRESHOLD_PX = 120

/**
 * Poll interval for the current view state.
 *
 * Returns `false` to stop polling, which is what React Query expects for a
 * disabled `refetchInterval`. Polling pauses while the tab is hidden and while
 * the user is not looking at the thread, so a backgrounded tab does not keep
 * hitting the API.
 */
export function pollIntervalFor(options: { isFocused: boolean; isActive: boolean }): number | false {
  if (!options.isActive) return false
  if (!options.isFocused) return false
  return POLL_INTERVAL_MS
}

/** Stable `YYYY-MM-DD` key for a date, in the viewer's own zone. */
export function dayKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Separator text for a day key.
 *
 * `now` is injected so the result is deterministic in tests, and so a caller
 * can re-derive the labels when the tab is left open across midnight.
 */
export function dayLabel(key: string, now: Date): string {
  if (key === dayKey(now)) return 'Today'

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (key === dayKey(yesterday)) return 'Yesterday'

  const [year, month, day] = key.split('-').map(Number)
  if (!year || !month || !day) return key
  return formatShortDate(new Date(year, month - 1, day).toISOString())
}

/**
 * Splits a thread into day segments, oldest day first.
 *
 * Input order does not matter; messages are sorted oldest-first, which is the
 * order the transcript renders top-to-bottom. Messages with an unparseable
 * timestamp are dropped rather than placed in a bogus "Invalid date" segment.
 */
export function groupMessagesByDay(messages: readonly ConversationMessage[], now: Date): DaySegment[] {
  const valid = messages
    .filter((message) => message.createdAt instanceof Date && !Number.isNaN(message.createdAt.getTime()))
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

  const segments: DaySegment[] = []
  for (const message of valid) {
    const key = dayKey(message.createdAt)
    const current = segments[segments.length - 1]
    if (current && current.key === key) {
      current.messages.push(message)
      continue
    }
    segments.push({ key, label: dayLabel(key, now), messages: [message] })
  }
  return segments
}

/**
 * Keeps the reader's place when older messages are prepended.
 *
 * Prepending grows the content above the viewport by `heightAfter -
 * heightBefore`. Scrolling by exactly that much keeps the message the user was
 * looking at under the same pixel, which is the whole of the acceptance
 * criterion "history pagination does not jump scroll position". Naively
 * restoring the old `scrollTop` instead snaps the view to a different message.
 */
export function preserveScrollTop(
  scrollTop: number,
  heightBefore: number,
  heightAfter: number,
): number {
  const growth = heightAfter - heightBefore
  return Math.max(0, scrollTop + growth)
}

/** Distance from the bottom of the content, floored at zero. */
export function distanceFromBottom(
  scrollTop: number,
  viewportHeight: number,
  contentHeight: number,
): number {
  return Math.max(0, contentHeight - viewportHeight - scrollTop)
}

/**
 * Whether the view should keep the newest message in view.
 *
 * True only while the user is already at (or near) the bottom, so auto-scroll
 * never fights someone who has scrolled up to read history.
 */
export function shouldStickToBottom(
  scrollTop: number,
  viewportHeight: number,
  contentHeight: number,
  threshold: number = STICK_TO_BOTTOM_THRESHOLD_PX,
): boolean {
  return distanceFromBottom(scrollTop, viewportHeight, contentHeight) <= threshold
}

/** Time formatted for a bubble, e.g. `14:05`. */
export function formatMessageTime(date: Date): string {
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}
