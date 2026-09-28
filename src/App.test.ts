import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * `src/App.tsx` used to import the same feature barrels two and three times,
 * redeclaring the same bindings. TypeScript reported those as `TS2300
 * Duplicate identifier`, which is what made `npm run type-check` and
 * `npm run build` fail.
 *
 * These are source-level guards rather than a render test because the defect is
 * about module structure, not behaviour: the file cannot be imported at all
 * while the duplicates are present, so a behavioural test could not even load.
 */
const APP_SOURCE = readFileSync(resolve(__dirname, 'App.tsx'), 'utf8')

interface ImportStatement {
  module: string
  names: string[]
}

/** Parses `import { a, b } from 'mod'`, including multi-line specifier lists. */
function parseImports(source: string): ImportStatement[] {
  const statements: ImportStatement[] = []

  const named = /import\s+(?:type\s+)?\{([\s\S]*?)\}\s*from\s*'([^']+)'/g
  for (const match of source.matchAll(named)) {
    const specifiers = (match[1] ?? '')
      .split(',')
      .map((entry) => entry.trim().replace(/^type\s+/, '').split(/\s+as\s+/).pop()?.trim())
      .filter((name): name is string => Boolean(name))
    statements.push({ module: match[2] ?? '', names: specifiers })
  }

  const defaultImport = /import\s+(?:type\s+)?([A-Za-z_$][\w$]*)\s*(?:,\s*\{[\s\S]*?\})?\s*from\s*'([^']+)'/g
  for (const match of source.matchAll(defaultImport)) {
    if (match[1]) statements.push({ module: match[2] ?? '', names: [match[1]] })
  }

  return statements
}

/** Everything after the import block, where a binding would actually be used. */
function bodyAfterImports(source: string): string {
  const lines = source.split('\n')
  const lastImport = lines.reduce(
    (last, line, index) => (line.startsWith('import ') ? index : last),
    -1,
  )
  return lines.slice(lastImport + 1).join('\n')
}

const imports = parseImports(APP_SOURCE)
const body = bodyAfterImports(APP_SOURCE)

describe('App.tsx import structure', () => {
  it('finds the imports it guards', () => {
    expect(imports.length).toBeGreaterThan(0)
    expect(imports.some((entry) => entry.module === '@/features/auth')).toBe(true)
  })

  it('imports each module at most once', () => {
    const counts = new Map<string, number>()
    for (const entry of imports) {
      counts.set(entry.module, (counts.get(entry.module) ?? 0) + 1)
    }
    const duplicated = [...counts.entries()]
      .filter(([, count]) => count > 1)
      .map(([module, count]) => `${module} imported ${count} times`)
    expect(duplicated).toEqual([])
  })

  it('never declares the same binding twice across imports', () => {
    const seen = new Map<string, string>()
    const duplicates: string[] = []
    for (const { module, names } of imports) {
      for (const name of names) {
        const previous = seen.get(name)
        if (previous !== undefined) {
          duplicates.push(`${name} (${previous} and ${module})`)
        } else {
          seen.set(name, module)
        }
      }
    }
    expect(duplicates).toEqual([])
  })

  it('imports no unused binding', () => {
    const unused = imports
      .flatMap(({ names }) => names)
      .filter((name) => !new RegExp(`\\b${name}\\b`).test(body))
    expect(unused).toEqual([])
  })

  it('reaches every feature barrel through the @/ alias, never a deep path', () => {
    // CONTRIBUTING.md: cross-feature imports go through barrels only.
    const deep = imports.map((entry) => entry.module).filter((module) => module.startsWith('@/features/'))
    expect(deep.filter((module) => module.split('/').length > 3)).toEqual([])
  })
})
