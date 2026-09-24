import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button, Input } from '@/components/ui'
import { authApi } from '../services/authApi'
import { emailSchema } from '../utils'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()

    const parsedEmail = emailSchema.safeParse(email)
    if (!parsedEmail.success) {
      setEmailError(parsedEmail.error.issues[0]?.message ?? 'Enter a valid email address.')
      return
    }
    setEmailError(null)
    setIsSubmitting(true)

    try {
      await authApi.forgotPassword(parsedEmail.data)
    } catch {
      // Swallowed on purpose: the confirmation below is identical whether or not
      // the request succeeded, so no response can reveal account membership.
    } finally {
      setIsSubmitting(false)
      setIsSubmitted(true)
    }
  }

  return (
    <div className="container flex justify-center py-16">
      <div className="w-full max-w-md">
        {isSubmitted ? (
          <>
            <h1 className="text-h2">Check your inbox</h1>
            <p className="mt-3 text-body text-muted">
              If an account exists for{' '}
              <span className="font-semibold text-foreground">{email}</span>, we have sent a link to
              reset your password. It can take a few minutes to arrive.
            </p>
            <p className="mt-3 text-caption text-muted">
              Did not receive it? Check your spam folder, then request a new link.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => setIsSubmitted(false)}>
                Use a different email
              </Button>
              <Link
                to="/login"
                className="inline-flex items-center rounded-control bg-primary px-5 py-2.5 text-body font-semibold text-primary-contrast shadow-card focus-visible:shadow-focus-ring"
              >
                Back to sign in
              </Link>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-h2">Reset your password</h1>
            <p className="mt-1 text-caption text-muted">
              Enter the email address you signed up with and we will send you a reset link.
            </p>

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
              <Button type="submit" isLoading={isSubmitting} className="mt-2">
                Send reset link
              </Button>
            </form>

            <p className="mt-4 text-caption">
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Back to sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
