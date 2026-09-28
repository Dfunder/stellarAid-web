import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Spinner } from '@/components/ui'
import {
  formatMessageTime,
  groupMessagesByDay,
  pollIntervalFor,
  preserveScrollTop,
  shouldStickToBottom,
  type ConversationMessage,
} from '../conversation'

export interface ThreadConversationViewProps {
  messages: readonly ConversationMessage[]
  /** The signed-in user, whose messages are aligned right. */
  currentUserId: string
  /**
   * Loads one page of older history. Resolves to `true` when older messages
   * were prepended, which is what triggers the scroll-anchor correction.
   */
  onLoadOlder?: () => Promise<boolean> | boolean
  /** Whether older history is available above the current window. */
  hasOlder?: boolean
  isLoadingOlder?: boolean
  /** Supplies a newer page on the poll cadence. */
  onRefresh?: () => void | Promise<unknown>
  /** Marks the thread as read while it is on screen and focused. */
  isFocused?: boolean
}

/**
 * Chat-style transcript for one conversation.
 *
 * Three behaviours are the point of this component, and each is delegated to a
 * pure helper in `../conversation` so it can be tested without a DOM:
 *
 *  - **Day separators** via `groupMessagesByDay`.
 *  - **Scroll anchoring** via `preserveScrollTop`: when older messages are
 *    prepended the content above grows, and scrolling by exactly that much is
 *    what keeps the reader's place instead of snapping to a different message.
 *  - **Conditional auto-scroll** via `shouldStickToBottom`: new messages only
 *    pull the view down while the reader is already at the bottom.
 */
export default function ThreadConversationView({
  messages,
  currentUserId,
  onLoadOlder,
  hasOlder = false,
  isLoadingOlder = false,
  onRefresh,
  isFocused = true,
}: ThreadConversationViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isNearTop, setIsNearTop] = useState(false)
  const [isAtBottom, setIsAtBottom] = useState(true)

  const segments = groupMessagesByDay(messages, new Date())
  const latestId = messages.length > 0 ? messages[messages.length - 1]?.id : undefined

  // Re-pin to the newest message only while the reader is already there.
  useEffect(() => {
    const container = containerRef.current
    if (!container || !isAtBottom || latestId === undefined) return
    container.scrollTop = container.scrollHeight
  }, [latestId, isAtBottom, segments.length])

  // Preserve the reader's place across a prepend. Measured in a layout effect
  // so the correction happens before the browser paints the new content.
  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return
    const previousHeight = container.dataset.scrollHeight
    if (previousHeight === undefined) return

    const restored = preserveScrollTop(
      container.scrollTop,
      Number(previousHeight),
      container.scrollHeight,
    )
    if (restored !== container.scrollTop) container.scrollTop = restored
    container.dataset.scrollHeight = String(container.scrollHeight)
  }, [messages.length])

  useEffect(() => {
    const container = containerRef.current
    if (container) container.dataset.scrollHeight = String(container.scrollHeight)
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container || !onLoadOlder || !isNearTop || isLoadingOlder) return

    let cancelled = false
    void Promise.resolve(onLoadOlder()).then((prepended) => {
      if (!cancelled && prepended) setIsNearTop(false)
    })
    return () => {
      cancelled = true
    }
  }, [isLoadingOlder, isNearTop, onLoadOlder])

  useEffect(() => {
    if (!onRefresh) return
    const interval = pollIntervalFor({ isFocused, isActive: true })
    if (interval === false) return
    const handle = window.setInterval(() => void onRefresh(), interval)
    return () => window.clearInterval(handle)
  }, [isFocused, onRefresh])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-center">
        {isLoadingOlder ? (
          <Spinner className="h-4 w-4" />
        ) : hasOlder ? (
          <button
            type="button"
            onClick={() => void onLoadOlder?.()}
            className="text-caption-sm text-primary underline"
          >
            Load earlier messages
          </button>
        ) : (
          <span className="text-caption-xs text-muted">Beginning of conversation</span>
        )}
      </div>

      <div
        ref={containerRef}
        className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto overscroll-contain pr-1 sm:max-h-[70vh]"
        onScroll={(event) => {
          const target = event.currentTarget
          setIsNearTop(target.scrollTop <= 32)
          setIsAtBottom(
            shouldStickToBottom(target.scrollTop, target.clientHeight, target.scrollHeight),
          )
        }}
      >
        {segments.map((segment) => (
          <section key={segment.key} className="flex flex-col gap-2">
            <div className="flex items-center gap-3" role="separator">
              <span className="h-px flex-1 bg-line" />
              <span className="text-caption-xs font-semibold uppercase tracking-wide text-muted">
                {segment.label}
              </span>
              <span className="h-px flex-1 bg-line" />
            </div>

            {segment.messages.map((message) => {
              const isOwn = message.senderId === currentUserId
              return (
                <div
                  key={message.id}
                  className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                >
                  {!isOwn ? (
                    <span className="px-1 text-caption-xs text-muted">{message.senderName}</span>
                  ) : null}
                  <div
                    className={`max-w-[85%] rounded-control px-3.5 py-2 shadow-card sm:max-w-[70%] ${
                      isOwn
                        ? 'bg-primary text-primary-contrast'
                        : 'bg-surface-muted text-foreground'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-body">{message.body}</p>
                  </div>
                  <time
                    dateTime={message.createdAt.toISOString()}
                    className="px-1 text-caption-xs text-muted"
                  >
                    {formatMessageTime(message.createdAt)}
                  </time>
                </div>
              )
            })}
          </section>
        ))}

        {messages.length === 0 ? (
          <p className="py-8 text-center text-body text-muted">No messages yet.</p>
        ) : null}
      </div>
    </div>
  )
}
