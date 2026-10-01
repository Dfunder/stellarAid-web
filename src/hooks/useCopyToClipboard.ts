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

/**
 * Fallback to document.execCommand('copy') for environments where
 * navigator.clipboard is unavailable (e.g. non-HTTPS/insecure contexts).
 */
export function fallbackCopyTextToClipboard(text: string): boolean {
  if (typeof document === 'undefined' || typeof document.createElement !== 'function') {
    return false
  }

  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.style.position = 'fixed'
  textArea.style.top = '0'
  textArea.style.left = '0'
  textArea.style.width = '2em'
  textArea.style.height = '2em'
  textArea.style.padding = '0'
  textArea.style.border = 'none'
  textArea.style.outline = 'none'
  textArea.style.boxShadow = 'none'
  textArea.style.background = 'transparent'
  textArea.setAttribute('readonly', '')

  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()
  textArea.setSelectionRange?.(0, text.length)

  let successful: boolean
  try {
    successful = document.execCommand('copy')
  } catch {
    successful = false
  }

  document.body.removeChild(textArea)
  return successful
}

/** Copies text to the clipboard and briefly remembers what was copied. */
export function useCopyToClipboard(resetDelayMs: number = DEFAULT_RESET_DELAY_MS): CopyToClipboard {
  const [copiedValue, setCopiedValue] = useState<string | null>(null)
  const timeoutRef = useRef<number | null>(null)
  const isMountedRef = useRef(true)
  const requestIdRef = useRef(0)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const copy = useCallback(
    async (value: string): Promise<boolean> => {
      const currentRequestId = ++requestIdRef.current

      let success: boolean
      if (
        typeof navigator !== 'undefined' &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === 'function'
      ) {
        try {
          await navigator.clipboard.writeText(value)
          success = true
        } catch {
          success = fallbackCopyTextToClipboard(value)
        }
      } else {
        success = fallbackCopyTextToClipboard(value)
      }

      if (!success) {
        return false
      }

      // Check if unmounted or if a newer copy request superseded this one
      if (!isMountedRef.current || currentRequestId !== requestIdRef.current) {
        return success
      }

      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }
      setCopiedValue(value)
      timeoutRef.current = window.setTimeout(() => {
        if (isMountedRef.current && currentRequestId === requestIdRef.current) {
          setCopiedValue(null)
        }
      }, resetDelayMs)

      return true
    },
    [resetDelayMs],
  )

  const isCopied = useCallback((value: string) => copiedValue === value, [copiedValue])

  return { copy, copiedValue, isCopied }
}
