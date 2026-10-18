import { Link } from 'react-router-dom'
import { NAV_LINK_BASE } from './navFocus'

export interface NavItem {
  to: string
  label: string
}

const DEFAULT_ITEMS: NavItem[] = [
  { to: '/artists/elena_art', label: 'Featured Artist' },
  { to: '/artists/stellar_nova', label: 'Explore Creators' },
]

/**
 * Desktop primary navigation with visible keyboard focus indicators (#939).
 */
export function PrimaryNav({ items = DEFAULT_ITEMS }: { items?: NavItem[] }) {
  return (
    <nav aria-label="Primary" className="hidden sm:flex items-center gap-4">
      {items.map((item) => (
        <Link key={item.to} to={item.to} className={NAV_LINK_BASE}>
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
