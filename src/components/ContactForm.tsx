import { useState, type FormEvent } from 'react'
import { Button, Input } from '@/components/ui'
import { validateEmail } from '@/lib/email'
import { sanitizeMessage } from '@/lib/sanitize'
import { checkRateLimit } from '@/utils/rate-limit'
import { useFormSubmission } from '@/hooks/useFormSubmission'

export interface ContactPayload {
  email: string
  message: string
  name?: string
}

export interface ContactFormProps {
  onSubmit: (payload: ContactPayload) => Promise<void>
  rateLimitKey?: string
}

/**
 * Contact form with email validation, message sanitization, honeypot,
 * client rate limiting, and double-submit protection (#933, #937).
 */
export default function ContactForm({ onSubmit, rateLimitKey = 'contact-form' }: ContactFormProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  /** Honeypot — hidden from users; bots fill it. */
  const [company, setCompany] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [messageError, setMessageError] = useState<string | null>(null)
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

    const cleaned = sanitizeMessage(message)
    await onSubmit({
      email: email.trim(),
      name: name.trim() || undefined,
      message: cleaned,
    })
    setDone(true)
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    const emailErr = validateEmail(email)
    if (emailErr) {
      setEmailError(emailErr)
      return
    }
    setEmailError(null)

    // Validate the sanitized body: a message made up only of markup (e.g.
    // `<script>…</script>`) must not be sent as an empty payload.
    if (!message.trim() || !sanitizeMessage(message)) {
      setMessageError('Message is required')
      return
    }
    setMessageError(null)
    void runSubmit()
  }

  if (done) {
    return (
      <p role="status" className="text-body text-muted">
        Thanks — your message has been sent.
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
        label="Name"
        name="name"
        autoComplete="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
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
        <label>
          Company
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-caption-sm font-semibold text-foreground">
        Message
        <textarea
          name="message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          aria-invalid={messageError ? true : undefined}
          className="rounded-control border border-line bg-surface px-3 py-2 text-body font-normal text-foreground shadow-card focus-visible:shadow-focus-ring"
        />
        {messageError ? (
          <span className="text-caption-sm font-normal text-danger">{messageError}</span>
        ) : null}
      </label>

      <Button type="submit" className="w-full justify-center" disabled={isSubmitting}>
        {submitLabel('Send message')}
      </Button>
    </form>
  )
}
