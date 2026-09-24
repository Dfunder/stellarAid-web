import type { Config } from 'tailwindcss'

/**
 * Lumora design tokens.
 *
 * Every color used in the app must come from these tokens - never from an
 * arbitrary hex value in a component. Semantic colors (background, surface,
 * text, ...) are driven by CSS variables (`rgb(var(--color-*)`) so light and
 * dark themes switch automatically via `html[data-theme="dark"]`.
 */

const rgb = (variable: string): string => `rgb(var(${variable}) / <alpha-value>)`

const semantic = {
  background: rgb('--color-background'),
  surface: rgb('--color-surface'),
  'surface-muted': rgb('--color-surface-muted'),
  foreground: rgb('--color-foreground'),
  muted: rgb('--color-muted'),
  line: rgb('--color-line'),
  primary: {
    DEFAULT: rgb('--color-primary'),
    strong: rgb('--color-primary-strong'),
    contrast: rgb('--color-primary-contrast'),
  },
  gold: rgb('--color-gold'),
  success: rgb('--color-success'),
  warning: rgb('--color-warning'),
  danger: rgb('--color-danger'),
  focus: rgb('--color-focus-ring'),
}

const scale = (variable: string) =>
  Object.fromEntries(
    [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((shade) => [
      shade,
      rgb(`--${variable}-${shade}`),
    ]),
  )

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1440px',
      },
    },
    fontFamily: {
      sans: ['Inter Variable', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      display: [
        'Sora Variable',
        'Inter Variable',
        'system-ui',
        '-apple-system',
        'Segoe UI',
        'Roboto',
        'sans-serif',
      ],
    },
    colors: {
      ...semantic,
      'brand-purple': scale('brand-purple'),
      'brand-gold': scale('brand-gold'),
      neutral: scale('neutral'),
    },
    extend: {
      borderRadius: {
        control: '0.5rem',
        card: '0.75rem',
      },
      boxShadow: {
        card: '0 1px 2px rgb(0 0 0 / 0.05), 0 1px 3px rgb(0 0 0 / 0.06)',
        elevated: '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
        'focus-ring': '0 0 0 3px rgb(var(--color-focus-ring) / 0.35)',
      },
      fontSize: {
        display: [
          'clamp(2.75rem, 1rem + 4.5vw, 4.5rem)',
          { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '700' },
        ],
        h1: [
          'clamp(2rem, 0.75rem + 3vw, 3rem)',
          { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' },
        ],
        h2: [
          'clamp(1.5rem, 0.5rem + 2vw, 2.25rem)',
          { lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '600' },
        ],
        h3: [
          'clamp(1.25rem, 0.375rem + 1.5vw, 1.75rem)',
          { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '600' },
        ],
        h4: ['1.25rem', { lineHeight: '1.3', fontWeight: '600' }],
        h5: ['1.125rem', { lineHeight: '1.35', fontWeight: '600' }],
        h6: ['1rem', { lineHeight: '1.4', fontWeight: '600' }],
        body: ['1rem', { lineHeight: '1.6' }],
        caption: ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],
        'caption-sm': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.02em' }],
      },
    },
  },
} satisfies Config
