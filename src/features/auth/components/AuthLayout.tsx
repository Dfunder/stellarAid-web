import { Link, Outlet } from 'react-router-dom'
import { ThemeToggle } from '@/components/ui'

/** Shared shell for auth pages: branding panel beside the form area. */
export default function AuthLayout() {
  return (
    <div className="grid min-h-screen bg-background text-foreground lg:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-primary p-12 text-primary-contrast lg:flex">
        <Link to="/" className="text-caption-sm font-semibold uppercase tracking-widest">
          Lumora
        </Link>
        <div>
          <h2 className="text-h1">
            Transparent crowdfunding,
            <br />
            borderless by default.
          </h2>
          <p className="mt-4 max-w-md text-body opacity-80">
            Launch campaigns, accept donations in any Stellar asset and verify every contribution
            on-chain.
          </p>
        </div>
        <p className="text-caption-sm opacity-70">Powered by the Stellar Network</p>
      </aside>

      <div className="flex flex-col px-6 py-6 sm:px-10">
        <header className="flex items-center justify-between">
          <Link
            to="/"
            className="text-caption-sm font-semibold uppercase tracking-widest text-gold lg:invisible"
          >
            Lumora
          </Link>
          <ThemeToggle />
        </header>
        <main className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
