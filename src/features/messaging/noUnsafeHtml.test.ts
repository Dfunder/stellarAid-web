import { describe, expect, it } from 'vitest'

/**
 * Message bodies, attachment names and link previews are attacker-controlled as
 * soon as a thread involves someone the user does not know. This guards the two
 * ways untrusted content could reach the DOM as markup:
 *
 *  1. `dangerouslySetInnerHTML` / `innerHTML` anywhere in the feature.
 *  2. a `javascript:` / `data:` URL reaching an `href`, covered by the
 *     `isSafePreviewUrl` allowlist in `utils.test.ts`.
 *
 * React escapes interpolated text by default, so rule 1 is really a rule about
 * this feature never opting out of that escaping.
 *
 * The sources are collected with `import.meta.glob` rather than `node:fs`.
 * `tsconfig.app.json` sets `types: ["vite/client"]`, so a filesystem walk would
 * not type-check, and Vite's glob is the mechanism this project already has
 * types for. It also picks up newly added files without editing a list.
 */
const sources = import.meta.glob<unknown, string>(['./**/*.ts', './**/*.tsx', '!./**/*.test.ts'], {
  query: '?raw',
  import: 'default',
  eager: true,
})

describe('messaging renders untrusted content as text only', () => {
  it('finds the feature sources it guards', () => {
    expect(Object.keys(sources).length).toBeGreaterThan(0)
  })

  it('never opts out of React escaping', () => {
    const offenders = Object.entries(sources)
      .filter(([, source]) => /dangerouslySetInnerHTML|\.innerHTML\b/.test(source))
      .map(([path]) => path)
    expect(offenders).toEqual([])
  })

  it('has no unescaped-interpolation sink other than the validated preview href', () => {
    // `href` must be fed from a preview that went through the allowlist.
    const composer = sources['./components/MessageComposer.tsx']
    expect(composer).toBeTypeOf('string')
    expect(composer).toMatch(/composer\.preview\.href/)
    expect(composer).not.toMatch(/href=\{[^}]*\.(body|name)\b/)
  })
})
