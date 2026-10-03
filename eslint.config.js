import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import { defineConfig, globalIgnores } from 'eslint/config'

// Map jsx-a11y recommended rules to warn so they are initially non-blocking per #859
const jsxA11yWarnRules = Object.fromEntries(
  Object.entries(jsxA11y.flatConfigs.recommended.rules).map(([rule, severity]) => [
    rule,
    Array.isArray(severity)
      ? ['warn', ...severity.slice(1)]
      : severity === 'error'
        ? 'warn'
        : severity,
  ]),
)

export default defineConfig([
  globalIgnores(['dist', 'coverage']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.recommended,
      eslintConfigPrettier,
    ],
    rules: {
      ...jsxA11yWarnRules,
    },
    languageOptions: {
      globals: globals.browser,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
])
