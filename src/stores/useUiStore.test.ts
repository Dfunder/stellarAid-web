import { beforeEach, describe, expect, it } from 'vitest'
import { MAX_TOASTS, useUiStore } from './useUiStore'

function pushMany(count: number) {
  const { pushToast } = useUiStore.getState()
  for (let i = 0; i < count; i++) pushToast(`toast-${i}`, 'info')
}

describe('useUiStore toasts', () => {
  beforeEach(() => {
    useUiStore.setState({ toasts: [] })
  })

  it('appends toasts and evicts the oldest past the cap', () => {
    pushMany(MAX_TOASTS + 2)

    const { toasts } = useUiStore.getState()
    expect(toasts).toHaveLength(MAX_TOASTS)
    expect(toasts[0].message).toBe('toast-2')
    expect(toasts[toasts.length - 1].message).toBe(`toast-${MAX_TOASTS + 1}`)
  })

  it('dismisses a toast by id', () => {
    useUiStore.getState().pushToast('first', 'error')
    const { pushToast } = useUiStore.getState()
    pushToast('second', 'info')

    const [first, second] = useUiStore.getState().toasts
    useUiStore.getState().dismissToast(first.id)

    const { toasts } = useUiStore.getState()
    expect(toasts).toHaveLength(1)
    expect(toasts[0].id).toBe(second.id)
  })

  it('keeps toasts below the cap untouched', () => {
    pushMany(2)

    expect(useUiStore.getState().toasts).toHaveLength(2)
  })
})