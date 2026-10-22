import type { ReactNode } from 'react'
import Header, { type HeaderProps } from './Header'

export interface LayoutProps {
  children?: ReactNode
  headerProps?: HeaderProps
  className?: string
  showFooter?: boolean
}

/**
 * Standard page layout component with CSS variable dark mode (#942).
 * Strictly avoids filter: invert() to ensure images, gradients, and text
 * maintain authentic colors and contrast in both light and dark themes.
 */
export default function Layout({
  children,
  headerProps,
  className = '',
  showFooter = true,
}: LayoutProps) {
  return (
    <div
      data-testid="app-layout"
      className={`flex min-h-screen flex-col bg-background text-foreground transition-colors ${className}`}
      style={{
        // Enforce native theme tokens without color inversion
        backgroundColor: 'var(--color-bg, rgb(var(--color-background)))',
        color: 'var(--color-text, rgb(var(--color-foreground)))',
        filter: 'none',
      }}
    >
      <Header {...headerProps} />

      <main className="flex-1 container mx-auto px-4 py-6" role="main" data-testid="layout-main">
        {children}
      </main>

      {showFooter ? (
        <footer
          role="contentinfo"
          data-testid="layout-footer"
          className="border-t border-line bg-surface py-6 text-center text-caption text-muted transition-colors"
          style={{ filter: 'none' }}
        >
          <div className="container mx-auto px-4">
            <p>© {new Date().getFullYear()} Lumora. Built on Stellar.</p>
          </div>
        </footer>
      ) : null}
    </div>
  )
}
