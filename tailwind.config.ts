import type { Config } from 'tailwindcss'

/**
 * Lumora design tokens.
 *
 * Every color used in the app must come from these tokens - never from an
 * arbitrary hex value in a component. Semantic colors (background, surface,
 * text, ...) are driven by CSS variables (`rgb(var(--color-*)`) so light and
 * dark themes switch automatically via `html[data-theme="dark"]`.
 */

const brandPurple = {
  50: '250 245 255',
  100: '237 233 254',
  200: '221 214 254',
  300: '196 181 253',
  400: '167 139 250',
  500: '139 92 246',
  600: '109 40 217',
  700: '91 33 182',
  800: '70 32 137',
  900: '46 20 90',
  950: '34 15 64',
}

const brandGold = {
  100: '250 240 214',
  300: '240 206 132',
  400: '225 178 79',
  500: '201 152 43',
  600: '155 110 21',
}

const neutral = {
  50: '250 250 249',
  100: '245 245 244',
  200: '231 229 228',
  300: '214 211 209',
  400: '168 162 158',
  500: '120 113 108',
  600: '87 83 78',
  700: '68 64 60',
  800: '41 37 36',
  900: '28 25 23',
  950: '12 10 9',
}

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
      sans: [
        'Inter Variable',
        'system-ui',
        '-apple-system',
        'Segoe UI',
        'Roboto',
        'sans-serif',
      ],
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
    },
  },
} satisfies Config