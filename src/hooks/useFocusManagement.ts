import { useCallback, useRef, useState, type KeyboardEvent, type RefObject } from 'react'

export interface UseFocusManagementOptions {
  /** Number of items in the grid. */
  itemCount: number
  /** Column count used for Up/Down navigation. Defaults to 1 (list). */
  columns?: number
  /** Called when the focused index changes via keyboard or focus. */
  onIndexChange?: (index: number) => void
  /** Called when Enter/Space activates the focused item. */
  onActivate?: (index: number) => void
  /** When true, Home/End jump to first/last item. Default true. */
  homeEnd?: boolean
}

export interface UseFocusManagementResult {
  /** Currently focused item index. */
  focusedIndex: number
  /** Attach to the grid container. */
  containerRef: RefObject<HTMLElement | null>
  /** Bind to each cell: `{...getItemProps(index)}`. */
  getItemProps: (index: number) => {
    tabIndex: number
    'data-focus-index': number
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => void
    onFocus: () => void
  }
  /** Programmatically move focus to an index. */
  focusIndex: (index: number) => void
}

/**
 * Keyboard focus management for grid/list collections (#935, #988).
 *
 * - Only the active cell is in the tab order (`tabIndex={0}`).
 * - Arrow keys move focus between cells (roving tabindex).
 * - Enter / Space activates the focused item.
 *
 * The active index is React state, not only a ref: roving tabindex depends on
 * a re-render so the previously focused cell flips back to `tabIndex={-1}`.
 */
export function useFocusManagement(options: UseFocusManagementOptions): UseFocusManagementResult {
  const { itemCount, columns = 1, onIndexChange, onActivate, homeEnd = true } = options

  const [focusedIndex, setFocusedIndex] = useState(0)
  const focusedRef = useRef(0)
  const containerRef = useRef<HTMLElement | null>(null)
  const safeColumns = Math.max(1, columns)

  // A shrinking item list must not leave the active index pointing past the end.
  const activeIndex = itemCount === 0 ? 0 : Math.min(focusedIndex, itemCount - 1)

  const setFocus = useCallback(
    (index: number) => {
      if (itemCount === 0) return
      const next = Math.max(0, Math.min(itemCount - 1, index))
      if (focusedRef.current === next) return

      focusedRef.current = next
      setFocusedIndex(next)
      onIndexChange?.(next)
    },
    [itemCount, onIndexChange],
  )

  const focusIndex = useCallback(
    (index: number) => {
      if (itemCount === 0) return

      const next = Math.max(0, Math.min(itemCount - 1, index))
      setFocus(next)
      containerRef.current?.querySelector<HTMLElement>(`[data-focus-index="${next}"]`)?.focus()
    },
    [itemCount, setFocus],
  )

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (itemCount === 0) return

      const current = Math.min(focusedRef.current, itemCount - 1)
      let next: number

      switch (event.key) {
        case 'ArrowRight':
          next = Math.min(itemCount - 1, current + 1)
          break
        case 'ArrowLeft':
          next = Math.max(0, current - 1)
          break
        case 'ArrowDown':
          next = Math.min(itemCount - 1, current + safeColumns)
          break
        case 'ArrowUp':
          next = Math.max(0, current - safeColumns)
          break
        case 'Home':
          if (homeEnd) next = 0
          else return
          break
        case 'End':
          if (homeEnd) next = itemCount - 1
          else return
          break
        case 'Enter':
        case ' ':
          event.preventDefault()
          onActivate?.(current)
          return
        default:
          return
      }

      if (next !== current) {
        event.preventDefault()
        focusIndex(next)
      }
    },
    [focusIndex, homeEnd, itemCount, onActivate, safeColumns],
  )

  const getItemProps = useCallback(
    (index: number) => ({
      tabIndex: index === activeIndex ? 0 : -1,
      'data-focus-index': index,
      onKeyDown,
      onFocus: () => setFocus(index),
    }),
    [activeIndex, onKeyDown, setFocus],
  )

  return {
    focusedIndex: activeIndex,
    containerRef,
    getItemProps,
    focusIndex,
  }
}
