/** Full-page placeholder shown while the session is restored or a redirect happens. */
export default function AuthLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-screen items-center justify-center bg-background text-caption text-muted"
    >
      {label}
    </div>
  )
}
