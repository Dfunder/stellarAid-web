import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getStoredTheme, persistTheme, setDocumentTheme, subscribeToSystemTheme } from '@/lib/theme'
import { ThemeContext, type ThemeContextValue } from './theme-context'

/**
 * Provides the light/dark theme to the whole app. The initial value is read from
 * the `data-theme` attribute set by the inline script in `index.html`, so the
 * first paint is already correctly themed. Toggling persists the choice in
 * `localStorage` and updates the document attribute without any flash.
 */
export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    const attribute = document.documentElement.dataset.theme
    return attribute === 'dark' ? 'dark' : 'light'
  })

  const setTheme = useCallback((next: 'light' | 'dark') => {
    setThemeState(next)
    setDocumentTheme(next)
    persistTheme(next)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next: 'light' | 'dark' = current === 'dark' ? 'light' : 'dark'
      setDocumentTheme(next)
      persistTheme(next)
      return next
    })
  }, [])

  // When the user has not chosen a theme, follow the OS preference live.
  useEffect(() => {
    return subscribeToSystemTheme((systemTheme) => {
      if (getStoredTheme() !== null) return
      setThemeState(systemTheme)
      setDocumentTheme(systemTheme)
    })
  }, [])

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
