import { useEffect, type ReactNode } from 'react'
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
}

/** Accessible dialog: closes on Escape or backdrop click, locks body scroll. */
export default function Modal({
  isOpen,
  title,
  description,
  onClose,
  children,
  className,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      <div className="fixed inset-0 bg-neutral-950/60" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'relative w-full max-w-md rounded-card bg-surface p-6 shadow-elevated',
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-h4">{title}</h2>
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
