import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'
import RecentlyViewed from '@/features/marketplace/RecentlyViewed'

/**
 * #850 — the production home route used to render the design-system specimen
 * (`StyleGuideHome`), so first-time visitors landed on a type-scale demo. This
 * is the real landing page: a hero, an explanation of the flow, and the
 * visitor's recently viewed artwork. It contains no fabricated figures.
 */
const VALUE_PROPS = [
  {
    title: 'Discover creators',
    body: 'Browse portfolios and commission work directly from Stellar-native artists.',
  },
  {
    title: 'Pay with escrow',
    body: 'Milestone escrow on the Stellar network releases funds only when work is delivered.',
  },
  {
    title: 'Withdraw anytime',
    body: 'Link a Stellar wallet and withdraw your earnings to it whenever you like.',
  },
]

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      <section className="container flex flex-col items-center gap-6 py-20 text-center">
        <p className="text-caption-sm font-semibold uppercase tracking-widest text-gold">
          Decentralized Creative Economy
        </p>
        <h1 className="text-display max-w-3xl">
          Transparent crowdfunding &amp; creative commissions on Stellar.
        </h1>
        <p className="max-w-2xl text-body text-muted">
          Lumora empowers digital creators, illustrators, and artists to showcase portfolios, accept
          commissions with on-chain milestone escrow, and connect directly with backers worldwide.
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Button asChild>
            <Link to="/artists/elena_art">Explore the marketplace</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link to="/register">Create an account</Link>
          </Button>
        </div>
      </section>

      <section className="container border-t border-line py-16" aria-labelledby="how-it-works">
        <h2 id="how-it-works" className="text-h2">How Lumora works</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {VALUE_PROPS.map((prop) => (
            <div key={prop.title} className="rounded-card border border-line bg-surface p-6 shadow-card">
              <h3 className="text-h3">{prop.title}</h3>
              <p className="mt-2 text-caption text-muted">{prop.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container border-t border-line py-16">
        <RecentlyViewed layout="grid" maxItems={6} title="Recently viewed artworks" />
      </section>

      <section className="border-t border-line bg-surface/40 py-16">
        <div className="container flex flex-col items-center gap-4 text-center">
          <h2 className="text-h2">Start collecting or selling on Lumora.</h2>
          <p className="max-w-xl text-caption text-muted">
            Sign in with a Stellar wallet in seconds — no passwords, no seed phrases shared with us.
          </p>
          <Button asChild>
            <Link to="/register">Create an account</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
