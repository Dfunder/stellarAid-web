import ThemeToggle from '@/components/ui/ThemeToggle'

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container">
        <header className="flex items-center justify-between py-6">
          <p className="text-caption-sm font-semibold uppercase tracking-widest text-gold">
            Lumora
          </p>
          <ThemeToggle />
        </header>
        <section className="flex flex-col items-center gap-6 py-20 text-center">
          <p className="text-caption-sm font-semibold uppercase tracking-widest text-gold">
            Lumora placeholder
          </p>
          <h1 className="text-display">
            Transparent crowdfunding,
            <br />
            borderless by default.
          </h1>
          <p className="max-w-xl text-body text-muted">
            Lumora lets creators launch campaigns, accept donations in XLM or any Stellar-based
            asset, and verify every contribution on-chain. This placeholder page renders the
            design-system tokens and typography ramp.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="rounded-control bg-primary px-5 py-2.5 text-body font-semibold text-primary-contrast">
              Get started
            </span>
            <span className="rounded-control border border-line bg-surface px-5 py-2.5 text-body font-semibold text-foreground">
              Explore campaigns
            </span>
          </div>
        </section>

        <section className="border-t border-line py-16">
          <h2 className="text-h2">Typography scale</h2>
          <p className="mt-1 max-w-2xl text-caption text-muted">
            One ramp for headings, body and captions - fluid between mobile and desktop.
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
              <span className="w-36 shrink-0 text-caption-sm text-muted">Heading 4</span>
              <span className="text-h4">The quick brown fox jumps over the lazy dog</span>
            </li>
            <li className="flex flex-col gap-1 border-b border-line py-3 sm:flex-row sm:items-baseline sm:gap-6">
              <span className="w-36 shrink-0 text-caption-sm text-muted">Body</span>
              <span className="text-body">The quick brown fox jumps over the lazy dog</span>
            </li>
            <li className="flex flex-col gap-1 border-b border-line py-3 sm:flex-row sm:items-baseline sm:gap-6">
              <span className="w-36 shrink-0 text-caption-sm text-muted">Caption</span>
              <span className="text-caption">The quick brown fox jumps over the lazy dog</span>
            </li>
            <li className="flex flex-col gap-1 border-b border-line py-3 sm:flex-row sm:items-baseline sm:gap-6">
              <span className="w-36 shrink-0 text-caption-sm text-muted">Caption small</span>
              <span className="text-caption-sm">The quick brown fox jumps over the lazy dog</span>
            </li>
          </ul>
        </section>

        <section className="border-t border-line py-16">
          <h2 className="text-h2">Color tokens</h2>
          <p className="mt-1 max-w-2xl text-caption text-muted">
            Every color in the app comes from these theme tokens - never arbitrary hex values.
          </p>
          <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <li className="overflow-hidden rounded-card bg-surface shadow-card">
              <div className="h-20 bg-primary" />
              <div className="px-3 py-2">
                <p className="text-caption-sm font-semibold">Primary</p>
                <p className="text-caption-sm text-muted">bg-primary</p>
              </div>
            </li>
            <li className="overflow-hidden rounded-card bg-surface shadow-card">
              <div className="h-20 bg-gold" />
              <div className="px-3 py-2">
                <p className="text-caption-sm font-semibold">Gold</p>
                <p className="text-caption-sm text-muted">bg-gold</p>
              </div>
            </li>
            <li className="overflow-hidden rounded-card bg-surface shadow-card">
              <div className="h-20 bg-success" />
              <div className="px-3 py-2">
                <p className="text-caption-sm font-semibold">Success</p>
                <p className="text-caption-sm text-muted">bg-success</p>
              </div>
            </li>
            <li className="overflow-hidden rounded-card bg-surface shadow-card">
              <div className="h-20 bg-warning" />
              <div className="px-3 py-2">
                <p className="text-caption-sm font-semibold">Warning</p>
                <p className="text-caption-sm text-muted">bg-warning</p>
              </div>
            </li>
            <li className="overflow-hidden rounded-card bg-surface shadow-card">
              <div className="h-20 bg-danger" />
              <div className="px-3 py-2">
                <p className="text-caption-sm font-semibold">Danger</p>
                <p className="text-caption-sm text-muted">bg-danger</p>
              </div>
            </li>
            <li className="overflow-hidden rounded-card bg-surface shadow-card">
              <div className="h-20 bg-neutral-900" />
              <div className="px-3 py-2">
                <p className="text-caption-sm font-semibold">Ink</p>
                <p className="text-caption-sm text-muted">bg-neutral-900</p>
              </div>
            </li>
          </ul>
        </section>

        <footer className="border-t border-line py-8 text-center text-caption-sm text-muted">
          Lumora web scaffold - styling foundation phase
        </footer>
      </main>
    </div>
  )
}
