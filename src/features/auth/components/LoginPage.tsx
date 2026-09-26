import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { analytics } from '@/lib'
import { getErrorMessage, isApiError } from '@/services'
import { authService } from '../services/authService'
import { useAuthStore } from '../stores/useAuthStore'
import { safeRedirect } from '../utils'
import { inputClass, linkClass, primaryButtonClass } from './formStyles'
import ResendVerificationButton from './ResendVerificationButton'
import WalletAuthModal from './WalletAuthModal'

const INVALID_CREDENTIALS = 'Invalid email or password.'

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const setSession = useAuthStore((state) => state.setSession)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null)
  const [isWalletModalOpen, setWalletModalOpen] = useState(false)

  const handleWalletLoginSuccess = () => {
    analytics.track('login', { method: 'wallet' })
    navigate(safeRedirect(searchParams.get('redirect')), { replace: true })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    setUnverifiedEmail(null)
    try {
      const session = await authService.login({ email: email.trim(), password })
      setSession(session)
      analytics.track('login', { method: 'password' })
      navigate(safeRedirect(searchParams.get('redirect')), { replace: true })
    } catch (err) {
      const status = isApiError(err) ? err.status : null
      if (status === 403) {
        setUnverifiedEmail(email.trim())
      } else if (status === 400 || status === 401 || status === 404) {
        // Same message for unknown email and wrong password: no user enumeration.
        setError(INVALID_CREDENTIALS)
      } else {
        setError(getErrorMessage(err))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h1 className="text-h2">Sign in</h1>
      <p className="mt-2 text-body text-muted">Welcome back to Lumora.</p>

      {/* Wallet Login CTA */}
      <div className="mt-6">
        <button
          type="button"
          onClick={() => setWalletModalOpen(true)}
          className="flex w-full items-center justify-center gap-3 rounded-control border border-line bg-surface p-3 text-body font-semibold text-foreground shadow-card transition-colors hover:bg-surface-muted focus-visible:shadow-focus-ring"
        >
          <svg className="h-5 w-5 text-gold" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
          </svg>
          Sign in with Stellar Wallet
        </button>
      </div>

      <div className="relative my-6 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-line" />
        </div>
        <div className="relative bg-surface px-4 text-caption text-muted">
          or sign in with email
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {error && (
          <p
            role="alert"
            className="rounded-control border border-danger bg-danger/10 px-3 py-2 text-caption text-danger"
          >
            {error}
          </p>
        )}
        {unverifiedEmail && (
          <div
            role="alert"
            className="flex flex-col gap-1 rounded-control border border-warning bg-warning/10 px-3 py-2 text-caption"
          >
            <p>Please verify your email address before signing in.</p>
            <ResendVerificationButton email={unverifiedEmail} />
          </div>
        )}

        <label className="flex flex-col gap-1.5 text-caption font-semibold">
          Email
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClass}
          />
        </label>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-caption">
            <label htmlFor="login-password" className="font-semibold">
              Password
            </label>
            <Link to="/forgot-password" className={linkClass}>
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={`${inputClass} pr-16`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((shown) => !shown)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              className="absolute inset-y-0 right-0 px-3 text-caption-sm font-semibold text-muted hover:text-foreground"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || !email || !password}
          className={primaryButtonClass}
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-caption text-muted">
        New to Lumora?{' '}
        <Link to="/register" className={linkClass}>
          Create an account
        </Link>
      </p>

      <WalletAuthModal
        isOpen={isWalletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        onSuccess={handleWalletLoginSuccess}
      />
    </div>
  )
}
