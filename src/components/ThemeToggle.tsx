import { useTheme } from '@/components/ui/useTheme'

export interface ThemeToggleProps {
  className?: string
  showLabel?: boolean
  id?: string
}

/**
 * Accessible theme switcher that applies clean semantic CSS variables
 * and color-scheme without color inversion filters (#942).
 */
export default function ThemeToggle({
  className = '',
  showLabel = true,
  id = 'theme-toggle-btn',
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme'
  const next = isDark ? 'Light' : 'Dark'

  return (
    <button
      id={id}
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      aria-pressed={isDark}
      title={label}
      data-testid="theme-toggle"
      data-current-theme={theme}
      className={`inline-flex items-center justify-center gap-2 rounded-control border border-line bg-surface px-3.5 py-2 text-caption-sm font-semibold text-foreground shadow-card transition-colors hover:bg-surface-muted focus-visible:shadow-focus-ring ${className}`}
      style={{
        // Explicitly enforce that no filter: invert() is ever attached
        filter: 'none',
      }}
    >
      <span aria-hidden="true" className="text-body-sm">
        {isDark ? '☀️' : '🌙'}
      </span>
      {showLabel ? <span>{next} theme</span> : null}
    </button>
  )
}
