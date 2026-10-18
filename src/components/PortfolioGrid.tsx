import { useMemo } from 'react'
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
 * Keyboard-accessible portfolio grid (#935).
 *
 * - Container exposes `role="grid"` with an accessible name.
 * - Each item is a `role="gridcell"` with `tabIndex` roving focus.
 * - Arrow keys move between cells; Enter/Space activates.
 */
export default function PortfolioGrid({
  items,
  columns = 3,
  onItemActivate,
  className = '',
  label = 'Portfolio',
  emptyMessage = 'No portfolio items yet',
}: PortfolioGridProps) {
  const itemCount = items.length

  const { containerRef, getItemProps } = useFocusManagement({
    itemCount,
    columns,
    onActivate: (index) => {
      const item = items[index]
      if (item) onItemActivate?.(item)
    },
  })

  const gridStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    }),
    [columns],
  )

  if (itemCount === 0) {
    return (
      <div className="rounded-card border border-dashed border-line p-12 text-center">
        <p className="text-body font-semibold text-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef as React.RefObject<HTMLDivElement>}
      role="grid"
      aria-label={label}
      aria-rowcount={Math.ceil(itemCount / columns)}
      aria-colcount={columns}
      className={`grid gap-6 ${className}`}
      style={gridStyle}
    >
      {items.map((item, index) => {
        const row = Math.floor(index / columns) + 1
        const col = (index % columns) + 1
        const itemProps = getItemProps(index)
        return (
          <div
            key={item.id}
            role="row"
            aria-rowindex={row}
            className="contents"
          >
            <div
              role="gridcell"
              aria-colindex={col}
              aria-roledescription="portfolio item"
              aria-label={
                item.category
                  ? `${item.title}, ${item.category}`
                  : item.title
              }
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
          </div>
        )
      })}
    </div>
  )
}
