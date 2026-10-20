import { useState, type FormEvent } from 'react'
import { Button, Input } from '@/components/ui'
import { validateEmail } from '@/lib/email'
import { sanitizeMessage } from '@/lib/sanitize'
import { checkRateLimit } from '@/utils/rate-limit'
import { useFormSubmission } from '@/hooks/useFormSubmission'

export interface QueryFormProps {
  onSubmit: (payload: { email: string; query: string }) => Promise<void>
  rateLimitKey?: string
}

/** Support query form — validates email, sanitizes free text, honeypot, and rate limits (#933, #943). */
export default function QueryForm({ onSubmit, rateLimitKey = 'query-form' }: QueryFormProps) {
  const [email, setEmail] = useState('')
  const [query, setQuery] = useState('')
  /** Honeypot — hidden from users; bots fill it. */
  const [company, setCompany] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [queryError, setQueryError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const { isSubmitting, submitLabel, runSubmit } = useFormSubmission(async () => {
    const limit = checkRateLimit(rateLimitKey, { maxAttempts: 3, windowMs: 60_000 })
    if (!limit.allowed) {
      setFormError(`Please wait ${Math.ceil(limit.retryAfterMs / 1000)}s before sending again.`)
      return
    }

    // Honeypot triggered — pretend success without contacting the backend.
    if (company.trim()) {
      setDone(true)
      return
    }

    await onSubmit({ email: email.trim(), query: sanitizeMessage(query) })
    setDone(true)
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    const error = validateEmail(email)
    if (error) {
      setEmailError(error)
      return
    }
    setEmailError(null)

    // Free text is sanitized before sending, so reject bodies that contain
    // nothing but markup rather than submitting an empty query (#989, #991, #943).
    if (!query.trim() || !sanitizeMessage(query)) {
      setQueryError('Query is required')
      return
    }
    setQueryError(null)
    void runSubmit()
  }

  if (done) {
    return (
      <p role="status" className="text-body text-muted">
        Thanks — your query has been submitted.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {formError ? (
        <p role="alert" className="text-caption text-danger">
          {formError}
        </p>
      ) : null}

      <Input
        label="Email"
        type="email"
        name="email"
        value={email}
        error={emailError ?? undefined}
        onChange={(e) => setEmail(e.target.value)}
      />

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
        <label htmlFor="query-company">
          Company
          <input
            id="query-company"
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </label>
      </div>

      <label htmlFor="query-text" className="flex flex-col gap-1 text-caption-sm font-semibold">
        Query
        <textarea
          id="query-text"
          name="query"
          rows={4}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            if (queryError) setQueryError(null)
          }}
          aria-invalid={queryError ? true : undefined}
          className="rounded-control border border-line bg-surface px-3 py-2 text-body font-normal"
        />
        {queryError ? (
          <span className="text-caption-sm font-normal text-danger">{queryError}</span>
        ) : null}
      </label>
      <Button type="submit" disabled={isSubmitting}>
        {submitLabel('Submit query')}
      </Button>
    </form>
  )
}
