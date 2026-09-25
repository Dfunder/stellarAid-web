import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getErrorMessage, isApiError } from '@/services'
import { authService } from '../services/authService'
import { useAuthStore } from '../stores/useAuthStore'
import { DEFAULT_AUTHENTICATED_PATH } from '../utils'
import { inputClass, linkClass, primaryButtonClass } from './formStyles'
import ResendVerificationButton from './ResendVerificationButton'

type VerifyStatus = 'verifying' | 'success' | 'already-verified' | 'expired' | 'error'

const SUCCESS_REDIRECT_DELAY_MS = 2000

/** Handles `/verify-email?token=` links from verification emails. */
export default function VerifyEmailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)

  const [status, setStatus] = useState<VerifyStatus>(token ? 'verifying' : 'expired')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [email, setEmail] = useState(user?.email ?? '')
  const requestedToken = useRef<string | null>(null)

  useEffect(() => {
    if (!token || requestedToken.current === token) return
    requestedToken.current = token

    authService
      .verifyEmail(token)
      .then(() => {
        const current = useAuthStore.getState().user
        if (current) setUser({ ...current, emailVerified: true })
        setStatus('success')
      })
      .catch((error: unknown) => {
        const code = isApiError(error) ? error.status : null
        if (code === 409) {
          setStatus('already-verified')
        } else if (code === 400 || code === 404 || code === 410) {
          setStatus('expired')
        } else {
          setErrorMessage(getErrorMessage(error))
          setStatus('error')
        }
      })
  }, [token, setUser])

  useEffect(() => {
    if (status !== 'success') return
    const timer = setTimeout(
      () => navigate(DEFAULT_AUTHENTICATED_PATH, { replace: true }),
      SUCCESS_REDIRECT_DELAY_MS,
    )
    return () => clearTimeout(timer)
  }, [status, navigate])

  if (status === 'verifying') {
    return (
      <div role="status" aria-live="polite">
        <h1 className="text-h2">Verifying your email…</h1>
        <p className="mt-2 text-body text-muted">This only takes a moment.</p>
      </div>
    )
  }

  if (status === 'success' || status === 'already-verified') {
    return (
      <div role="status" aria-live="polite">
        <h1 className="text-h2">
          {status === 'success' ? 'Email verified' : 'Email already verified'}
        </h1>
        <p className="mt-2 text-body text-muted">
          {status === 'success'
            ? 'Thanks! Taking you to your dashboard…'
            : 'Your email address is already verified.'}
        </p>
        <Link
          to={DEFAULT_AUTHENTICATED_PATH}
          replace
          className={`mt-8 block text-center ${primaryButtonClass}`}
        >
          Go to dashboard
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-h2">
        {status === 'expired' ? 'This link has expired' : 'We couldn’t verify your email'}
      </h1>
      <p className="mt-2 text-body text-muted">
        {status === 'expired'
          ? 'Verification links are valid for a limited time. Request a new one below.'
          : errorMessage}
      </p>

      <div className="mt-8 flex flex-col gap-3">
        {!user && (
          <label className="flex flex-col gap-1.5 text-caption font-semibold">
            Email
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClass}
            />
          </label>
        )}
        <ResendVerificationButton email={email.trim()} className="text-caption" />
      </div>

      <p className="mt-8 text-center text-caption text-muted">
        <Link to={user ? DEFAULT_AUTHENTICATED_PATH : '/login'} className={linkClass}>
          {user ? 'Back to dashboard' : 'Back to sign in'}
        </Link>
      </p>
    </div>
  )
}
