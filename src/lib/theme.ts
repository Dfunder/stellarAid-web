/**
 * Framework-agnostic helpers for the light/dark theme.
 *
 * The theme is driven by the `data-theme` attribute on `<html>`, which switches
 * the semantic CSS variables defined in `src/index.css`. The attribute is set
 * before first paint by the inline script in `index.html` (FOUC-free) and kept
 * in sync here.
 */

export type Theme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'lumora-theme'

const themeColorFor = (theme: Theme): string => (theme === 'dark' ? '#12100e' : '#faf8f5')

function themeColorMeta(): HTMLMetaElement | null {
  return document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
}

/** Theme preferred by the operating system. */
export function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** Previously persisted choice, or `null` when the user has not chosen yet. */
export function getStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return stored === 'light' || stored === 'dark' ? stored : null
  } catch {
    return null
  }
}

/** Theme to use for the very first visit: persisted choice, else system. */
export function resolveInitialTheme(): Theme {
  return getStoredTheme() ?? getSystemTheme()
}

/** Apply a theme to the document without persisting it. */
export function setDocumentTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme
  const meta = themeColorMeta()
  if (meta) meta.content = themeColorFor(theme)
}

/** Persist a theme choice so it survives reloads. */
export function persistTheme(theme: Theme): void {
  localStorage.setItem(THEME_STORAGE_KEY, theme)
}

/** Subscribe to OS theme changes; returns an unsubscribe function. */
export function subscribeToSystemTheme(listener: (theme: Theme) => void): () => void {
  const query = window.matchMedia('(prefers-color-scheme: dark)')
  const onChange = (event: MediaQueryListEvent): void => listener(event.matches ? 'dark' : 'light')
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}
