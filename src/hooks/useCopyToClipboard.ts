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

function copyWithExecCommand(value: string): boolean {
  if (typeof document === 'undefined' || typeof document.execCommand !== 'function') return false
  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.top = '0'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  try {
    return document.execCommand('copy')
  } catch {
    return false
  } finally {
    textarea.remove()
  }
}

/**
 * Writes text to the clipboard and reports whether it landed.
 *
 * `navigator.clipboard` only exists in secure contexts; in insecure ones
 * (plain-HTTP LAN/dev origins) we fall back to the legacy `execCommand` path
 * instead of failing silently. A rejected clipboard write (permission denied)
 * returns `false` so callers can surface it rather than swallowing it.
 */
export async function writeClipboardText(value: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(value)
      return true
    } catch {
      return false
    }
  }
  return copyWithExecCommand(value)
}

/** Copies text to the clipboard and briefly remembers what was copied. */
export function useCopyToClipboard(resetDelayMs: number = DEFAULT_RESET_DELAY_MS): CopyToClipboard {
  const [copiedValue, setCopiedValue] = useState<string | null>(null)
  const timeoutRef = useRef<number | null>(null)
  // Monotonic id so a slow, earlier copy cannot overwrite a newer one.
  const requestIdRef = useRef(0)
  const mountedRef = useRef(true)

  useEffect(
    () => () => {
      mountedRef.current = false
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
    },
    [],
  )

  const copy = useCallback(
    async (value: string): Promise<boolean> => {
      const requestId = ++requestIdRef.current

      const ok = await writeClipboardText(value)
      if (!ok) return false

      // A newer copy (or an unmounted component) owns the badge now: the write
      // succeeded, but this resolution must not move the visible state back.
      if (requestId !== requestIdRef.current || !mountedRef.current) return true

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
