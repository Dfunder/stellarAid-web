import { beforeEach, describe, expect, it } from 'vitest'
import { useUiStore } from './useUiStore'

describe('useUiStore', () => {
  beforeEach(() => {
    useUiStore.setState({ toasts: [] })
  })

  it('pushes a toast', () => {
    useUiStore.getState().pushToast('hello', 'success')
    const { toasts } = useUiStore.getState()
    expect(toasts).toHaveLength(1)
    expect(toasts[0].message).toBe('hello')
    expect(toasts[0].tone).toBe('success')
    expect(typeof toasts[0].id).toBe('string')
  })

  it('evicts the oldest toast when the cap is exceeded', () => {
    const { pushToast, getState } = useUiStore
    pushToast('first')
    pushToast('second')
    pushToast('third')
    pushToast('fourth')
    pushToast('fifth')
    expect(getState().toasts.map((t) => t.message)).toEqual(['second', 'third', 'fourth', 'fifth'])
  })

  it('dismisses a toast by id', () => {
    const { pushToast, dismissToast, getState } = useUiStore
    pushToast('first')
    const id = getState().toasts[0].id
    dismissToast(id)
    expect(getState().toasts).toHaveLength(0)
  })

  it('falls back when crypto.randomUUID is unavailable', () => {
    const original = globalThis.crypto
    // @ts-expect-error - removing crypto to simulate an older runtime
    delete globalThis.crypto
    try {
      useUiStore.getState().pushToast('no uuid')
      expect(useUiStore.getState().toasts[0].message).toBe('no uuid')
    } finally {
      globalThis.crypto = original
    }
  })
})