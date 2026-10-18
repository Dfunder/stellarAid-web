import { lazy, Suspense, useCallback, useEffect, useRef } from 'react'
import { BrowserRouter, Link, Outlet, Route, Routes, useNavigate } from 'react-router-dom'
import { Button, SkeletonGrid, SkeletonText, ThemeToggle } from '@/components/ui'
import { useCallback, useEffect, useRef } from 'react'
import { BrowserRouter, Link, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Button, ThemeToggle } from '@/components/ui'
import {
  AccountMenu,
  ArtistRoute,
  AuthLayout,
  ConnectWalletButton,
  GuestRoute,
  RequireAuth,
  useAuth,
} from '@/features/auth'
import { useUiStore } from '@/stores'
import { analytics } from '@/lib'

// #851 — every route used to be imported eagerly into a single bundle. Routes
// are now lazily imported from their own modules so the auth, marketplace and
// profile-editor code is not part of the initial bundle. Importing from the
// feature barrels here would defeat this, so the lazy targets point at the
// concrete page modules.
const LandingPage = lazy(() => import('@/features/landing/LandingPage'))
const StyleGuideHome = lazy(() => import('@/features/landing/StyleGuideHome'))

// Auth
const ForgotPasswordPage = lazy(() => import('@/features/auth/components/ForgotPasswordPage'))
const LoginPage = lazy(() => import('@/features/auth/components/LoginPage'))
const RegisterPage = lazy(() => import('@/features/auth/components/RegisterPage'))
const ResetPasswordPage = lazy(() => import('@/features/auth/components/ResetPasswordPage'))
const VerifyEmailPage = lazy(() => import('@/features/auth/components/VerifyEmailPage'))
const WalletSettingsPage = lazy(() => import('@/features/auth/components/WalletSettingsPage'))

// Profile
const ArtistProfilePage = lazy(() => import('@/features/profile/pages/ArtistProfilePage'))
const ProfileEditPage = lazy(() => import('@/features/profile/pages/ProfileEditPage'))
const FavoritesPage = lazy(() => import('@/features/profile/FavoritesPage'))

// Marketplace
const CategoryLandingPage = lazy(() => import('@/features/marketplace/CategoryLandingPage'))
const CheckoutPage = lazy(() => import('@/features/marketplace/CheckoutPage'))
const CreateArtworkListingForm = lazy(() => import('@/features/marketplace/CreateArtworkListingForm'))
const EditListing = lazy(() => import('@/features/marketplace/EditListing'))
const MyListingsDashboard = lazy(() => import('@/features/marketplace/MyListingsDashboard'))

// Orders, payments, transactions, portfolio
const OrderConfirmationScreen = lazy(() => import('@/features/orders/OrderConfirmationScreen'))
const PurchasesPage = lazy(() => import('@/features/orders/PurchasesPage'))
const PaymentResultScreen = lazy(() => import('@/features/payments/PaymentResultScreen'))
const TransactionHistoryPage = lazy(() => import('@/features/transactions/TransactionHistoryPage'))
const ArtistWithdrawal = lazy(() => import('@/features/portfolio/ArtistWithdrawal'))

const NAV_LINK_CLASSES =
  'text-caption font-semibold text-muted transition-colors hover:text-foreground'

/** Tone is conveyed by glyph as well as colour (#843). */
const TOAST_GLYPHS: Record<'error' | 'success' | 'info', string> = {
  error: '✕',
  success: '✓',
  info: 'ℹ',
}

/** Suspense fallback shared by every lazy route — no layout flash. */
function RouteFallback() {
  return (
    <div className="container py-12">
      <SkeletonText lines={2} className="mb-6" />
      <SkeletonGrid columns={3} rows={2} />
    </div>
  )
}

