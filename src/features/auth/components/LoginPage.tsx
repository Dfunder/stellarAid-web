import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { analytics } from '@/lib'
import { getErrorMessage, isApiError } from '@/services'
import { authService } from '../services/authService'
import { useAuthStore } from '../stores/useAuthStore'
import { safeRedirect } from '../utils'
import { inputClass, linkClass, primaryButtonClass } from './formStyles'
import ResendVerificationButton from './ResendVerificationButton'

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

      <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-5">
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
    </div>
  )
}
