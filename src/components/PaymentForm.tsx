import { useMemo, useState, type FormEvent } from 'react'
import { Button, Input } from '@/components/ui'
import { useFormSubmission } from '@/hooks/useFormSubmission'
import { normalizeAmount, isPositiveAmount, parseAmountLabel } from '@/lib/payments'

export interface PaymentFormProps {
  /** Display label for the cart total, e.g. `"10 XLM"`. */
  amountLabel: string
  /**
   * Canonical cart total as a decimal string. Defaults to the numeric part of
   * `amountLabel` so existing callers keep working.
   */
  cartTotal?: string
  /** Asset symbol shown next to the total; defaults to the one in `amountLabel`. */
  asset?: string
  /**
   * Called with the validated amount. The form never calls this when the
   * entered amount does not equal the cart total.
   */
  onPay: (amount: string) => Promise<void>
  /**
   * Optional server-side cart total lookup. It runs immediately before payment
   * so a stale client-side total can never be charged (#995).
   */
  revalidateCartTotal?: () => Promise<string>
}

/**
 * Payment confirmation form with cart-total validation and strict
 * double-submit protection (#937, #995).
 *
 * The user must enter the amount shown in the cart; submit is blocked when the
 * values differ, and the total is optionally re-checked with the server right
 * before `onPay` runs.
 */
export default function PaymentForm({
  amountLabel,
  cartTotal,
  asset,
  onPay,
  revalidateCartTotal,
}: PaymentFormProps) {
  const labelDetails = useMemo(() => parseAmountLabel(amountLabel), [amountLabel])
  const configuredTotal = cartTotal ?? labelDetails?.amount ?? ''
  const assetLabel = asset ?? labelDetails?.asset ?? ''

  const [amount, setAmount] = useState(configuredTotal)
  const [validatedTotal, setValidatedTotal] = useState(configuredTotal)
  const [amountError, setAmountError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const displayTotal = validatedTotal || configuredTotal
  const totalLabel = `${displayTotal}${assetLabel ? ` ${assetLabel}` : ''}`.trim()

  const formatWithAsset = (value: string): string => {
    const normalized = normalizeAmount(value)
    const shown = normalized ?? value.trim()
    return `${shown}${assetLabel ? ` ${assetLabel}` : ''}`.trim()
  }

  const validateAmount = (): string | null => {
    if (!isPositiveAmount(amount)) {
      return 'Enter a valid payment amount greater than zero.'
    }
    if (!isPositiveAmount(displayTotal)) {
      return 'The cart total is unavailable. Refresh checkout and try again.'
    }
    if (!normalizeAmount(amount) || !normalizeAmount(displayTotal)) {
      return 'Enter a valid payment amount greater than zero.'
    }
    if (normalizeAmount(amount) !== normalizeAmount(displayTotal)) {
      return `Amount mismatch: expected ${formatWithAsset(displayTotal)}, got ${formatWithAsset(amount)}`
    }
    return null
  }

  const { isSubmitting, submitLabel, runSubmit } = useFormSubmission(
    async () => {
      setError(null)

      // Recalculate the total server-side immediately before charging. A
      // client-provided total on its own must not decide what is paid.
      let serverTotal = displayTotal
      if (revalidateCartTotal) {
        try {
          serverTotal = await revalidateCartTotal()
          setValidatedTotal(serverTotal)
        } catch {
          setError('We could not confirm the cart total. You have not been charged.')
          return
        }
      }

      const entered = normalizeAmount(amount)
      const expected = normalizeAmount(serverTotal)
      if (entered === null || expected === null || entered !== expected) {
        setAmountError(
          `Amount mismatch: expected ${formatWithAsset(serverTotal)}, got ${formatWithAsset(amount)}`,
        )
        return
      }

      try {
        await onPay(entered)
      } catch {
        setError('Payment failed. You have not been charged twice.')
        throw undefined
      }
    },
    { cooldownMs: 3_000 },
  )

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const validationError = validateAmount()
    if (validationError) {
      setAmountError(validationError)
      return
    }
    setAmountError(null)
    void runSubmit()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <p className="text-body text-foreground" data-testid="cart-total">
        Cart total: <strong className="font-mono">{totalLabel}</strong>
      </p>

      <Input
        label="Payment amount"
        name="amount"
        inputMode="decimal"
        autoComplete="off"
        value={amount}
        error={amountError}
        hint={`Enter the exact cart total: ${totalLabel}`}
        onChange={(event) => {
          setAmount(event.target.value)
          if (amountError) setAmountError(null)
        }}
      />

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
