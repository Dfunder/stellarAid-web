import type { KeyboardEvent } from 'react'

export interface ArtistCardProps {
  id: string
  displayName: string
  headline?: string
  avatarUrl?: string
  onActivate?: (id: string) => void
  className?: string
}

/**
 * Focusable artist card (#935, #988).
 * Supports Tab focus, Enter/Space activation, and an accessible name.
 *
 * `role="button"` is intentional: a card rendered on its own is not a valid
 * `gridcell` (that role requires a `grid`/`row` ancestor). Wrap it in a row if
 * it is ever composed into a grid.
 */
export default function ArtistCard({
  id,
  displayName,
  headline,
  avatarUrl,
  onActivate,
  className = '',
}: ArtistCardProps) {
  const activate = () => onActivate?.(id)

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      activate()
    }
  }

  return (
    <div
      role="button"
      aria-roledescription="artist card"
      aria-label={headline ? `${displayName}, ${headline}` : displayName}
      tabIndex={0}
      onClick={activate}
      onKeyDown={onKeyDown}
      className={`cursor-pointer rounded-card border border-line bg-surface p-4 shadow-card outline-none transition hover:shadow-elevated focus-visible:shadow-focus-ring ${className}`}
    >
      <div className="flex items-center gap-3">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
        ) : (
          <div
            aria-hidden
            className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-body font-semibold text-muted"
          >
            {displayName.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-body font-semibold text-foreground">{displayName}</p>
          {headline ? <p className="truncate text-caption text-muted">{headline}</p> : null}
        </div>
      </div>
    </div>
  )
}
