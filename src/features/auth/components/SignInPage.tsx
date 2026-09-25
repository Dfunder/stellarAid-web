import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Input } from '@/components/ui'
import { useAuth } from '../hooks/useAuth'
import { emailSchema } from '../utils'

/** Passed through navigation from the reset flow and the route guard. */
interface NavigationState {
  from?: string
  notice?: string
}

export default function SignInPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const navigationState = (location.state ?? {}) as NavigationState
  const { login, isAuthenticated, isLoading, error: authError } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)

  const notice = navigationState.notice ?? null
  const redirectTo = navigationState.from ?? searchParams.get('redirect') ?? '/'

  useEffect(() => {
    if (isAuthenticated) navigate(redirectTo, { replace: true })
  }, [isAuthenticated, navigate, redirectTo])

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

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
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
      </div>
    </div>
  )
}
