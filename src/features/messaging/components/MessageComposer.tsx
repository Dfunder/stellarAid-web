import { useId } from 'react'
import { Button, Spinner } from '@/components/ui'
import { useMessageComposer } from '../hooks/useMessageComposer'
import type { Message, MessageComposerOptions } from '../types'
import { formatAttachmentSize, MAX_MESSAGE_LENGTH } from '../utils'

/** A single line in the thread, with its retry affordance when a send failed. */
function MessageRow({
  message,
  isOwn,
  onRetry,
  onDismiss,
}: {
  message: Message
  isOwn: boolean
  onRetry: () => void
  onDismiss: () => void
}) {
  return (
    <li className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-[85%] rounded-control px-3.5 py-2.5 shadow-card ${
          isOwn ? 'bg-primary text-primary-contrast' : 'bg-surface-muted text-foreground'
        } ${message.status === 'failed' ? 'opacity-80' : ''}`}
      >
        {/* Rendered as text: React escapes it, and this module never sets HTML. */}
        <p className="whitespace-pre-wrap break-words text-body">{message.body}</p>

        {message.attachments.length > 0 ? (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {message.attachments.map((attachment) => (
              <li
                key={attachment.id}
                className="rounded-control bg-surface/20 px-2 py-1 text-caption-xs"
              >
                {attachment.name} &middot; {formatAttachmentSize(attachment.size)}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {message.status === 'sending' ? (
        <span className="mt-1 flex items-center gap-1.5 text-caption-xs text-muted">
          <Spinner className="h-3 w-3" /> Sending
        </span>
      ) : null}

      {message.status === 'failed' ? (
        <div className="mt-1 flex items-center gap-2">
          <span className="text-caption-xs text-danger">
            {message.failureReason ?? 'Message could not be sent'}
          </span>
          <Button size="sm" variant="secondary" onClick={onRetry}>
            Retry
          </Button>
          <Button size="sm" variant="ghost" onClick={onDismiss}>
            Dismiss
          </Button>
        </div>
      ) : null}
    </li>
  )
}

export type MessageComposerProps = MessageComposerOptions

/**
 * Message composer: a textarea plus the thread it writes into.
 *
 * Sends are optimistic: the message appears immediately with a `sending`
 * state and is reconciled with the server response, or converted into a failed
 * message the user can retry or dismiss.
 *
 * Integration seam: there is no messaging backend yet, so the caller supplies
 * `sender`. Without it the composer still works, but every send is reported as
 * failed rather than silently dropped.
 *
 * `initialMessages` is handed to the hook rather than rendered here. Keeping one
 * message list means an incoming message and an optimistically sent one behave
 * identically, and retry/dismiss work on both.
 */
export default function MessageComposer({
  threadId,
  currentUserId,
  sender,
  now,
  onError,
  initialMessages = [],
}: MessageComposerProps) {
  const fieldId = useId()
  const hintId = `${fieldId}-hint`
  const composer = useMessageComposer({ threadId, currentUserId, sender, now, onError, initialMessages })
  const canSendNow = composer.canSendNow

  return (
    <div className="flex flex-col gap-3">
      {composer.messages.length > 0 ? (
        <ul className="flex flex-col gap-3" aria-live="polite">
          {composer.messages.map((message) => (
            <MessageRow
              key={message.id}
              message={message}
              isOwn={message.senderId === currentUserId}
              onRetry={() => composer.retry(message.id)}
              onDismiss={() => composer.dismiss(message.id)}
            />
          ))}
        </ul>
      ) : null}

      {composer.preview ? (
        <div className="rounded-control border border-line bg-surface-muted px-3 py-2 text-caption-sm">
          {composer.preview.href ? (
            <a
              href={composer.preview.href}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-primary underline break-all"
            >
              {composer.preview.url}
            </a>
          ) : (
            // Unsafe scheme: shown as inert text rather than a live link.
            <span className="break-all text-muted">{composer.preview.url}</span>
          )}
        </div>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <label htmlFor={fieldId} className="text-caption-sm font-semibold text-foreground">
          Message
        </label>
        <textarea
          id={fieldId}
          value={composer.draft}
          onChange={(event) => composer.setDraft(event.target.value)}
          onKeyDown={composer.handleKeyDown}
          maxLength={MAX_MESSAGE_LENGTH}
          rows={3}
          placeholder="Write a message"
          aria-describedby={hintId}
          className="w-full resize-y rounded-control border border-line bg-surface px-3.5 py-2.5 text-body text-foreground shadow-card placeholder:text-muted focus-visible:shadow-focus-ring"
        />
        <p id={hintId} className="text-caption-xs text-muted">
          Enter to send, Shift+Enter for a new line. {composer.remaining} characters remaining.
        </p>
      </div>

      <div className="flex justify-end">
        <Button onClick={composer.send} disabled={!canSendNow}>
          Send
        </Button>
      </div>
    </div>
  )
}
