import { useCallback, useMemo, useState } from 'react'
import type { Message, MessageComposerOptions } from '../types'
import {
  appendPending,
  canSend,
  confirmPending,
  createPendingMessage,
  dismissMessage,
  extractLinkPreview,
  failPending,
  normalizeAttachments,
  normalizeBody,
  remainingLength,
  retryPending,
  retryableIds,
  sendIntentForKey,
} from '../utils'

export interface UseMessageComposer {
  /** Current textarea contents. */
  draft: string
  /** Thread contents, oldest first, including optimistic and failed entries. */
  messages: Message[]
  /** Preview for the first link in the draft, if any. */
  preview: ReturnType<typeof extractLinkPreview>
  /** Whether the draft may be sent right now. */
  canSendNow: boolean
  /** Characters left before the body is rejected. */
  remaining: number
  /** Ids of failed messages that can be retried. */
  retryable: string[]
  setDraft: (value: string) => void
  /**
   * Enter / Shift+Enter handler for the textarea. Returns `true` when it
   * consumed the key, so the caller can `preventDefault` on that basis.
   */
  handleKeyDown: (event: {
    key: string
    shiftKey: boolean
    nativeEvent?: { isComposing?: boolean }
    preventDefault: () => void
  }) => void
  send: () => void
  retry: (messageId: string) => void
  dismiss: (messageId: string) => void
}

/**
 * Owns composer state: the draft, the optimistic message list, and the
 * send/retry lifecycle.
 *
 * The state transitions themselves live in `../utils` as pure functions, so
 * this hook only wires them to React and holds no rules of its own.
 */
export function useMessageComposer({
  threadId,
  currentUserId,
  sender,
  now = () => new Date(),
  onError,
  initialMessages,
}: MessageComposerOptions): UseMessageComposer {
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState<Message[]>(initialMessages ?? [])

  const preview = useMemo(() => extractLinkPreview(draft), [draft])
  const remaining = useMemo(() => remainingLength(draft), [draft])
  const retryable = useMemo(() => retryableIds(messages), [messages])

  const dispatchSend = useCallback(
    async (pendingId: string, body: string, attachments: Message['attachments']) => {
      if (!sender) {
        // No transport wired yet. Reporting the failure keeps the message
        // visible and retryable instead of pretending it was delivered.
        setMessages((current) => failPending(current, pendingId, 'No message transport is configured'))
        onError?.('No message transport is configured')
        return
      }

      try {
        const saved = await sender({ threadId, body, attachments })
        setMessages((current) => confirmPending(current, pendingId, saved))
      } catch (error) {
        const reason = error instanceof Error ? error.message : 'Message could not be sent'
        setMessages((current) => failPending(current, pendingId, reason))
        onError?.(reason)
      }
    },
    [onError, sender, threadId],
  )

  const send = useCallback(() => {
    if (!canSend(draft)) return

    const body = normalizeBody(draft)
    const attachments = normalizeAttachments([])
    const pendingId = `pending-${crypto.randomUUID()}`

    setMessages((current) =>
      appendPending(
        current,
        createPendingMessage({ threadId, body, attachments }, {
          id: pendingId,
          senderId: currentUserId,
          createdAt: now(),
        }),
      ),
    )
    setDraft('')
    void dispatchSend(pendingId, body, attachments)
  }, [currentUserId, dispatchSend, draft, now, threadId])

  const retry = useCallback(
    (messageId: string) => {
      const target = messages.find((message) => message.id === messageId)
      if (!target || target.status !== 'failed') return

      setMessages((current) => retryPending(current, messageId))
      void dispatchSend(messageId, target.body, target.attachments)
    },
    [dispatchSend, messages],
  )

  const dismiss = useCallback((messageId: string) => {
    setMessages((current) => dismissMessage(current, messageId))
  }, [])

  const handleKeyDown = useCallback(
    (event: {
      key: string
      shiftKey: boolean
      nativeEvent?: { isComposing?: boolean }
      preventDefault: () => void
    }) => {
      const intent = sendIntentForKey(event.key, event.shiftKey, event.nativeEvent?.isComposing === true)
      if (intent === 'send') {
        event.preventDefault()
        send()
      }
      // 'newline' is the textarea's own default behaviour, so nothing to do.
    },
    [send],
  )

  return {
    draft,
    messages,
    preview,
    canSendNow: canSend(draft),
    remaining,
    retryable,
    setDraft,
    handleKeyDown,
    send,
    retry,
    dismiss,
  }
}
