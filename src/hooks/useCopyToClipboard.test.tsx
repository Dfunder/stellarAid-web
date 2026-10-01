// @vitest-environment jsdom
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fallbackCopyTextToClipboard, useCopyToClipboard } from './useCopyToClipboard'

// Tell React 19 that this is an act-supporting testing environment
// @ts-expect-error React testing environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true

/** Minimal React 19 renderHook test harness for jsdom */
function renderHook<T>(hook: () => T) {
  const result: { current: T } = {} as { current: T }
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)

  function TestComponent() {
    result.current = hook()
    return null
  }

  act(() => {
    root.render(<TestComponent />)
  })

  return {
    result,
    unmount: () => {
      act(() => {
        root.unmount()
      })
      container.remove()
    },
    rerender: () => {
      act(() => {
        root.render(<TestComponent />)
      })
    },
  }
}

describe('useCopyToClipboard', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('successfully copies text via navigator.clipboard and updates state', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    })

    const { result, unmount } = renderHook(() => useCopyToClipboard())

    expect(result.current.copiedValue).toBeNull()
    expect(result.current.isCopied('hello world')).toBe(false)

    let success: boolean | undefined
    await act(async () => {
      success = await result.current.copy('hello world')
    })

    expect(success).toBe(true)
    expect(writeTextMock).toHaveBeenCalledWith('hello world')
    expect(result.current.copiedValue).toBe('hello world')
    expect(result.current.isCopied('hello world')).toBe(true)
    expect(result.current.isCopied('other text')).toBe(false)

    // After resetDelayMs (default 2000ms), state clears
    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(result.current.copiedValue).toBeNull()
    expect(result.current.isCopied('hello world')).toBe(false)

    unmount()
  })

  it('surfaces false when clipboard writing fails and does not update state', async () => {
    const writeTextMock = vi.fn().mockRejectedValue(new Error('Permission denied'))
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    })
    // Mock execCommand to fail as well
    document.execCommand = vi.fn().mockReturnValue(false)

    const { result, unmount } = renderHook(() => useCopyToClipboard())

    let success: boolean | undefined
    await act(async () => {
      success = await result.current.copy('failed text')
    })

    expect(success).toBe(false)
    expect(result.current.copiedValue).toBeNull()
    expect(result.current.isCopied('failed text')).toBe(false)

    unmount()
  })

  it('falls back to document.execCommand when navigator.clipboard is unavailable', async () => {
    // Simulate insecure context without clipboard API
    delete (navigator as unknown as { clipboard?: unknown }).clipboard

    const execCommandMock = vi.fn().mockReturnValue(true)
    document.execCommand = execCommandMock

    const { result, unmount } = renderHook(() => useCopyToClipboard())

    let success: boolean | undefined
    await act(async () => {
      success = await result.current.copy('fallback text')
    })

    expect(success).toBe(true)
    expect(execCommandMock).toHaveBeenCalledWith('copy')
    expect(result.current.copiedValue).toBe('fallback text')
    expect(result.current.isCopied('fallback text')).toBe(true)

    unmount()
  })

  it('falls back to document.execCommand when navigator.clipboard.writeText throws', async () => {
    const writeTextMock = vi.fn().mockRejectedValue(new Error('NotAllowedError'))
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    })

    const execCommandMock = vi.fn().mockReturnValue(true)
    document.execCommand = execCommandMock

    const { result, unmount } = renderHook(() => useCopyToClipboard())

    let success: boolean | undefined
    await act(async () => {
      success = await result.current.copy('handled error fallback')
    })

    expect(success).toBe(true)
    expect(writeTextMock).toHaveBeenCalledWith('handled error fallback')
    expect(execCommandMock).toHaveBeenCalledWith('copy')
    expect(result.current.copiedValue).toBe('handled error fallback')

    unmount()
  })

  it('resolves out-of-order race so rapid copies end with the most recent value', async () => {
    let resolveFirst!: () => void
    let resolveSecond!: () => void

    const writeTextMock = vi.fn().mockImplementation((text: string) => {
      if (text === 'first') {
        return new Promise<void>((resolve) => {
          resolveFirst = resolve
        })
      }
      if (text === 'second') {
        return new Promise<void>((resolve) => {
          resolveSecond = resolve
        })
      }
      return Promise.resolve()
    })

    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    })

    const { result, unmount } = renderHook(() => useCopyToClipboard())

    // Start first copy (slow)
    let p1: Promise<boolean> | undefined
    act(() => {
      p1 = result.current.copy('first')
    })

    // Start second copy (fast)
    let p2: Promise<boolean> | undefined
    act(() => {
      p2 = result.current.copy('second')
    })

    // Second completes first
    await act(async () => {
      resolveSecond()
      await p2
    })

    expect(result.current.copiedValue).toBe('second')

    // First completes later (out-of-order)
    await act(async () => {
      resolveFirst()
      await p1
    })

    // Most recent value 'second' MUST be preserved, not overwritten by 'first'
    expect(result.current.copiedValue).toBe('second')
    expect(result.current.isCopied('second')).toBe(true)
    expect(result.current.isCopied('first')).toBe(false)

    unmount()
  })

  it('does not update state when unmounted while copy is in flight', async () => {
    let resolveCopy!: () => void
    const writeTextMock = vi.fn().mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveCopy = resolve
        }),
    )

    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    })

    const { result, unmount } = renderHook(() => useCopyToClipboard())

    let copyPromise: Promise<boolean> | undefined
    act(() => {
      copyPromise = result.current.copy('unmounted text')
    })

    // Unmount while in flight
    unmount()

    // Resolve after unmount
    await act(async () => {
      resolveCopy()
      await copyPromise
    })

    // No error or crash should occur
    expect(result.current.copiedValue).toBeNull()
  })
})

describe('fallbackCopyTextToClipboard helper', () => {
  it('returns true when document.execCommand succeeds', () => {
    document.execCommand = vi.fn().mockReturnValue(true)
    const res = fallbackCopyTextToClipboard('sample')
    expect(res).toBe(true)
    expect(document.execCommand).toHaveBeenCalledWith('copy')
  })

  it('returns false when document.execCommand throws or returns false', () => {
    document.execCommand = vi.fn().mockImplementation(() => {
      throw new Error('Unsupported')
    })
    const res = fallbackCopyTextToClipboard('sample')
    expect(res).toBe(false)
  })
})