function ToastViewport() {
  const toasts = useUiStore((state) => state.toasts)
  const dismissToast = useUiStore((state) => state.dismissToast)
  const pauseToast = useUiStore((state) => state.pauseToast)
  const resumeToast = useUiStore((state) => state.resumeToast)

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed right-4 top-4 z-50 flex w-[min(100%-2rem,24rem)] flex-col gap-2"
    >
      {toasts.map((toast) => {
        const tone = toast.tone ?? 'info'
        const classes =
          tone === 'error'
            ? 'border-danger/40 bg-danger/10 text-danger'
            : tone === 'success'
              ? 'border-success/40 bg-success/10 text-success'
              : 'border-line bg-surface text-foreground'
        return (
          <button
            key={toast.id}
            type="button"
            onClick={() => dismissToast(toast.id)}
            onMouseEnter={() => pauseToast(toast.id)}
            onMouseLeave={() => resumeToast(toast.id)}
            onFocus={() => pauseToast(toast.id)}
            onBlur={() => resumeToast(toast.id)}
            className={`pointer-events-auto flex items-start gap-2 rounded-control border px-4 py-3 text-left shadow-card ${classes}`}
          >
            <span aria-hidden="true">{TOAST_GLYPHS[tone]}</span>
            <span className="text-caption">{toast.message}</span>
          </button>
        )
      })}
    </div>
  )
}

