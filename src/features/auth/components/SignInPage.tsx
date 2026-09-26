import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button, Input } from '@/components/ui'
import { useAuth } from '../hooks/useAuth'
import { emailSchema } from '../utils'
import WalletAuthModal from './WalletAuthModal'

/** Passed through navigation from the reset flow and the route guard. */
interface NavigationState {
  from?: string
  notice?: string
}

export default function SignInPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const navigationState = (location.state ?? {}) as NavigationState
  const { login, isAuthenticated, isLoading, error: authError } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [isWalletModalOpen, setWalletModalOpen] = useState(false)

  const notice = navigationState.notice ?? null
  const redirectTo = navigationState.from ?? '/'

  useEffect(() => {
    if (isAuthenticated) navigate(redirectTo, { replace: true })
  }, [isAuthenticated, navigate, redirectTo])

  const handleWalletSuccess = () => {
    navigate(redirectTo, { replace: true })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()

    const parsedEmail = emailSchema.safeParse(email)
    if (!parsedEmail.success) {
      setEmailError(parsedEmail.error.issues[0]?.message ?? 'Enter a valid email address.')
      return
    }
    setEmailError(null)

    try {
      await login({ email: parsedEmail.data, password })
      navigate(redirectTo, { replace: true })
    } catch {
      // The failure message is surfaced from the auth store.
    }
  }

  return (
    <div className="container flex justify-center py-16">
      <div className="w-full max-w-md">
        <h1 className="text-h2">Sign in</h1>
        <p className="mt-1 text-caption text-muted">
          Welcome back. Enter your details to continue.
        </p>

        {notice ? (
          <p
            role="status"
            className="mt-6 rounded-control bg-surface-muted p-3 text-caption text-success"
          >
            {notice}
          </p>
        ) : null}

        {authError ? (
          <p
            role="alert"
            className="mt-6 rounded-control bg-danger/10 p-3 text-caption text-danger"
          >
            {authError}
          </p>
        ) : null}

        <div className="mt-6">
          <Button
            variant="secondary"
            className="w-full justify-center gap-2"
            onClick={() => setWalletModalOpen(true)}
          >
            <svg className="h-5 w-5 text-gold" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
            </svg>
            Sign in with Stellar Wallet
          </Button>
        </div>

        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-line" />
          </div>
          <div className="relative bg-surface px-4 text-caption text-muted">
            or continue with email
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Input
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            error={emailError}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Input
            label="Password"
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Button type="submit" isLoading={isLoading} className="mt-2">
            Sign in
          </Button>
        </form>

        <p className="mt-4 text-caption">
          <Link to="/forgot-password" className="font-semibold text-primary hover:underline">
            Forgot your password?
          </Link>
        </p>

        <WalletAuthModal
          isOpen={isWalletModalOpen}
          onClose={() => setWalletModalOpen(false)}
          onSuccess={handleWalletSuccess}
        />
      </div>
    </div>
  )
}
