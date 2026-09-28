import type { LinkPreview, Message, MessageAttachment, MessageDraft } from './types'

/** Longest body the composer will send, mirroring the API's column limit. */
export const MAX_MESSAGE_LENGTH = 2000

/** Attachment chips beyond this are ignored rather than rendering unbounded UI. */
export const MAX_ATTACHMENTS = 4

/** Longest attachment label rendered; the rest is elided. */
const MAX_ATTACHMENT_NAME_LENGTH = 60

/**
 * Schemes a preview link may navigate to.
 *
 * A message body is attacker-controlled whenever a thread involves someone the
 * user does not know, so a preview must never become a `javascript:` or
 * `data:` navigation. Anything not on this list renders as text with no link.
 */
const SAFE_PROTOCOLS = new Set(['http:', 'https:'])

/** Bare-domain candidate (`www.`) or explicit URL. Stops at whitespace and markup. */
const URL_PATTERN = /(?:https?:\/\/|www\.)[^\s<>"'`]+/i

/** Punctuation that commonly ends a sentence rather than a URL. */
const TRAILING_PUNCTUATION = /[.,;:!?)\]}'"]+$/

export type SendIntent = 'send' | 'newline' | 'ignore'

/**
 * Decides what Enter means inside the composer.
 *
 * - Plain <kbd>Enter</kbd> sends; <kbd>Shift</kbd>+<kbd>Enter</kbd> inserts a newline.
 * - While an IME candidate window is open, Enter *confirms the candidate* and
 *   must never send. Without this guard, composing Japanese or Chinese text
 *   would post a half-finished word.
 */
export function sendIntentForKey(key: string, shiftKey: boolean, isComposing: boolean): SendIntent {
  if (isComposing) return 'ignore'
  if (key !== 'Enter') return 'ignore'
  return shiftKey ? 'newline' : 'send'
}

/** Trims a draft body for sending. Returns `''` for whitespace-only input. */
export function normalizeBody(body: string): string {
  return body.replace(/\r\n/g, '\n').trim()
}

/**
 * Whether a draft may be sent: it must carry text and fit the length limit.
 *
 * Whitespace-only input is rejected, so a stray space or newline can never
 * create an empty message.
 */
export function canSend(body: string): boolean {
  const normalized = normalizeBody(body)
  return normalized.length > 0 && normalized.length <= MAX_MESSAGE_LENGTH
}

/** Remaining characters the composer will accept, floored at zero. */
export function remainingLength(body: string): number {
  return Math.max(0, MAX_MESSAGE_LENGTH - normalizeBody(body).length)
}

/**
 * Whether a raw URL may be used as an `href`.
 *
 * Rejects unparseable input, any scheme outside {@link SAFE_PROTOCOLS}, and
 * embedded credentials (`https://user:pass@host`), which are both a phishing
 * vector and a way to leak a secret through a link the user did not write.
 */
export function isSafePreviewUrl(raw: string): boolean {
  const trimmed = raw.trim()
  if (trimmed === '') return false

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return false
  }

  if (!SAFE_PROTOCOLS.has(parsed.protocol)) return false
  return parsed.username === '' && parsed.password === ''
}

function toAbsoluteUrl(raw: string): string {
  // A bare `www.` host has no scheme, so `new URL` cannot parse it. Assume
  // https rather than http: never upgrade a guess into a plaintext request.
  return /^www\./i.test(raw) ? `https://${raw}` : raw
}

/**
 * Extracts preview metadata for the first link in a body.
 *
 * Returns `null` when the body contains no link. Returns a preview whose
 * `href` is `null` when the link is unsafe to navigate to, so the caller can
 * still show the URL as text instead of dropping the information.
 */
export function extractLinkPreview(body: string): LinkPreview | null {
  const match = URL_PATTERN.exec(body)
  const candidate = match?.[0] ?? ''
  const url = candidate.replace(TRAILING_PUNCTUATION, '')
  if (url === '') return null

  const absolute = toAbsoluteUrl(url)
  return { url, href: isSafePreviewUrl(absolute) ? absolute : null }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== ''
}

/**
 * Coerces an untrusted attachment payload into renderable chips.
 *
 * The backend contract is not implemented yet, so this is deliberately
 * defensive: anything that is not the expected primitive shape is dropped
 * rather than rendered, a hostile scheme never becomes a link, and the list is
 * capped so a malformed payload cannot produce unbounded UI.
 */
