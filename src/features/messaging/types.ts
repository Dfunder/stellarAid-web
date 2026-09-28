/**
 * Messaging domain types.
 *
 * A message carries an explicit client-side `status` so the UI can offer a
 * retry for a send that never reached the server. Only `sent` messages are
 * known to the backend; `sending` and `failed` exist purely in the browser.
 */

export type MessageStatus = 'sending' | 'sent' | 'failed'

/** An attachment as rendered by the composer chips. */
export interface MessageAttachment {
  id: string
  name: string
  /** Bytes. Never trusted for layout: the chip renders a formatted size. */
  size: number
  contentType: string
  /**
   * Where the file is served from. Kept separate from `name` so a chip can
   * render the label as text while linking with a validated URL.
   */
  url: string
}

/** Preview metadata for the first link in a message body. */
export interface LinkPreview {
  /** The URL exactly as it appeared in the body, still untrusted. */
  url: string
  /**
   * The URL to put in an `href`, or `null` when the body holds no link or the
   * link uses a scheme we refuse to navigate to.
   */
  href: string | null
}

export interface Message {
  id: string
  threadId: string
  senderId: string
  body: string
  createdAt: Date
  status: MessageStatus
  attachments: MessageAttachment[]
  /** Why the send failed; set only while `status` is `failed`. */
  failureReason?: string
}

/** A composed, not-yet-sent message. */
export interface MessageDraft {
  threadId: string
  body: string
  attachments: MessageAttachment[]
}

/**
 * Sends a draft and resolves with the server's record.
 *
 * There is no messaging backend yet, so the composer takes its sender as a
 * dependency instead of importing a service. A caller wires this to whichever
 * transport it already has; see the module README note in `index.ts`.
 */
export type MessageSender = (draft: MessageDraft) => Promise<Omit<Message, 'status'>>

export interface MessageComposerOptions {
  threadId: string
  /** The signed-in user, used to label the composer's own messages. */
  currentUserId: string
  /**
   * Transport used by `send` and `retry`. When omitted the composer renders in
   * a read-only state and reports sends as failed rather than pretending to
   * have delivered them.
   */
  sender?: MessageSender
  /** Clock injection point, so optimistic timestamps are deterministic. */
  now?: () => Date
  /**
   * Existing thread contents, oldest first. Seeded into the composer's own
   * message list so there is a single source of truth: an incoming message and
   * an optimistically sent one are the same list, and retry/dismiss work on
   * either.
   */
  initialMessages?: Message[]
  onError?: (reason: string) => void
}
