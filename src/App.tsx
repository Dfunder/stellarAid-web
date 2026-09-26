import { BrowserRouter, Link, Outlet, Route, Routes, useNavigate } from 'react-router-dom'
import { Button, ThemeToggle } from '@/components/ui'
import {
  AccountMenu,
  ArtistRoute,
  AuthLayout,
  ConnectWalletButton,
  ForgotPasswordPage,
  GuestRoute,
  LoginPage,
  ProtectedRoute,
  RegisterPage,
  RequireAuth,
  ResetPasswordPage,
  useAuth,
  VerifyEmailPage,
  WalletSettingsPage,
} from '@/features/auth'
import { ArtistProfilePage, ProfileEditPage, FavoritesPage } from '@/features/profile'
import { CheckoutPage, MyListingsDashboard, EditListing, LicenseTermsField, DeliverableUpload, MultiAssetPricingInput, MultiStepListingWizard, CreateArtworkListingForm, RecentlyViewed, CategoryLandingPage } from '@/features/marketplace'
import { ArtistProfilePage, ProfileEditPage } from '@/features/profile'
import { CheckoutPage, MyListingsDashboard, EditListing, LicenseTermsField, DeliverableUpload, MultiAssetPricingInput, MultiStepListingWizard, CreateArtworkListingForm } from '@/features/marketplace'
import { PurchasesPage, OrderConfirmationScreen } from '@/features/orders'
import { TransactionHistoryPage } from '@/features/transactions'
import { ArtistWithdrawal } from '@/features/portfolio'
import { PaymentResultScreen } from '@/features/payments'
import { CheckoutPage, MyListingsDashboard, EditListing, LicenseTermsField } from '@/features/marketplace'
import { PurchasesPage, OrderConfirmationScreen } from '@/features/orders'
import { TransactionHistoryPage } from '@/features/transactions'
import { ArtistWithdrawal } from '@/features/portfolio'
import { useUiStore } from '@/stores'

const NAV_LINK_CLASSES =
  'text-caption font-semibold text-muted transition-colors hover:text-foreground'

function ToastViewport() {
  const toasts = useUiStore((state) => state.toasts)
  const dismissToast = useUiStore((state) => state.dismissToast)

  return (
    <div className="fixed right-4 top-4 z-50 grid w-[min(24rem,calc(100vw-2rem))] gap-2">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          role="alert"
          onClick={() => dismissToast(toast.id)}
          className="rounded-control border border-line bg-surface px-4 py-3 text-left text-caption shadow-card"
        >
          {toast.message}
        </button>
      ))}
    </div>
  )
}

function AppShell() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/80 backdrop-blur-md">
        <div className="container flex flex-wrap items-center justify-between gap-3 py-3.5">
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="text-caption-sm font-bold uppercase tracking-widest text-gold hover:opacity-90 transition-opacity"
            >
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
      </header>

      <main className="flex-1">
        <Outlet />
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

      <ToastViewport />
    </div>
  )
}

function Dashboard() {
  const { user } = useAuth()
  const username = user?.username || user?.id || 'creator'

  return (
    <main className="container min-h-[70vh] py-12 text-foreground">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="text-h2 font-bold">Creator Dashboard</h1>
          <p className="mt-1 text-body text-muted">
            Welcome back, {user?.name}. Manage your creator earnings, commissions, and artworks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={`/artists/${username}`}
            className="rounded-control border border-line bg-surface px-4 py-2 text-caption font-semibold text-foreground shadow-card hover:bg-surface-muted"
          >
            View Public Profile
          </Link>
          <Link
            to="/profile/edit"
            className="rounded-control bg-primary px-4 py-2 text-caption font-semibold text-primary-contrast shadow-card hover:bg-primary-strong"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-card border border-line bg-surface p-6 shadow-card">
          <span className="text-caption-sm text-muted">Escrow Balance</span>
          <p className="mt-2 text-h2 font-bold text-foreground">1,250 <span className="text-caption font-normal text-muted">XLM</span></p>
          <p className="mt-1 text-caption-sm text-success">Active smart contracts: 3</p>
        </div>
        <div className="rounded-card border border-line bg-surface p-6 shadow-card">
          <span className="text-caption-sm text-muted">Commissions In Progress</span>
          <p className="mt-2 text-h2 font-bold text-foreground">4</p>
          <p className="mt-1 text-caption-sm text-muted">2 due this week</p>
        </div>
        <div className="rounded-card border border-line bg-surface p-6 shadow-card">
          <span className="text-caption-sm text-muted">Profile Views (30d)</span>
          <p className="mt-2 text-h2 font-bold text-foreground">1,840</p>
          <p className="mt-1 text-caption-sm text-success">+18% vs last month</p>
        </div>
        <div className="rounded-card border border-line bg-surface p-6 shadow-card">
          <span className="text-caption-sm text-muted">Rating & Reviews</span>
          <p className="mt-2 text-h2 font-bold text-gold">4.95 ★</p>
          <p className="mt-1 text-caption-sm text-muted">48 verified reviews</p>
        </div>
      </div>
    </main>
  )
}

