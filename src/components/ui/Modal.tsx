import { useEffect, useId, useRef, type ReactNode } from 'react'
import { cn } from '@/lib'

export interface ModalProps {
  isOpen: boolean
  title: string
  /** Optional supporting line rendered under the title. */
  description?: string
  onClose: () => void
  children: ReactNode
  /** Extra classes for the dialog panel, e.g. a wider `max-w-*`. */
  className?: string
  /**
   * Heading level for the visible title. Defaults to `h2`; raise it when the
   * dialog is opened from a section that is already nested under an `h2` so the
   * document outline stays monotonic.
   */
  headingLevel?: 'h2' | 'h3' | 'h4'
}

/** Elements that can receive focus inside the dialog, in DOM order. */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/**
 * Accessible dialog: closes on Escape or backdrop click, locks body scroll,
 * moves focus into the dialog on open, traps Tab/Shift+Tab inside it, and
 * returns focus to the trigger on close (#856).
 */
export default function Modal({
  isOpen,
  title,
  description,
  onClose,
  children,
  className,
  headingLevel: Heading = 'h2',
}: ModalProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    // Remember what had focus so it can be restored on close/unmount.
    const previouslyFocused = document.activeElement as HTMLElement | null

    const getFocusable = (): HTMLElement[] => {
      const panel = panelRef.current
      if (!panel) return []
      return Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    }

    // Move focus into the dialog so keyboard users are not left behind it.
    const initialFocus = getFocusable()[0] ?? panelRef.current
    initialFocus?.focus()

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const focusable = getFocusable()
      if (focusable.length === 0) {
        event.preventDefault()
        panelRef.current?.focus()
        return
      }

      const first = focusable[0]!
      const last = focusable[focusable.length - 1]!
      const active = document.activeElement

      if (event.shiftKey) {
        if (active === first || active === panelRef.current) {
          event.preventDefault()
          last.focus()
        }
      } else if (active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus?.()
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      {/* The backdrop is a real button so dismissal is keyboard/AT exposed and
          the overlay is not an interactive `div` (#856). */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close dialog"
        className="fixed inset-0 cursor-default bg-neutral-950/60"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'relative w-full max-w-md rounded-card bg-surface p-6 shadow-elevated',
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <Heading id={titleId} className="text-h4">
              {title}
            </Heading>
            {description ? <p className="mt-1 text-caption text-muted">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="-mr-1 -mt-1 rounded-control p-1 text-caption text-muted hover:bg-surface-muted hover:text-foreground focus-visible:shadow-focus-ring"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  )
}