export function normalizeAttachments(payload: unknown): MessageAttachment[] {
  if (!Array.isArray(payload)) return []

  const attachments: MessageAttachment[] = []
  for (const entry of payload) {
    if (attachments.length >= MAX_ATTACHMENTS) break
    if (typeof entry !== 'object' || entry === null) continue

    const record = entry as Record<string, unknown>
    if (!isNonEmptyString(record.id) || !isNonEmptyString(record.name)) continue
    if (!isNonEmptyString(record.url) || !isSafePreviewUrl(record.url)) continue

    const size = typeof record.size === 'number' ? record.size : Number(record.size)
    const contentType = isNonEmptyString(record.contentType) ? record.contentType : 'application/octet-stream'

    attachments.push({
      id: record.id,
      name: truncateAttachmentName(record.name),
      size: Number.isFinite(size) && size > 0 ? size : 0,
      contentType,
      url: record.url,
    })
  }

  return attachments
}

/** Shortens an attachment label for a single-line chip. */
export function truncateAttachmentName(name: string): string {
  const normalized = name.replace(/\s+/g, ' ').trim()
  if (normalized.length <= MAX_ATTACHMENT_NAME_LENGTH) return normalized
  return `${normalized.slice(0, MAX_ATTACHMENT_NAME_LENGTH - 1)}\u2026`
}

const UNITS = ['B', 'KB', 'MB', 'GB'] as const

/** Formats a byte count for a chip, e.g. `1.4 MB`. */
export function formatAttachmentSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'

  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024
    unit += 1
  }
  return unit === 0 ? `${Math.round(value)} ${UNITS[0]}` : `${value.toFixed(1)} ${UNITS[unit]}`
}

/** Chat order: oldest first. Ties keep insertion order, so it stays stable. */
function sortByCreatedAt(messages: Message[]): Message[] {
  return [...messages].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
}

/** Builds the in-flight message the UI shows immediately, before the server replies. */
export function createPendingMessage(
  draft: MessageDraft,
  context: { id: string; senderId: string; createdAt: Date },
): Message {
  return {
    id: context.id,
    threadId: draft.threadId,
    senderId: context.senderId,
    body: normalizeBody(draft.body),
    createdAt: context.createdAt,
    status: 'sending',
    attachments: draft.attachments,
  }
}

/**
 * Inserts a pending message into the thread.
 *
 * Ids are deduplicated so a double submit, or a refetch that already contains
 * the server record, cannot render the same message twice.
 */
export function appendPending(messages: Message[], pending: Message): Message[] {
  if (messages.some((message) => message.id === pending.id)) return messages
  return sortByCreatedAt([...messages, pending])
}

/**
 * Swaps the optimistic entry for the server's record, in place.
 *
 * The position is preserved so a message that arrives out of order does not
 * jump. A pending id that is no longer present is ignored rather than appended,
 * because a dismissed failed send must not reappear on its own.
 */
export function confirmPending(messages: Message[], pendingId: string, saved: Omit<Message, 'status'>): Message[] {
  const index = messages.findIndex((message) => message.id === pendingId)
  if (index === -1) return messages

  const confirmed: Message = { ...saved, status: 'sent' }
  const next = [...messages]
  next[index] = confirmed
  return next
}

/**
 * Marks an in-flight message as failed.
 *
 * The message stays in the thread and keeps its text, which is what gives the
 * retry affordance something to act on; the user never loses what they typed.
 */
export function failPending(messages: Message[], pendingId: string, reason: string): Message[] {
  let changed = false
  const next = messages.map((message) => {
    if (message.id !== pendingId) return message
    changed = true
    const failed: Message = { ...message, status: 'failed', failureReason: reason }
    return failed
  })
  return changed ? next : messages
}

/** Returns a failed message to the sending state so it can be retried. */
export function retryPending(messages: Message[], pendingId: string): Message[] {
  let changed = false
  const next = messages.map((message) => {
    if (message.id !== pendingId || message.status !== 'failed') return message
    changed = true
    const retried: Message = { ...message, status: 'sending' }
    delete retried.failureReason
    return retried
  })
  return changed ? next : messages
}

/** Removes a message from the thread, used to dismiss a failed send. */
export function dismissMessage(messages: Message[], id: string): Message[] {
  const next = messages.filter((message) => message.id !== id)
  return next.length === messages.length ? messages : next
}

/** Ids of every message the composer currently offers a retry for. */
export function retryableIds(messages: Message[]): string[] {
  return messages.filter((message) => message.status === 'failed').map((message) => message.id)
}
