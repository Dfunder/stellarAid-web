import { describe, expect, it, beforeEach } from 'vitest'
import { getStoredTheme, persistTheme, THEME_STORAGE_KEY } from '../theme'

describe('theme persistence (#938)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('persists and restores the theme preference', () => {
    expect(getStoredTheme()).toBeNull()
    persistTheme('dark')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    expect(getStoredTheme()).toBe('dark')
    persistTheme('light')
    expect(getStoredTheme()).toBe('light')
  })
})