function AppShell() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const isMobileMenuOpen = useUiStore((state) => state.isMobileMenuOpen)
  const setMobileMenuOpen = useUiStore((state) => state.setMobileMenuOpen)
  const closeMenu = useCallback(() => setMobileMenuOpen(false), [setMobileMenuOpen])
  const toggleRef = useRef<HTMLButtonElement>(null)

  // Escape closes the mobile disclosure and returns focus is handled by the
  // toggle staying in the DOM; this only restores the closed state.
  useEffect(() => {
    if (!isMobileMenuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isMobileMenuOpen, closeMenu])

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/80 backdrop-blur-md">
        <div className="container flex items-center justify-between gap-3 py-3.5">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-caption-sm font-bold uppercase tracking-widest text-gold hover:opacity-90 transition-opacity">
              Lumora
            </Link>

            <nav className="hidden sm:flex items-center gap-4">
              <Link to="/artists/elena_art" className={NAV_LINK_CLASSES}>
                Featured Artist
              </Link>
              <Link to="/artists/stellar_nova" className={NAV_LINK_CLASSES}>
                Explore Creators
              </Link>
            </nav>

            <button
              ref={toggleRef}
              type="button"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden inline-flex h-9 w-9 items-center justify-center rounded-control border border-line text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span className="sr-only">{isMobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
              <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                {isMobileMenuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <ConnectWalletButton />

            {isAuthenticated ? (
              <AccountMenu />
            ) : (
              <Button size="sm" onClick={() => navigate('/login')}>
                Sign in
              </Button>
            )}

            <ThemeToggle />
          </div>
        </div>

        {isMobileMenuOpen && (
          <nav
            id="mobile-nav"
            aria-label="Mobile"
            className="sm:hidden border-t border-line bg-surface px-4 py-2"
          >
            <ul className="flex flex-col">
              <li>
                <Link to="/artists/elena_art" className={`block py-3 ${NAV_LINK_CLASSES}`} onClick={closeMenu}>
                  Featured Artist
                </Link>
              </li>
              <li>
                <Link to="/artists/stellar_nova" className={`block py-3 ${NAV_LINK_CLASSES}`} onClick={closeMenu}>
                  Explore Creators
                </Link>
              </li>
              <li>
                <Link to="/artist/listings" className={`block py-3 ${NAV_LINK_CLASSES}`} onClick={closeMenu}>
                  My Listings
                </Link>
              </li>
              <li>
                <Link to="/purchases" className={`block py-3 ${NAV_LINK_CLASSES}`} onClick={closeMenu}>
                  Purchases
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="border-t border-line py-8 text-center text-caption-sm text-muted bg-surface/40">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>Lumora — transparent, borderless crowdfunding and commissions on Stellar.</p>
          <div className="flex items-center gap-4 text-caption-sm">
            <Link to="/artists/elena_art" className="hover:text-foreground">Artists</Link>
            <Link to="/settings/wallets" className="hover:text-foreground">Wallets</Link>
            <a href="https://stellar.org" target="_blank" rel="noreferrer" className="hover:text-foreground">Stellar Network ↗</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

/**
 * #850 — the dashboard used to render four KPI cards with invented numbers
 * ("1,250 XLM", "1,840 views", "4.95 ★"). No data source backed them, so they
 * were removed. The shell now links to the real, working destinations.
 */
function Dashboard() {
  const { user } = useAuth()

  const links = [
    { to: '/artist/listings', label: 'My listings', description: 'Create and manage artwork listings.' },
    { to: '/purchases', label: 'My purchases', description: 'Track your orders and deliverables.' },
    { to: '/transactions', label: 'Transactions', description: 'Review on-chain activity.' },
    { to: '/earnings/withdraw', label: 'Withdraw earnings', description: 'Move available funds to a linked wallet.' },
  ]

  return (
    <div className="container py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-h2">Dashboard</h1>
          <p className="mt-1 text-caption text-muted">
            Welcome back{user?.name ? `, ${user.name}` : ''}.
          </p>
        </div>
        <Button asChild>
          <Link to="/profile/edit">Edit profile</Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="rounded-card border border-line bg-surface p-6 shadow-card transition-colors hover:bg-surface-muted focus-visible:shadow-focus-ring"
          >
            <h2 className="text-h3">{link.label}</h3>
            <p className="mt-1 text-caption text-muted">{link.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

function NotFoundPage() {
  const location = useLocation()
  const attemptedPath = location.pathname + location.search + location.hash
  useEffect(() => {
    analytics.track('not_found', { path: attemptedPath })
  }, [attemptedPath])
  return (
    <div className="container py-24 text-center">
      <h1 className="text-h2 font-bold">Page not found</h1>
      <p className="mt-2 text-body text-muted">The link you followed does not exist or has been moved.</p>
      {attemptedPath && attemptedPath !== '*' && (
        <p className="mt-1 text-caption text-muted break-all">Attempted path: {attemptedPath}</p>
      )}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center rounded-control bg-primary px-5 py-2.5 text-body font-semibold text-primary-contrast shadow-card focus-visible:shadow-focus-ring"
        >
          Back home
        </Link>
        <Link
          to="/artists/stellar_nova"
          className="inline-flex items-center rounded-control border border-line bg-surface px-5 py-2.5 text-body font-semibold text-foreground shadow-card hover:bg-surface-muted focus-visible:shadow-focus-ring"
        >
          Browse categories
        </Link>
        <Link
          to="/dashboard"
          className="inline-flex items-center rounded-control border border-line bg-surface px-5 py-2.5 text-body font-semibold text-foreground shadow-card hover:bg-surface-muted focus-visible:shadow-focus-ring"
        >
          Your profile
        </Link>
      </div>
    </div>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<LandingPage />} />

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route element={<GuestRoute />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
          </Route>
          <Route path="verify-email" element={<VerifyEmailPage />} />
        </Route>

        {/* Public artist profile (#676) */}
        <Route path="artists/:username" element={<ArtistProfilePage />} />

        {/* Public category landing */}
        <Route path="category/:slug" element={<CategoryLandingPage />} />

        {/* Protected Routes (#677 & #675) */}
        <Route path="profile/edit" element={<RequireAuth><ProfileEditPage /></RequireAuth>} />
        <Route path="dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="favorites" element={<RequireAuth><FavoritesPage /></RequireAuth>} />
        <Route path="transactions" element={<RequireAuth><TransactionHistoryPage /></RequireAuth>} />
        <Route path="earnings/withdraw" element={<RequireAuth><ArtistWithdrawal /></RequireAuth>} />
        <Route path="purchases" element={<RequireAuth><PurchasesPage /></RequireAuth>} />
        <Route path="order/confirmation" element={<RequireAuth><OrderConfirmationScreen /></RequireAuth>} />
        <Route path="checkout/:artworkId" element={<RequireAuth><CheckoutPage /></RequireAuth>} />
        <Route path="payment/result" element={<RequireAuth><PaymentResultScreen /></RequireAuth>} />
        <Route path="artist/listings" element={<RequireAuth><MyListingsDashboard /></RequireAuth>} />
        <Route path="artist/listings/new" element={<RequireAuth><CreateArtworkListingForm /></RequireAuth>} />
        <Route path="artist/listings/:listingId/edit" element={<RequireAuth><EditListing /></RequireAuth>} />

        {/* Wallet settings — linked from five entry points (#788) */}
        <Route path="settings/wallets" element={<RequireAuth><WalletSettingsPage /></RequireAuth>} />

        {/* Artist Route */}
        <Route element={<ArtistRoute />}>
          <Route path="artist" element={<Dashboard />} />
        </Route>

        {/* #850 — the design-system specimen is no longer the production home.
            It stays available behind a dev-only route. */}
        {import.meta.env.DEV && <Route path="style-guide" element={<StyleGuideHome />} />}

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
