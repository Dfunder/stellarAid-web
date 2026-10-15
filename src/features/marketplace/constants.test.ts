import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { LICENSE_PRESETS } from './constants'
import LicenseTermsField from './LicenseTermsField'

function sourceFiles(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      out.push(...sourceFiles(full))
    } else if (/\.(ts|tsx)$/.test(entry) && !entry.endsWith('.d.ts')) {
      out.push(full)
    }
  }
  return out
}

describe('LICENSE_PRESETS (#779)', () => {
  it('is declared in exactly one module under src/', () => {
    const declarations = sourceFiles(resolve(__dirname, '../..')).filter((file) =>
      /LICENSE_PRESETS\s*=/.test(readFileSync(file, 'utf8'))
    )

    // Import sites reference the binding; only constants.ts assigns it.
    expect(declarations.map((file) => file.replace(/\\/g, '/'))).toEqual([
      expect.stringContaining('marketplace/constants.ts'),
    ])
  })

  it('is exported from the marketplace feature barrel', () => {
    const barrel = readFileSync(resolve(__dirname, 'index.ts'), 'utf8')

    expect(barrel).toMatch(/export \{ LICENSE_PRESETS \} from '\.\/constants'/)
  })

  it('renders every preset label in LicenseTermsField without throwing', () => {
    const html = renderToStaticMarkup(
      createElement(LicenseTermsField, { value: '', onChange: () => {} })
    )

    for (const preset of LICENSE_PRESETS) {
      expect(html).toContain(preset.label)
    }
  })
})
