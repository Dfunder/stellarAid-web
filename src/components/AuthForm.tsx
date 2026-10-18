import { useState, type FormEvent } from 'react'
import { Button, Input } from '@/components/ui'
import { validateEmail } from '@/lib/email'
import { useFormSubmission } from '@/hooks/useFormSubmission'

export interface AuthFormValues {
  email: string
  password: string
}

export interface AuthFormProps {
  /** Called only after client-side validation succeeds. */
  onSubmit: (values: AuthFormValues) => Promise<void>
  submitLabel?: string
  /** Optional banner rendered above the fields (e.g. server error). */
  serverError?: string | null
}

/**
 * Shared email/password form with validation and double-submit protection
 * (#932, #937).
 */
export default function AuthForm({
  onSubmit,
  submitLabel = 'Sign in',
  serverError = null,
}: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)

  const { isSubmitting, submitLabel: label, runSubmit } = useFormSubmission(
    async () => {
      await onSubmit({ email: email.trim(), password })
    },
  )

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const error = validateEmail(email)
    if (error) {
      setEmailError(error)
      return
    }
    setEmailError(null)
    void runSubmit()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {serverError ? (
        <p
          role="alert"
          className="rounded-control border border-danger bg-danger/10 px-3 py-2 text-caption text-danger"
        >
          {serverError}
        </p>
      ) : null}

      <Input
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        error={emailError ?? undefined}
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
      <Button type="submit" className="w-full justify-center" disabled={isSubmitting}>
        {label(submitLabel)}
      </Button>
    </form>
  )
}
