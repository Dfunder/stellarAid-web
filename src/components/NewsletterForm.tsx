import { useState, type FormEvent } from 'react'
import { Button, Input } from '@/components/ui'
import { validateEmail } from '@/lib/email'
import { sanitizeText } from '@/lib/sanitize'
import { checkRateLimit } from '@/utils/rate-limit'
import { useFormSubmission } from '@/hooks/useFormSubmission'

export interface NewsletterFormProps {
  onSubscribe: (email: string) => Promise<void>
  rateLimitKey?: string
}

/** Newsletter signup with email validation, honeypot, and rate limiting (#933, #943). */
export default function NewsletterForm({
  onSubscribe,
  rateLimitKey = 'newsletter-form',
}: NewsletterFormProps) {
  const [email, setEmail] = useState('')
  /** Honeypot — hidden from users; bots fill it. */
  const [company, setCompany] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const { isSubmitting, submitLabel, runSubmit } = useFormSubmission(async () => {
    const limit = checkRateLimit(rateLimitKey, { maxAttempts: 5, windowMs: 60_000 })
    if (!limit.allowed) {
      setFormError('Too many attempts. Please try again shortly.')
      return
    }

    // Honeypot triggered — pretend success without contacting the backend.
    if (company.trim()) {
      setDone(true)
      return
    }

    const cleanedEmail = sanitizeText(email).trim()
    await onSubscribe(cleanedEmail)
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
    return (
      <p role="status" className="text-caption text-muted">
        You&apos;re subscribed.
      </p>
    )
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

      {/* Honeypot field — visually hidden, not tabbable. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 'auto',
          width: 1,
          height: 1,
          overflow: 'hidden',
        }}
      >
        <label htmlFor="newsletter-company">
          Company
          <input
            id="newsletter-company"
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </label>
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
