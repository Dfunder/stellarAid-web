/**
 * Messaging feature.
 *
 * Direct messaging between users.
 * This barrel is the feature's public API; everything else stays private.
 *
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
