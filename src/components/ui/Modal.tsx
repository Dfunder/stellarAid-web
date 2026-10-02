import { useEffect, useId, useRef, type ReactNode } from 'react'
import { cn } from '@/lib'

export interface ModalProps {
  isOpen: boolean
  title: string
  /** Optional supporting line rendered under the title. */
  description?: string
  /** Accessible heading tag level, default h2 */
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4'
  onClose: () => void
  children: ReactNode
  /** Extra classes for the dialog panel, e.g. a wider `max-w-*`. */
  className?: string
}

/** Accessible dialog: closes on Escape or backdrop click, traps focus, locks body scroll. */
export default function Modal({
  isOpen,
  title,
  description,
  headingLevel: Heading = 'h2',
  onClose,
  children,
  className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    if (!isOpen) return

    const previousActiveElement = document.activeElement as HTMLElement | null

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key === 'Tab') {
        const dialog = dialogRef.current
        if (!dialog) return

        const focusable = dialog.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        if (focusable.length === 0) return

        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    // Initial focus
    requestAnimationFrame(() => {
      const dialog = dialogRef.current
      if (dialog) {
        const firstFocusable = dialog.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        if (firstFocusable) {
          firstFocusable.focus()
        } else {
          dialog.focus()
        }
      }
    })

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
        previousActiveElement.focus()
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      {/* Backdrop button for accessible dismissal without interactive div */}
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close dialog overlay"
        onClick={onClose}
        className="fixed inset-0 bg-neutral-950/60 cursor-default border-0 p-0"
      />
      <div
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          'relative w-full max-w-md rounded-card bg-surface p-6 shadow-elevated focus:outline-none',
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <Heading id={titleId} className="text-h4">
              {title}
            </Heading>
            {description ? (
              <p id={descriptionId} className="mt-1 text-caption text-muted">
                {description}
              </p>
            ) : null}
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
