import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui'
import { useFormSubmission } from '@/hooks/useFormSubmission'

export interface PaymentFormProps {
  amountLabel: string
  onPay: () => Promise<void>
}

/**
 * Payment confirmation form with strict double-submit protection (#937).
 * Critical for marketplace checkout to avoid double-charging.
 */
export default function PaymentForm({ amountLabel, onPay }: PaymentFormProps) {
  const [error, setError] = useState<string | null>(null)

  const { isSubmitting, submitLabel, runSubmit } = useFormSubmission(
    async () => {
      setError(null)
      try {
        await onPay()
      } catch {
        setError('Payment failed. You have not been charged twice.')
        throw undefined
      }
    },
    { cooldownMs: 3_000 },
  )

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void runSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-body text-foreground">Amount due: {amountLabel}</p>
      {error ? (
        <p role="alert" className="text-caption text-danger">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="w-full justify-center" disabled={isSubmitting}>
        {submitLabel('Confirm payment')}
      </Button>
    </form>
  )
}
