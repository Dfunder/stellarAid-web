/**
 * Lightweight HTML sanitizer for user-supplied text (#933).
 *
 * Strips script/style tags, event-handler attributes, javascript: URLs,
 * and residual markup so contact / query payloads cannot carry XSS.
 * Prefer a dedicated library (DOMPurify) when HTML rendering is intentional;
 * for plain-text form bodies this is sufficient and dependency-free.
 */

// Remove the whole element, not just its tags: stripping only `<script>`
// leaves `alert(1)` behind as message text. The unclosed variant handles a
// payload that never closes the tag.
const SCRIPT_OR_STYLE = /<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi
const UNCLOSED_SCRIPT_OR_STYLE = /<(script|style)\b[^>]*>[\s\S]*$/gi
const ALL_TAGS = /<\/?[a-zA-Z][^>]*>/g
const EVENT_ATTR = /\son\w+\s*=\s*(['"]).*?\1/gi
const UNQUOTED_EVENT_ATTR = /\son\w+\s*=\s*[^>\s]+/gi
const JS_URL = /javascript\s*:/gi
const VBS_URL = /vbscript\s*:/gi
const DATA_HTML = /data\s*:\s*text\/html/gi

/** Remove active HTML/script content from a string. */
export function sanitizeText(input: string): string {
  let current = input
  let prev: string
  // Loop until fixed-point so nested tags cannot bypass single-pass replacements.
  do {
    prev = current
    current = current
      .replace(SCRIPT_OR_STYLE, '')
      .replace(UNCLOSED_SCRIPT_OR_STYLE, '')
      .replace(EVENT_ATTR, '')
      .replace(UNQUOTED_EVENT_ATTR, '')
      .replace(JS_URL, '')
      .replace(VBS_URL, '')
      .replace(DATA_HTML, '')
      .replace(ALL_TAGS, '')
  } while (current !== prev)

  return current.trim()
}

/** Sanitize a free-form message body and enforce a max length. */
export function sanitizeMessage(input: string, maxLength = 5_000): string {
  const cleaned = sanitizeText(input)
  return cleaned.length > maxLength ? cleaned.slice(0, maxLength) : cleaned
}
