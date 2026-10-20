import { Link } from 'react-router-dom'
import { NAV_FOCUS_CLASSES } from './navFocus'

/**
 * Secondary / footer-style nav links with focus indicators (#939).
 */
export function SecondaryNav({
  items,
}: {
  items: { to: string; label: string; external?: boolean }[]
}) {
  return (
    <nav aria-label="Secondary" className="flex items-center gap-4 text-caption-sm">
      {items.map((item) =>
        item.external ? (
          <a
            key={item.to}
            href={item.to}
            target="_blank"
            rel="noreferrer"
            className={`hover:text-foreground ${NAV_FOCUS_CLASSES}`}
          >
            {item.label}
          </a>
        ) : (
          <Link
            key={item.to}
            to={item.to}
            className={`hover:text-foreground ${NAV_FOCUS_CLASSES}`}
          >
            {item.label}
          </Link>
        ),
      )}
    </nav>
  )
}
