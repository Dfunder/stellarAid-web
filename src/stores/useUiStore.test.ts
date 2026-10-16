import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TOAST_DURATION_MS, useUiStore } from './useUiStore'

function resetToasts(): void {
  useUiStore.setState({ toasts: [] })
}

describe('useUiStore toasts', () => {
  beforeEach(() => {
    resetToasts()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    resetToasts()
  })

  it('pushToast does not throw when crypto.randomUUID is unavailable', () => {
    vi.stubGlobal('crypto', {})

    expect(() => useUiStore.getState().pushToast('plain-http origin', 'error')).not.toThrow()
    const { toasts } = useUiStore.getState()
    expect(toasts).toHaveLength(1)
    expect(toasts[0]?.message).toBe('plain-http origin')
    expect(toasts[0]?.tone).toBe('error')
  })

  it('evicts the oldest toast when the cap is exceeded, keeping the newest', () => {
    for (const message of ['one', 'two', 'three', 'four', 'five']) {
      useUiStore.getState().pushToast(message)
    }

    const messages = useUiStore.getState().toasts.map((toast) => toast.message)
    expect(messages).toEqual(['two', 'three', 'four', 'five'])
    expect(messages).not.toContain('one')
  })

  it('auto-dismisses a toast after TOAST_DURATION_MS', () => {
    useUiStore.getState().pushToast('gone soon')
    expect(useUiStore.getState().toasts).toHaveLength(1)

    vi.advanceTimersByTime(TOAST_DURATION_MS)
    expect(useUiStore.getState().toasts).toHaveLength(0)
  })

  it('clears the auto-dismiss timer when dismissed manually', () => {
    const clearSpy = vi.spyOn(globalThis, 'clearTimeout')

    useUiStore.getState().pushToast('manual dismiss')
    const first = useUiStore.getState().toasts[0]
    expect(first).toBeDefined()
    if (!first) return

    useUiStore.getState().dismissToast(first.id)
    expect(clearSpy).toHaveBeenCalledTimes(1)
    expect(useUiStore.getState().toasts).toHaveLength(0)

    // The timer is gone, so advancing time must not dismiss anything again.
    vi.advanceTimersByTime(TOAST_DURATION_MS + 1000)
    expect(clearSpy).toHaveBeenCalledTimes(1)

    clearSpy.mockRestore()
  })
})

describe('useUiStore shape', () => {
  it('only exposes the toast state (no unused theme, mobile menu or modal slices)', () => {
    expect(Object.keys(useUiStore.getState()).sort()).toEqual(['dismissToast', 'pushToast', 'toasts'])
  })
})
