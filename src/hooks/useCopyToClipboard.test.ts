import { afterEach, describe, expect, it, vi } from 'vitest'
import { writeClipboardText } from './useCopyToClipboard'

// Only the clipboard transport is covered here: rendering the hook itself
// needs a DOM environment, which lands with the Vitest + Testing Library
// setup tracked separately for this backlog.
describe('writeClipboardText', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('writes through navigator.clipboard when it is available', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })

    await expect(writeClipboardText('hello')).resolves.toBe(true)
    expect(writeText).toHaveBeenCalledWith('hello')
  })

  it('surfaces a rejected clipboard write as false instead of swallowing it', async () => {
    vi.stubGlobal('navigator', {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('permission denied')) },
    })

    await expect(writeClipboardText('hello')).resolves.toBe(false)
  })

  it('falls back to execCommand in an insecure context without navigator.clipboard', async () => {
    const execCommand = vi.fn().mockReturnValue(true)
    const select = vi.fn()
    const remove = vi.fn()
    const appendChild = vi.fn()
    const textarea = {
      value: '',
      style: { position: '', top: '', opacity: '' },
      setAttribute: vi.fn(),
      select,
      remove,
    }
    vi.stubGlobal('navigator', {})
    vi.stubGlobal('document', {
      createElement: vi.fn(() => textarea),
      body: { appendChild },
      execCommand,
    })

    await expect(writeClipboardText('fallback text')).resolves.toBe(true)
    expect(textarea.value).toBe('fallback text')
    expect(appendChild).toHaveBeenCalledWith(textarea)
    expect(select).toHaveBeenCalled()
    expect(execCommand).toHaveBeenCalledWith('copy')
    expect(remove).toHaveBeenCalled()
  })

  it('returns false when neither the clipboard nor execCommand is available', async () => {
    vi.stubGlobal('navigator', {})
    vi.stubGlobal('document', undefined)

    await expect(writeClipboardText('nothing available')).resolves.toBe(false)
  })
})
