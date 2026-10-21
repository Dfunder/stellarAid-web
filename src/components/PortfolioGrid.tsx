import { useId, useMemo } from 'react'
import { useFocusManagement } from '@/hooks/useFocusManagement'

export interface PortfolioItem {
  id: string
  title: string
  imageUrl?: string
  category?: string
  status?: string
  description?: string
}

export interface PortfolioGridProps {
  items: PortfolioItem[]
  /** Visible column count for arrow-key navigation. */
  columns?: number
  onItemActivate?: (item: PortfolioItem) => void
  className?: string
  /** Accessible name for the grid. */
  label?: string
  emptyMessage?: string
}

/**
 * Keyboard-accessible portfolio grid (#935, #988).
 *
 * - Container exposes `role="grid"` with an accessible name.
 * - Items are grouped into real `role="row"` elements so each row owns its
 *   `role="gridcell"` children (a row with one cell per item is invalid ARIA).
 * - Roving tabindex: exactly one cell is tabbable at a time.
 * - Arrow keys move between cells; Enter/Space activates.
 * - An `aria-describedby` hint announces the key bindings, so the controls are
 *   discoverable without sighted trial and error (#993).
 */
export default function PortfolioGrid({
  items,
  columns = 3,
  onItemActivate,
  className = '',
  label = 'Portfolio',
  emptyMessage = 'No portfolio items yet',
}: PortfolioGridProps) {
  const safeColumns = Math.max(1, columns)
  const itemCount = items.length
  const instructionsId = useId()

  const { containerRef, getItemProps } = useFocusManagement({
    itemCount,
    columns: safeColumns,
    onActivate: (index) => {
      const item = items[index]
      if (item) onItemActivate?.(item)
    },
  })

  const rows = useMemo(() => {
    const result: PortfolioItem[][] = []
    for (let index = 0; index < items.length; index += safeColumns) {
      result.push(items.slice(index, index + safeColumns))
    }
    return result
  }, [items, safeColumns])

  const gridStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${safeColumns}, minmax(0, 1fr))`,
    }),
    [safeColumns],
  )

  if (itemCount === 0) {
    return (
      <div className="rounded-card border border-dashed border-line p-12 text-center">
        <p className="text-body font-semibold text-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <>
      {/* Outside the grid: a grid may only contain rows, and a stray child
          would break both the ARIA structure and the CSS grid. */}
      <p id={instructionsId} className="sr-only">
        {label}: use the arrow keys to move between items, Home and End to jump to the first or last
        item, and Enter or Space to open an item.
      </p>
      <div
        ref={containerRef as React.RefObject<HTMLDivElement>}
        role="grid"
        aria-label={label}
        aria-describedby={instructionsId}
        aria-rowcount={rows.length}
        aria-colcount={safeColumns}
        className={`grid gap-6 ${className}`}
        style={gridStyle}
      >
        {rows.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} role="row" aria-rowindex={rowIndex + 1} className="contents">
            {row.map((item, columnIndex) => {
              const index = rowIndex * safeColumns + columnIndex
              const itemProps = getItemProps(index)
              const accessibleName = [item.title, item.category, item.status]
                .filter(Boolean)
                .join(', ')

              return (
                <div
                  key={item.id}
                  role="gridcell"
                  aria-colindex={columnIndex + 1}
                  aria-roledescription="portfolio item"
                  aria-label={accessibleName}
                  tabIndex={itemProps.tabIndex}
                  data-focus-index={itemProps['data-focus-index']}
                  onKeyDown={itemProps.onKeyDown}
                  onFocus={itemProps.onFocus}
                  onClick={() => onItemActivate?.(item)}
                  className="group cursor-pointer overflow-hidden rounded-card border border-line bg-surface shadow-card outline-none transition duration-200 hover:-translate-y-1 hover:shadow-elevated focus-visible:shadow-focus-ring"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-muted">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted">
                        No image
                      </div>
                    )}
                    {item.status ? (
                      <span className="absolute top-2.5 right-2.5 rounded-full bg-primary/90 px-2 py-0.5 text-caption-sm font-semibold text-primary-contrast">
                        {item.status}
                      </span>
                    ) : null}
                  </div>
                  <div className="p-4">
                    <h3 className="truncate text-body font-semibold text-foreground group-hover:text-primary">
                      {item.title}
                    </h3>
                    {item.description ? (
                      <p className="mt-1 line-clamp-2 text-caption text-muted">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </>
  )
}
