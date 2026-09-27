import { beforeEach, describe, expect, it } from 'vitest'
import { MAX_TOASTS, useUiStore } from './useUiStore'

function resetStore() {
  useUiStore.setState({ toasts: [], _toastSeq: 0 })
}

describe('useUiStore toasts', () => {
  beforeEach(resetStore)

  it('stacks a new toast', () => {
    useUiStore.getState().pushToast('hello')
    expect(useUiStore.getState().toasts).toHaveLength(1)
    expect(useUiStore.getState().toasts[0].message).toBe('hello')
    expect(useUiStore.getState().toasts[0].tone).toBe('info')
  })

  it('evicts the oldest toast when over capacity', () => {
    for (let i = 0; i < MAX_TOASTS + 2; i++) {
      useUiStore.getState().pushToast(`t${i}`)
    }
    const messages = useUiStore.getState().toasts.map((t) => t.message)
    expect(messages).toHaveLength(MAX_TOASTS)
    // Oldest entries (t0, t1) are gone; the newest remain.
    expect(messages).not.toContain('t0')
    expect(messages).not.toContain('t1')
    expect(messages).toContain(`t${MAX_TOASTS}`)
    expect(messages).toContain(`t${MAX_TOASTS + 1}`)
  })

  it('dismisses a toast by id', () => {
    useUiStore.getState().pushToast('gone')
    const id = useUiStore.getState().toasts[0].id
    useUiStore.getState().dismissToast(id)
    expect(useUiStore.getState().toasts).toHaveLength(0)
  })
})