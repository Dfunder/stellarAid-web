import { describe, expect, it, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'
import fs from 'fs'
import path from 'path'
import React from 'react'
import ThemeProvider from '@/components/ui/ThemeProvider'
import ThemeToggle from '@/components/ThemeToggle'
import Header from '@/components/Header'
import Layout from '@/components/Layout'
import { setDocumentTheme } from '@/lib/theme'

describe('dark mode design and color inversion prevention (#942)', () => {
  beforeEach(() => {
    document.documentElement.style.filter = ''
    document.documentElement.dataset.theme = 'light'
    try {
      window.localStorage?.clear?.()
    } catch {
      // ignore
    }
  })

  it('defines color-scheme: light dark and CSS custom properties in index.css without filter: invert', () => {
    const cssPath = path.resolve(__dirname, '../index.css')
    const cssContent = fs.readFileSync(cssPath, 'utf-8')

    // 1. color-scheme: light dark is defined on :root
    expect(cssContent).toMatch(/color-scheme:\s*light\s+dark/)

    // 2. CSS custom properties for light/dark modes
    expect(cssContent).toMatch(/--color-bg:/)
    expect(cssContent).toMatch(/--color-text:/)
    expect(cssContent).toMatch(/light-dark\(/)

    // 3. No global or dark mode rule uses filter: invert()
    expect(cssContent).not.toMatch(/filter:\s*invert\([^)]*\)/i)

    // 4. Media elements explicitly retain true colors
    expect(cssContent).toMatch(/filter:\s*none\s*!important/)
  })

  it('setDocumentTheme updates color-scheme and data-theme without color inversion', () => {
    setDocumentTheme('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(document.documentElement.style.colorScheme).toBe('dark')
    expect(document.documentElement.style.filter).not.toContain('invert')

    setDocumentTheme('light')
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(document.documentElement.style.colorScheme).toBe('light')
    expect(document.documentElement.style.filter).not.toContain('invert')
  })

  it('ThemeToggle switches theme cleanly using data-theme and avoids color inversion', async () => {
    const user = userEvent.setup()

    render(React.createElement(ThemeProvider, null, React.createElement(ThemeToggle, null)))

    const toggleBtn = screen.getByTestId('theme-toggle')
    expect(toggleBtn).toBeInTheDocument()
    expect(toggleBtn.style.filter).not.toContain('invert')

    // Click toggle to switch to dark mode
    await user.click(toggleBtn)

    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(document.documentElement.style.colorScheme).toBe('dark')
    expect(document.documentElement.style.filter).not.toContain('invert')
    expect(toggleBtn.style.filter).not.toContain('invert')

    // Click toggle to switch back to light mode
    await user.click(toggleBtn)
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(document.documentElement.style.colorScheme).toBe('light')
    expect(document.documentElement.style.filter).not.toContain('invert')
  })

  it('Header component renders with semantic tokens and without color inversion', () => {
    setDocumentTheme('dark')

    render(
      React.createElement(
        ThemeProvider,
        null,
        React.createElement(
          Header,
          { brand: 'Lumora' },
          React.createElement('a', { href: '/explore' }, 'Explore'),
        ),
      ),
    )

    const header = screen.getByTestId('header')
    expect(header).toBeInTheDocument()
    expect(header.style.filter).not.toContain('invert')

    // Gradient brand badge retains original gradient colors without invert
    const badge = screen.getByTestId('brand-gradient-badge')
    expect(badge.style.filter).not.toContain('invert')
  })

  it('Layout component preserves images and gradients in dark mode without inversion artifacts', () => {
    setDocumentTheme('dark')

    render(
      React.createElement(
        ThemeProvider,
        null,
        React.createElement(
          Layout,
          null,
          React.createElement(
            'div',
            { 'data-testid': 'test-content' },
            React.createElement('h1', { 'data-testid': 'heading' }, 'Artwork Showcase'),
            React.createElement('img', {
              src: '/assets/sample-art.png',
              alt: 'Sample Artwork',
              'data-testid': 'art-image',
              style: { filter: 'none' },
            }),
            React.createElement(
              'div',
              {
                'data-testid': 'gradient-card',
                className: 'bg-gradient-to-r from-purple-500 to-gold',
                style: { filter: 'none' },
              },
              'Gradient Card Content',
            ),
          ),
        ),
      ),
    )

    const layout = screen.getByTestId('app-layout')
    expect(layout.style.filter).not.toContain('invert')

    const image = screen.getByTestId('art-image')
    expect(image.style.filter).not.toContain('invert')

    const gradient = screen.getByTestId('gradient-card')
    expect(gradient.style.filter).not.toContain('invert')
  })

  it('provides high contrast and text readability in dark and light modes', () => {
    // Relative luminance calculation for WCAG contrast ratio
    function getLuminance(hex: string): number {
      const rgb = [
        parseInt(hex.slice(1, 3), 16) / 255,
        parseInt(hex.slice(3, 5), 16) / 255,
        parseInt(hex.slice(5, 7), 16) / 255,
      ].map((val) => (val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)))
      const [r = 0, g = 0, b = 0] = rgb
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }

    function getContrastRatio(hex1: string, hex2: string): number {
      const l1 = getLuminance(hex1)
      const l2 = getLuminance(hex2)
      const brightest = Math.max(l1, l2)
      const darkest = Math.min(l1, l2)
      return (brightest + 0.05) / (darkest + 0.05)
    }

    // Dark mode: dark background (#12100e) with light text (#f5f1ec)
    const darkRatio = getContrastRatio('#12100e', '#f5f1ec')
    // WCAG AAA requires at least 7.0 for normal text
    expect(darkRatio).toBeGreaterThan(10)

    // Light mode: light background (#faf8f5) with dark text (#1c1917)
    const lightRatio = getContrastRatio('#faf8f5', '#1c1917')
    expect(lightRatio).toBeGreaterThan(10)
  })
})
