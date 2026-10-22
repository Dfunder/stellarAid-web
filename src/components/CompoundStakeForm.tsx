import { useState, type FormEvent } from 'react'
import { Button, Input } from '@/components/ui'
import { useStellarBalance, validateStakeBalance, requireBalance } from '@/hooks/useStellarBalance'

export interface CompoundStakeFormProps {
  /** Unclaimed or compoundable rewards balance. */
  claimableRewards?: string | number
  /** Asset identifier (e.g., 'XLM', 'AID'). Defaults to 'XLM'. */
  asset?: string
  /** Display unit for balance and error messages (defaults to 'tokens'). */
  unit?: string
  /** Async callback invoked when compound transaction is submitted and validated. */
  onCompound?: (amount: string) => Promise<void>
  /** Callback fired upon successful compound. */
  onSuccess?: () => void
  /** Callback fired upon failure or validation error. */
  onError?: (error: string) => void
  /** Additional CSS class names */
  className?: string
}

/**
 * Compound staking rewards form with balance validation (#941).
 * Validates that compound amount does not exceed claimable rewards balance.
 */
export default function CompoundStakeForm({
  claimableRewards: propRewards,
  asset = 'XLM',
  unit = 'tokens',
  onCompound,
  onSuccess,
  onError,
  className = '',
}: CompoundStakeFormProps) {
  const { rewardsBalance: hookRewards } = useStellarBalance({
    asset,
    initialRewardsBalance: propRewards,
  })

  const effectiveRewards = propRewards !== undefined ? String(propRewards) : hookRewards
  const [amount, setAmount] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)

  const handleMaxClick = () => {
    setAmount(effectiveRewards)
    setError(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSuccess(false)

    // 1. Validate balance before transaction (#941)
    const validation = validateStakeBalance(amount, effectiveRewards, {
      action: 'compound',
      unit,
    })

    if (!validation.isValid) {
      const errorMsg = validation.error ?? 'Insufficient balance.'
      setError(errorMsg)
      onError?.(errorMsg)
      return
    }

    // 2. Double-check guard
    try {
      requireBalance(effectiveRewards, amount, { action: 'compound', unit })
    } catch (guardErr) {
      const guardMsg = guardErr instanceof Error ? guardErr.message : 'Insufficient balance'
      setError(guardMsg)
      onError?.(guardMsg)
      return
    }

    // 3. Initiate compound transaction
    setError(null)
    setIsSubmitting(true)

    try {
      if (onCompound) {
        await onCompound(amount)
      }
      setIsSuccess(true)
      onSuccess?.()
    } catch (err) {
      const failureMsg = err instanceof Error ? err.message : 'Compounding failed'
      setError(failureMsg)
      onError?.(failureMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={`flex flex-col gap-4 ${className}`}>
      <div className="flex items-center justify-between text-caption text-muted">
        <span>Claimable rewards:</span>
        <div className="flex items-center gap-2">
          <strong className="font-mono text-foreground" data-testid="compound-rewards-balance">
            {effectiveRewards} {unit}
          </strong>
          <button
            type="button"
            onClick={handleMaxClick}
            className="text-primary text-caption-sm font-semibold hover:underline"
            data-testid="compound-max-btn"
          >
            Max
          </button>
        </div>
      </div>

      <Input
        label="Compound rewards amount"
        name="amount"
        type="number"
        step="any"
        min="0"
        inputMode="decimal"
        autoComplete="off"
        placeholder="0.0"
        value={amount}
        error={error}
        hint={`Enter up to ${effectiveRewards} ${unit} to re-stake`}
        onChange={(e) => {
          setAmount(e.target.value)
          if (error) setError(null)
        }}
        data-testid="compound-amount-input"
      />

      {isSuccess ? (
        <p role="status" className="text-caption text-success" data-testid="compound-success-msg">
          Successfully compounded {amount} {unit}!
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full justify-center"
        data-testid="compound-submit-btn"
      >
        {isSubmitting ? 'Compounding...' : 'Compound Rewards'}
      </Button>
    </form>
  )
}
