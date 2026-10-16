import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = resolve(__dirname, '..')
const APP_SOURCE = readFileSync(join(ROOT, 'src', 'App.tsx'), 'utf8')
const README = readFileSync(join(ROOT, 'README.md'), 'utf8')

const ROUTES_SECTION = README.slice(README.indexOf('## Routes'), README.indexOf('## Tech Stack'))

/** Every route path in the router, as documented: `/` for the index route and `*` for the catch-all. */
const declared = new Set(
  [...APP_SOURCE.matchAll(/path="([^"]+)"/g)].map((match) => (match[1] === '*' ? '*' : `/${match[1]}`)),
)
declared.add('/')

const documented = new Set(
  [...ROUTES_SECTION.matchAll(/^\| `([^`]+)`/gm)].map((match) => match[1] as string),
)

describe('README routes table', () => {
  it('documents every route declared in App.tsx', () => {
    const missing = [...declared].filter((path) => !documented.has(path))
    expect(missing).toEqual([])
  })

  it('does not document routes that no longer exist', () => {
    const stale = [...documented].filter((path) => !declared.has(path))
    expect(stale).toEqual([])
  })
})

describe('README environment table', () => {
  const ENV_SOURCE = readFileSync(join(ROOT, 'src', 'config', 'env.ts'), 'utf8')
  const ENV_EXAMPLE = readFileSync(join(ROOT, '.env.example'), 'utf8')
  const read = [...ENV_SOURCE.matchAll(/\b(VITE_[A-Z_]+):/g)].map((match) => match[1] as string)

  it('documents every VITE_ variable that env.ts reads', () => {
    for (const key of new Set(read)) expect(README).toContain(`\`${key}\``)
  })

  it('lists every VITE_ variable that env.ts reads in .env.example', () => {
    for (const key of new Set(read)) expect(ENV_EXAMPLE).toContain(key)
  })

  it('opens .env.example with the public-bundle warning', () => {
    expect(ENV_EXAMPLE.split('\n').slice(0, 6).join('\n')).toMatch(/PUBLIC client bundle/)
  })
})
