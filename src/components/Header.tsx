import type { ReactNode } from 'react'
import ThemeToggle from './ThemeToggle'

export interface HeaderProps {
  /** Optional brand title or element */
  brand?: ReactNode
  /** Optional nav links or action elements */
  children?: ReactNode
  /** Custom CSS classes */
  className?: string
}

/**
 * Site navigation header using semantic CSS variables and color-scheme (#942).
 * Strictly avoids filter: invert() so logo images, badges, and gradients retain true colors.
 */
export default function Header({ brand = 'Lumora', children, className = '' }: HeaderProps) {
  return (
    <header
      role="banner"
      data-testid="header"
      className={`sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur-md text-foreground transition-colors ${className}`}
      style={{
        // Ensure no color inversion filter is applied to the header or its children (#942)
        filter: 'none',
      }}
    >
      <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3.5">
        <div className="flex items-center gap-6">
          <a
            href="/"
            className="flex items-center gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            data-testid="header-logo"
          >
            {/* Gradient badge retaining true colors in dark mode without inversion */}
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-control bg-gradient-to-br from-primary to-gold text-white font-bold text-caption shadow-card"
              data-testid="brand-gradient-badge"
              style={{ filter: 'none' }}
            >
              L
            </span>
            <span className="text-caption font-bold uppercase tracking-widest text-gold">
              {brand}
            </span>
          </a>

          {children ? (
            <nav className="hidden sm:flex items-center gap-4" aria-label="Main Navigation">
              {children}
            </nav>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
