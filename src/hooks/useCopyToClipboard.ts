import { useCallback, useEffect, useRef, useState } from 'react'

const DEFAULT_RESET_DELAY_MS = 2000

export interface CopyToClipboard {
  /** Copies `value` and reports whether the clipboard write succeeded. */
  copy: (value: string) => Promise<boolean>
  /** The value most recently copied, or `null` once the confirmation expired. */
  copiedValue: string | null
  /** Whether `value` is the one currently shown as copied. */
  isCopied: (value: string) => boolean
}

/** Copies text to the clipboard and briefly remembers what was copied. */
export function useCopyToClipboard(resetDelayMs: number = DEFAULT_RESET_DELAY_MS): CopyToClipboard {
  const [copiedValue, setCopiedValue] = useState<string | null>(null)
  const timeoutRef = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
    },
    [],
  )

  const copy = useCallback(
    async (value: string): Promise<boolean> => {
      try {
        await navigator.clipboard.writeText(value)
      } catch {
        // Clipboard access can be denied (permissions, insecure context); callers
        // fall back to showing the full value so it can be copied manually.
        return false
      }

      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
      setCopiedValue(value)
      timeoutRef.current = window.setTimeout(() => setCopiedValue(null), resetDelayMs)
      return true
    },
    [resetDelayMs],
  )

  const isCopied = useCallback((value: string) => copiedValue === value, [copiedValue])

  return { copy, copiedValue, isCopied }
}
