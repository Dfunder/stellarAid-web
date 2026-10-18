import PortfolioGrid, { type PortfolioItem } from './PortfolioGrid'

export interface WorkGalleryProps {
  works: PortfolioItem[]
  columns?: number
  onSelect?: (work: PortfolioItem) => void
  label?: string
}

/**
 * Gallery of works built on the accessible PortfolioGrid (#935).
 */
export default function WorkGallery({
  works,
  columns = 3,
  onSelect,
  label = 'Work gallery',
}: WorkGalleryProps) {
  return (
    <PortfolioGrid
      items={works}
      columns={columns}
      onItemActivate={onSelect}
      label={label}
      emptyMessage="No works to display"
    />
  )
}
