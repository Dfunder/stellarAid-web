import { useState, type FormEvent } from 'react'
import { Button, Input } from '@/components/ui'
import { validateEmail } from '@/lib/email'
import { useFormSubmission } from '@/hooks/useFormSubmission'

export interface ResetPasswordFormProps {
  onSubmit: (email: string) => Promise<void>
  submitLabel?: string
}

/**
 * Password-reset request form with email validation (#932) and
 * double-submit protection (#937).
 */
export default function ResetPasswordForm({
  onSubmit,
  submitLabel = 'Send reset link',
}: ResetPasswordFormProps) {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const { isSubmitting, submitLabel: label, runSubmit } = useFormSubmission(
    async () => {
      await onSubmit(email.trim())
      setDone(true)
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

  if (done) {
    return (
      <p role="status" className="text-body text-muted">
        If an account exists for that email, a reset link is on its way.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
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
      <Button type="submit" className="w-full justify-center" disabled={isSubmitting}>
        {label(submitLabel)}
      </Button>
    </form>
  )
}
