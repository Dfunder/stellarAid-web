import { useCallback, useRef, type KeyboardEvent, type RefObject } from 'react'

export interface UseFocusManagementOptions {
  /** Number of items in the grid. */
  itemCount: number
  /** Column count used for Up/Down navigation. Defaults to 1 (list). */
  columns?: number
  /** Called when the focused index changes via keyboard. */
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
 * Keyboard focus management for grid/list collections (#935).
 *
 * - Only the active cell is in the tab order (`tabIndex={0}`).
 * - Arrow keys move focus between cells (roving tabindex).
 * - Enter / Space activates the focused item.
 */
export function useFocusManagement(
  options: UseFocusManagementOptions,
): UseFocusManagementResult {
  const {
    itemCount,
    columns = 1,
    onIndexChange,
    onActivate,
    homeEnd = true,
  } = options

  const focusedRef = useRef(0)
  const containerRef = useRef<HTMLElement | null>(null)

  const focusIndex = useCallback(
    (index: number) => {
      if (itemCount === 0) return
      const next = Math.max(0, Math.min(itemCount - 1, index))
      focusedRef.current = next
      onIndexChange?.(next)
      const root = containerRef.current
      const el = root?.querySelector<HTMLElement>(`[data-focus-index="${next}"]`)
      el?.focus()
    },
    [itemCount, onIndexChange],
  )

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (itemCount === 0) return
      const current = focusedRef.current
      let next = current

      switch (event.key) {
        case 'ArrowRight':
          next = Math.min(itemCount - 1, current + 1)
          break
        case 'ArrowLeft':
          next = Math.max(0, current - 1)
          break
        case 'ArrowDown':
          next = Math.min(itemCount - 1, current + columns)
          break
        case 'ArrowUp':
          next = Math.max(0, current - columns)
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
    [columns, focusIndex, homeEnd, itemCount, onActivate],
  )

  const getItemProps = useCallback(
    (index: number) => ({
      tabIndex: index === focusedRef.current ? 0 : -1,
      'data-focus-index': index,
      onKeyDown,
      onFocus: () => {
        focusedRef.current = index
        onIndexChange?.(index)
      },
    }),
    [onIndexChange, onKeyDown],
  )

  return {
    focusedIndex: focusedRef.current,
    containerRef,
    getItemProps,
    focusIndex,
  }
}
