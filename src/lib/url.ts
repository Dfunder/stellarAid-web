/**
 * Validates a server-supplied URL before it is allowed into an `href` or `src`
 * sink. Returns the URL string when it is a safe external https URL (http in
 * dev only), optionally restricted to `allowedHosts`, and `null` otherwise.
 */
export function safeExternalUrl(
  raw: unknown,
  allowedHosts?: string[],
): string | null {
  if (typeof raw !== 'string' || raw.length === 0) return null

  let parsed: URL
  try {
    parsed = new URL(raw)
  } catch {
    // Relative URLs and malformed input are never acceptable for an external link.
    return null
  }

  const isDevHttp = import.meta.env?.DEV === true && parsed.protocol === 'http:'
  if (parsed.protocol !== 'https:' && !isDevHttp) return null

  if (allowedHosts && !allowedHosts.includes(parsed.hostname)) return null

  return parsed.href
}