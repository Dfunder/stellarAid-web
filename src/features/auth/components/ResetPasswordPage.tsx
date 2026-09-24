import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button, Input, Spinner } from '@/components/ui'
import { ApiError, getErrorMessage } from '@/services'
import { authApi } from '../services/authApi'
import { getPasswordIssues } from '../utils'
import PasswordStrengthMeter from './PasswordStrengthMeter'

type TokenStatus = 'checking' | 'valid' | 'invalid'

/** Statuses that mean the reset token was rejected: expired, malformed or already used. */
const REJECTED_TOKEN_STATUSES = new Set([400, 404, 410])

const PRIMARY_LINK_CLASSES =
  'inline-flex items-center rounded-control bg-primary px-5 py-2.5 text-body font-semibold text-primary-contrast shadow-card focus-visible:shadow-focus-ring'

const SECONDARY_LINK_CLASSES =
  'inline-flex items-center rounded-control border border-line bg-surface px-5 py-2.5 text-body font-semibold text-foreground shadow-card focus-visible:shadow-focus-ring'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordIssues, setPasswordIssues] = useState<string[]>([])
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  /** Set when the reset call itself reports the token as unusable. */
  const [wasRejectedOnSubmit, setWasRejectedOnSubmit] = useState(false)

  const validation = useQuery({
    queryKey: ['reset-token', token],
    queryFn: async () => {
      if (!token) throw new Error('The reset link is missing its token.')
      return authApi.validateResetToken(token)
    },
    enabled: token !== null,
    retry: false,
  })

  // An unusable token must never show the form; the re-request link is the way out.
  const isTokenUnusable =
    wasRejectedOnSubmit || validation.isError || validation.data?.valid === false
  const tokenStatus: TokenStatus =
    token === null || isTokenUnusable ? 'invalid' : validation.isPending ? 'checking' : 'valid'

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    if (!token) return

    setFormError(null)
    const issues = getPasswordIssues(password)
    const mismatch = password === confirmPassword ? null : 'The two passwords do not match.'
    setPasswordIssues(issues)
    setConfirmError(mismatch)
    if (issues.length > 0 || mismatch) return

    setIsSubmitting(true)
    try {
      await authApi.resetPassword({ token, password })
      navigate('/login', {
        replace: true,
        state: { notice: 'Password updated. Sign in with your new password.' },
      })
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status !== null &&
        REJECTED_TOKEN_STATUSES.has(error.status)
      ) {
        setWasRejectedOnSubmit(true)
      } else {
        setFormError(getErrorMessage(error))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container flex justify-center py-16">
      <div className="w-full max-w-md">
        {tokenStatus === 'checking' ? (
          <div className="flex items-center gap-3 py-16 text-muted">
            <Spinner label="Checking your reset link" className="h-5 w-5" />
            <span className="text-body">Checking your reset link…</span>
          </div>
        ) : null}

        {tokenStatus === 'invalid' ? (
          <>
            <h1 className="text-h2">This reset link is no longer valid</h1>
            <p className="mt-3 text-body text-muted">
              Reset links expire shortly after they are sent and can only be used once. Request a
              new link to set a new password.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/forgot-password" className={PRIMARY_LINK_CLASSES}>
                Request a new link
              </Link>
              <Link to="/login" className={SECONDARY_LINK_CLASSES}>
                Back to sign in
              </Link>
            </div>
          </>
        ) : null}

        {tokenStatus === 'valid' ? (
          <>
            <h1 className="text-h2">Choose a new password</h1>
            <p className="mt-1 text-caption text-muted">
              Use at least 8 characters with a mix of upper and lower case letters and a number.
            </p>

            {formError ? (
              <p
                role="alert"
                className="mt-6 rounded-control bg-danger/10 p-3 text-caption text-danger"
              >
                {formError}
              </p>
            ) : null}

            {passwordIssues.length > 0 ? (
              <ul
                role="alert"
                className="mt-6 list-disc rounded-control bg-danger/10 p-3 pl-8 text-caption text-danger"
              >
                {passwordIssues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
              <Input
                label="New password"
                type="password"
                name="new-password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <PasswordStrengthMeter password={password} />
              <Input
                label="Confirm new password"
                type="password"
                name="confirm-password"
                autoComplete="new-password"
                value={confirmPassword}
                error={confirmError}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
              <Button type="submit" isLoading={isSubmitting} className="mt-2">
                Update password
              </Button>
            </form>
          </>
        ) : null}
      </div>
    </div>
  )
}
