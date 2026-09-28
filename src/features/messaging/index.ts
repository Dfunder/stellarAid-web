/**
 * Messaging feature.
 *
 * Direct messaging between users.
 * This barrel is the feature's public API; everything else stays private.
 *
 * Type note: `ConversationMessage` is declared in `conversation.ts` rather than
 * a shared `types.ts`, so this view can land on its own. If a message composer
 * lands first and introduces a shared type, the two should be reconciled into
 * one shape instead of kept in parallel.
 */
export { default as ThreadConversationView } from './components/ThreadConversationView'
export type { ThreadConversationViewProps } from './components/ThreadConversationView'
export { messageKeys } from './queryKeys'
export {
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
} from './conversation'
export type { ConversationMessage, DaySegment } from './conversation'
