import { Link } from 'react-router-dom'
import { NAV_LINK_BASE } from './navFocus'

export interface MobileNavProps {
  open: boolean
  items: { to: string; label: string }[]
  onNavigate?: () => void
}

/**
 * Mobile disclosure nav — same focus-visible treatment as desktop (#939).
 */
export function MobileNav({ open, items, onNavigate }: MobileNavProps) {
  if (!open) return null
  return (
    <nav
      id="mobile-nav"
      aria-label="Mobile"
      className="sm:hidden border-t border-line bg-surface px-4 py-2"
    >
      <ul className="flex flex-col">
        {items.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              className={`block py-3 ${NAV_LINK_BASE}`}
              onClick={onNavigate}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