function NotFoundPage() {
  return (
    <div className="container py-24 text-center">
      <h1 className="text-h2 font-bold">Page not found</h1>
      <p className="mt-2 text-body text-muted">The link you followed does not exist or has been moved.</p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center rounded-control bg-primary px-5 py-2.5 text-body font-semibold text-primary-contrast shadow-card focus-visible:shadow-focus-ring"
      >
        Back home
      </Link>
    </div>
  )
}

/** Design-system reference & landing page. */
function StyleGuideHome() {
  return (
    <div className="container py-12">
      <section className="flex flex-col items-center gap-6 py-16 text-center">
        <p className="text-caption-sm font-semibold uppercase tracking-widest text-gold">
          Decentralized Creative Economy
        </p>
        <h1 className="text-display max-w-3xl">
          Transparent crowdfunding & creative commissions on Stellar.
        </h1>
        <p className="max-w-2xl text-body text-muted">
          Lumora empowers digital creators, illustrators, and artists to showcase portfolios, accept commissions with on-chain milestone escrow, and connect directly with backers worldwide.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          <Link
            to="/artists/elena_art"
            className="rounded-control bg-primary px-5 py-2.5 text-body font-semibold text-primary-contrast shadow-card hover:bg-primary-strong focus-visible:shadow-focus-ring"
          >
            Explore Elena's Profile
          </Link>
          <Link
            to="/artists/stellar_nova"
            className="rounded-control border border-line bg-surface px-5 py-2.5 text-body font-semibold text-foreground shadow-card hover:bg-surface-muted focus-visible:shadow-focus-ring"
          >
            Explore 3D Artists
          </Link>
          <Link
            to="/login"
            className="rounded-control border border-line bg-surface-muted px-5 py-2.5 text-body font-semibold text-foreground shadow-card hover:bg-surface focus-visible:shadow-focus-ring"
          >
            Sign in with Stellar
          </Link>
        </div>
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

function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<StyleGuideHome />} />

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

        {/* Canonical Public Artist Profile Page (#676) */}
        <Route path="artists/:username" element={<ArtistProfilePage />} />

        {/* Protected Routes (#677 & #675) */}
        <Route
          path="profile/edit"
          element={
            <RequireAuth>
              <ProfileEditPage />
            </RequireAuth>
          }
        />
<Route
          path="dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="transactions"
          element={
            <RequireAuth>
              <TransactionHistoryPage />
            </RequireAuth>
          }
        />
        <Route
          path="earnings/withdraw"
          element={
            <RequireAuth>
              <ArtistWithdrawal />
            </RequireAuth>
          }
        />
        <Route
          path="purchases"
          element={
            <RequireAuth>
              <PurchasesPage />
            </RequireAuth>
          }
        />
        <Route
          path="order/confirmation"
          element={
            <RequireAuth>
              <OrderConfirmationScreen />
            </RequireAuth>
          }
        />
        <Route
          path="transactions"
          element={
            <RequireAuth>
              <TransactionHistoryPage />
            </RequireAuth>
          }
        />
        <Route
          path="earnings/withdraw"
          element={
            <RequireAuth>
              <ArtistWithdrawal />
            </RequireAuth>
          }
        />
        <Route
          path="transactions"
          element={
            <RequireAuth>
              <TransactionHistoryPage />
            </RequireAuth>
          }
        />
        <Route
          path="earnings/withdraw"
          element={
            <RequireAuth>
              <ArtistWithdrawal />
            </RequireAuth>
          }
        />
        <Route
          path="purchases"
          element={
            <RequireAuth>
              <PurchasesPage />
            </RequireAuth>
          }
        />
        <Route
          path="order/confirmation"
          element={
            <RequireAuth>
              <OrderConfirmationScreen />
            </RequireAuth>
          }
        />
        <Route
          path="checkout/:artworkId"
          element={
            <RequireAuth>
              <CheckoutPage />
            </RequireAuth>
          }
        />
        <Route
          path="artist/listings"
          element={
            <RequireAuth>
              <MyListingsDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="artist/listings/:listingId/edit"
          element={
            <RequireAuth>
              <EditListing />
            </RequireAuth>
          }
        />
        <Route
          path="transactions"
          element={
            <RequireAuth>
              <TransactionHistoryPage />
            </RequireAuth>
          }
        />
        <Route
          path="earnings/withdraw"
          element={
            <RequireAuth>
              <ArtistWithdrawal />
            </RequireAuth>
          }
        />
        <Route
          path="purchases"
          element={
            <RequireAuth>
              <PurchasesPage />
            </RequireAuth>
          }
        />
        <Route
          path="order/confirmation"
          element={
            <RequireAuth>
              <OrderConfirmationScreen />
            </RequireAuth>
          }
        />
        <Route
          path="checkout/:artworkId"
          element={
            <RequireAuth>
              <CheckoutPage />
            </RequireAuth>
          }
        />
        <Route
          path="artist/listings"
          element={
            <RequireAuth>
              <MyListingsDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="artist/listings/:listingId/edit"
          element={
            <RequireAuth>
              <EditListing />
            </RequireAuth>
          }
        />
        <Route
          path="artist/listings/new"
          element={
            <RequireAuth>
              <CreateArtworkListingForm />
            </RequireAuth>
          }
        />
        <Route
          path="transactions"
          element={
            <RequireAuth>
              <TransactionHistoryPage />
            </RequireAuth>
          }
        />
        <Route
          path="earnings/withdraw"
          element={
            <RequireAuth>
              <ArtistWithdrawal />
            </RequireAuth>
          }
        />
        <Route
          path="purchases"
          element={
            <RequireAuth>
              <PurchasesPage />
            </RequireAuth>
          }
        />
        <Route
          path="order/confirmation"
          element={
            <RequireAuth>
              <OrderConfirmationScreen />
            </RequireAuth>
          }
        />
        <Route
          path="checkout/:artworkId"
          element={
            <RequireAuth>
              <CheckoutPage />
            </RequireAuth>
          }
        />
        <Route
          path="artist/listings"
          element={
            <RequireAuth>
              <MyListingsDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="artist/listings/:listingId/edit"
          element={
            <RequireAuth>
              <EditListing />
            </RequireAuth>
          }
        />
        <Route
          path="artist/listings/new"
          element={
            <RequireAuth>
              <CreateArtworkListingForm />
            </RequireAuth>
          }
        />
        <Route
          path="payment/result"
          element={
            <RequireAuth>
              <PaymentResultScreen />
            </RequireAuth>
          }
        />
        <Route
          path="transactions"
          element={
            <RequireAuth>
              <TransactionHistoryPage />
            </RequireAuth>
          }
        />
        <Route
          path="earnings/withdraw"
          element={
            <RequireAuth>
              <ArtistWithdrawal />
            </RequireAuth>
          }
        />
        <Route
          path="purchases"
          element={
            <RequireAuth>
              <PurchasesPage />
            </RequireAuth>
          }
        />
        <Route
          path="order/confirmation"
          element={
            <RequireAuth>
              <OrderConfirmationScreen />
            </RequireAuth>
          }
        />
        <Route
          path="checkout/:artworkId"
          element={
            <RequireAuth>
              <CheckoutPage />
            </RequireAuth>
          }
        />
        <Route
          path="artist/listings"
          element={
            <RequireAuth>
              <MyListingsDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="artist/listings/:listingId/edit"
          element={
            <RequireAuth>
              <EditListing />
            </RequireAuth>
          }
        />
        <Route
          path="artist/listings/new"
          element={
            <RequireAuth>
              <CreateArtworkListingForm />
            </RequireAuth>
          }
        />
        <Route
          path="payment/result"
          element={
            <RequireAuth>
              <PaymentResultScreen />
            </RequireAuth>
          }
        />
        <Route
          path="favorites"
          element={
            <RequireAuth>
              <FavoritesPage />
            </RequireAuth>
          }
        />
        <Route
          path="category/:slug"
          element={<CategoryLandingPage />}
        />

        {/* Artist Route */}
        <Route element={<ArtistRoute />}>
          <Route path="artist" element={<Dashboard />} />
        </Route>

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
