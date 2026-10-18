import { useState, type FormEvent } from 'react'
import { Button, Input } from '@/components/ui'
import { validateEmail } from '@/lib/email'
import { sanitizeMessage } from '@/lib/sanitize'
import { useFormSubmission } from '@/hooks/useFormSubmission'

export interface QueryFormProps {
  onSubmit: (payload: { email: string; query: string }) => Promise<void>
}

/** Support query form — validates email and sanitizes free text (#933). */
export default function QueryForm({ onSubmit }: QueryFormProps) {
  const [email, setEmail] = useState('')
  const [query, setQuery] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)

  const { isSubmitting, submitLabel, runSubmit } = useFormSubmission(async () => {
    await onSubmit({ email: email.trim(), query: sanitizeMessage(query) })
  })

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
      <Input
        label="Email"
        type="email"
        name="email"
        value={email}
        error={emailError ?? undefined}
        onChange={(e) => setEmail(e.target.value)}
      />
      <label className="flex flex-col gap-1 text-caption-sm font-semibold">
        Query
        <textarea
          name="query"
          rows={4}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="rounded-control border border-line bg-surface px-3 py-2 text-body font-normal"
        />
      </label>
      <Button type="submit" disabled={isSubmitting}>
        {submitLabel('Submit query')}
      </Button>
    </form>
  )
}
