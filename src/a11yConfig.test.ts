import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const ESLINT_CONFIG_SOURCE = readFileSync(resolve(__dirname, '../eslint.config.js'), 'utf8')

describe('ESLint JSX A11y configuration (Issue #859)', () => {
  it('imports eslint-plugin-jsx-a11y', () => {
    expect(ESLINT_CONFIG_SOURCE).toContain("import jsxA11y from 'eslint-plugin-jsx-a11y'")
  })

  it('includes jsxA11y.flatConfigs.recommended in extends', () => {
    expect(ESLINT_CONFIG_SOURCE).toContain('jsxA11y.flatConfigs.recommended')
  })

  it('configures settings.react.version to detect', () => {
    expect(ESLINT_CONFIG_SOURCE).toMatch(/settings:\s*\{\s*react:\s*\{\s*version:\s*['"]detect['"]/)
  })

  it('configures jsx-a11y rules initially as warn (non-blocking)', () => {
    expect(ESLINT_CONFIG_SOURCE).toContain('jsxA11yWarnRules')
  })
})
