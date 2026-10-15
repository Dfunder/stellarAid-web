import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ROUTE_TABLE } from './routes'

const SRC_DIR = resolve(__dirname)
const APP_SOURCE = readFileSync(join(SRC_DIR, 'App.tsx'), 'utf8')

/**
 * Every `path="…"` declared in `App.tsx`. The router is the source of truth;
 * this test fails when it and `routes.ts` drift, when a path is declared
 * twice, or when a guard moves.
 */
const DECLARED_PATHS = [...APP_SOURCE.matchAll(/path="([^"]+)"/g)].map((match) => match[1])

describe('route table (#790/#803)', () => {
  it('declares no duplicate paths — in the table or in the router', () => {
    const tablePaths = ROUTE_TABLE.map((route) => route.path)
    expect(new Set(tablePaths).size, 'duplicate path in ROUTE_TABLE').toBe(tablePaths.length)
    expect(new Set(DECLARED_PATHS).size, 'duplicate path="…" in App.tsx').toBe(
      DECLARED_PATHS.length,
    )
  })

  it('keeps the table in sync with the routes rendered in App.tsx', () => {
    // Every table entry must exist in the router. (Direction is table → App.tsx
    // so that route additions in other PRs don't collide here; duplicates and
    // guard drift are covered by the other cases in this file.)
    const declared = new Set(DECLARED_PATHS)
    const missing = ROUTE_TABLE.map((route) => route.path).filter((path) => !declared.has(path))
    expect(missing, 'routes.ts entries missing from App.tsx').toEqual([])
  })

  it('wraps artist-only routes in <ArtistRoute>', () => {
    const wrapper = APP_SOURCE.indexOf('<Route element={<ArtistRoute />}>')
    expect(wrapper, 'ArtistRoute wrapper missing from App.tsx').toBeGreaterThan(-1)
    const artistBlock = APP_SOURCE.slice(wrapper, wrapper + 400)
    for (const route of ROUTE_TABLE.filter((r) => r.guard === 'artist')) {
      expect(artistBlock, `artist route "${route.path}" must sit inside <ArtistRoute>`).toContain(
        `path="${route.path}"`,
      )
    }
  })

  it('wraps authed routes in <RequireAuth>', () => {
    for (const route of ROUTE_TABLE.filter((r) => r.guard === 'auth')) {
      const at = APP_SOURCE.indexOf(`path="${route.path}"`)
      expect(at, `route "${route.path}" missing from App.tsx`).toBeGreaterThan(-1)
      const block = APP_SOURCE.slice(at, at + 220)
      expect(block, `authed route "${route.path}" must be wrapped in <RequireAuth>`).toContain(
        '<RequireAuth>',
      )
    }
  })

  it('keeps guest routes inside the <GuestRoute> block', () => {
    const wrapper = APP_SOURCE.indexOf('<Route element={<GuestRoute />}>')
    expect(wrapper, 'GuestRoute wrapper missing from App.tsx').toBeGreaterThan(-1)
    // The four guest one-liners render consecutively right after the wrapper.
    const guestBlock = APP_SOURCE.slice(wrapper, wrapper + 700)
    for (const route of ROUTE_TABLE.filter((r) => r.guard === 'guest')) {
      expect(guestBlock, `guest route "${route.path}" must sit inside <GuestRoute>`).toContain(
        `path="${route.path}"`,
      )
    }
  })
})
