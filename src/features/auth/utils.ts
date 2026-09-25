export const DEFAULT_AUTHENTICATED_PATH = '/dashboard'

/** Returns `redirect` when it is a same-origin path, otherwise the default destination. */
export function safeRedirect(redirect: string | null): string {
  if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) return redirect
  return DEFAULT_AUTHENTICATED_PATH
}
