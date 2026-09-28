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
 * Integration seam: the repository has no messaging backend yet. The composer
 * therefore takes its transport as the `sender` prop and ships no API client of
 * its own, so the module is usable and fully testable today and a future
 * transport only has to satisfy `MessageSender`.
 */
export { default as MessageComposer } from './components/MessageComposer'
export type { MessageComposerProps } from './components/MessageComposer'
export { useMessageComposer } from './hooks/useMessageComposer'
export type { UseMessageComposer } from './hooks/useMessageComposer'
export { messageKeys } from './queryKeys'
export type {
  LinkPreview,
  Message,
  MessageAttachment,
  MessageComposerOptions,
  MessageDraft,
  MessageSender,
  MessageStatus,
} from './types'
export {
  MAX_ATTACHMENTS,
  MAX_MESSAGE_LENGTH,
  appendPending,
  canSend,
  confirmPending,
  createPendingMessage,
  dismissMessage,
  extractLinkPreview,
  failPending,
  formatAttachmentSize,
  isSafePreviewUrl,
  normalizeAttachments,
  normalizeBody,
  remainingLength,
  retryPending,
  retryableIds,
  sendIntentForKey,
  truncateAttachmentName,
} from './utils'
export type { SendIntent } from './utils'
