/**
 * Design-system reference.
 *
 * Moved off the production `/` route in #850 — the home route now renders the
 * real marketing landing page. This specimen is only reachable in development
 * (`/style-guide`), where it is still useful when building UI.
 */
export default function StyleGuideHome() {
  return (
    <div className="container py-12">
      <section className="flex flex-col items-center gap-6 py-16 text-center">
        <p className="text-caption-sm font-semibold uppercase tracking-widest text-gold">
          Design System
        </p>
        <h1 className="text-display max-w-3xl">Lumora style guide.</h1>
        <p className="max-w-2xl text-body text-muted">
          A dev-only reference for the typography scale, colour tokens and shared components. It is
          not part of the production experience.
        </p>
      </section>

      <section className="border-t border-line py-16">
        <h2 className="text-h2">Typography scale</h2>
        <p className="mt-1 max-w-2xl text-caption text-muted">
          One ramp for headings, body, and captions — fluid between mobile and desktop.
        </p>
        <ul className="mt-10 grid gap-6">
          <li className="flex flex-col gap-1 border-b border-line py-3 sm:flex-row sm:items-baseline sm:gap-6">
            <span className="w-36 shrink-0 text-caption-sm text-muted">Display</span>
            <span className="text-display">The quick brown fox jumps over the lazy dog</span>
          </li>
          <li className="flex flex-col gap-1 border-b border-line py-3 sm:flex-row sm:items-baseline sm:gap-6">
            <span className="w-36 shrink-0 text-caption-sm text-muted">Heading 1</span>
            <span className="text-h1">The quick brown fox jumps over the lazy dog</span>
          </li>
          <li className="flex flex-col gap-1 border-b border-line py-3 sm:flex-row sm:items-baseline sm:gap-6">
            <span className="w-36 shrink-0 text-caption-sm text-muted">Heading 2</span>
            <span className="text-h2">The quick brown fox jumps over the lazy dog</span>
          </li>
          <li className="flex flex-col gap-1 border-b border-line py-3 sm:flex-row sm:items-baseline sm:gap-6">
            <span className="w-36 shrink-0 text-caption-sm text-muted">Heading 3</span>
            <span className="text-h3">The quick brown fox jumps over the lazy dog</span>
          </li>
          <li className="flex flex-col gap-1 border-b border-line py-3 sm:flex-row sm:items-baseline sm:gap-6">
            <span className="w-36 shrink-0 text-caption-sm text-muted">Body</span>
            <span className="text-body">The quick brown fox jumps over the lazy dog</span>
          </li>
          <li className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:gap-6">
            <span className="w-36 shrink-0 text-caption-sm text-muted">Caption small</span>
            <span className="text-caption-sm">The quick brown fox jumps over the lazy dog</span>
          </li>
        </ul>
      </section>
    </div>
  )
}
