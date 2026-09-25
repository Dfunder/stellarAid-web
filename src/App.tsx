import { BrowserRouter, Link, Outlet, Route, Routes, useNavigate } from 'react-router-dom'
import { Button, ThemeToggle } from '@/components/ui'
import { useUiStore } from '@/stores'
import {
  AuthLayout,
  ConnectWalletButton,
  ForgotPasswordPage,
  GuestRoute,
  ProtectedRoute,
  ResetPasswordPage,
  LoginPage,
  VerifyEmailPage,
  WalletSettingsPage,
  useAuth,
} from '@/features/auth'
import ArtistRoute from '@/features/auth/components/ArtistRoute'

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
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-line">
        <div className="container flex flex-wrap items-center justify-between gap-3 py-4">
          <Link
            to="/"
            className="text-caption-sm font-semibold uppercase tracking-widest text-gold"
          >
            Lumora
          </Link>
          <nav className="flex items-center gap-2">
            <ConnectWalletButton />
            {isAuthenticated ? (
              <>
                <Link
                  to="/settings/wallets"
                  className="text-caption-sm text-muted hover:text-foreground"
                >
                  Wallets
                </Link>
                <span className="hidden max-w-40 truncate text-caption-sm text-muted sm:inline">
                  {user?.email}
                </span>
                <Button size="sm" variant="ghost" onClick={() => void logout()}>
                  Log out
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => navigate('/login')}>
                Sign in
              </Button>
            )}
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <ToastViewport />
    </div>
  )
}

function Home() {
  return (
    <main className="container py-24">
      <p className="text-caption-sm font-semibold uppercase tracking-widest text-gold">Lumora</p>
      <h1 className="mt-4 text-display">Transparent crowdfunding, borderless by default.</h1>
      <p className="mt-4 max-w-xl text-body text-muted">
        Launch campaigns, accept donations in Stellar assets, and verify every contribution
        on-chain.
      </p>
    </main>
  )
}

function Dashboard() {
  return (
    <main className="container py-16">
      <h1 className="text-h2">Dashboard</h1>
    </main>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Home />} />
        <Route element={<AuthLayout />}>
          <Route element={<GuestRoute />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
          </Route>
          <Route path="verify-email" element={<VerifyEmailPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="settings/wallets" element={<WalletSettingsPage />} />
        </Route>
        <Route element={<ArtistRoute />}>
          <Route path="artist" element={<Dashboard />} />
        </Route>
        <Route path="*" element={<Home />} />
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
