import { useState, type FormEvent } from 'react'
import { Button, Input } from '@/components/ui'
import { validateEmail } from '@/lib/email'
import { checkRateLimit } from '@/utils/rate-limit'
import { useFormSubmission } from '@/hooks/useFormSubmission'

export interface NewsletterFormProps {
  onSubscribe: (email: string) => Promise<void>
}

/** Newsletter signup with email validation and rate limiting (#933). */
export default function NewsletterForm({ onSubscribe }: NewsletterFormProps) {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const { isSubmitting, submitLabel, runSubmit } = useFormSubmission(async () => {
    const limit = checkRateLimit('newsletter-form', { maxAttempts: 5, windowMs: 60_000 })
    if (!limit.allowed) {
      setFormError('Too many attempts. Please try again shortly.')
      return
    }
    await onSubscribe(email.trim())
    setDone(true)
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const error = validateEmail(email)
    if (error) {
      setEmailError(error)
      return
    }
    setEmailError(null)
    setFormError(null)
    void runSubmit()
  }

  if (done) {
    return <p role="status" className="text-caption text-muted">You&apos;re subscribed.</p>
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3 sm:flex-row">
      <div className="flex-1">
        <Input
          label="Email"
          type="email"
          name="email"
          value={email}
          error={emailError ?? undefined}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={isSubmitting} className="self-end">
        {submitLabel('Subscribe')}
      </Button>
      {formError ? (
        <p role="alert" className="text-caption text-danger">
          {formError}
        </p>
      ) : null}
    </form>
  )
}
