import { useTheme } from './useTheme'

/** Presentational tool that flips the light/dark theme and persists the choice. */
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const label = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
  const next = theme === 'dark' ? 'Light' : 'Dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className="rounded-control border border-line bg-surface px-4 py-2 text-caption-sm font-semibold text-foreground shadow-card focus-visible:shadow-focus-ring"
    >
      {next} theme
    </button>
  )
}
