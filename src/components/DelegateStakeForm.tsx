import { useState, type FormEvent } from 'react'
import { Button, Input } from '@/components/ui'
import { useStellarBalance, validateStakeBalance, requireBalance } from '@/hooks/useStellarBalance'

export interface DelegateStakeFormProps {
  /** User's available token balance for delegation. */
  availableBalance?: string | number
  /** Asset identifier (e.g., 'XLM', 'AID'). Defaults to 'XLM'. */
  asset?: string
  /** Display unit for balance and error messages (defaults to 'tokens'). */
  unit?: string
  /** Pre-filled validator address or public key. */
  defaultValidator?: string
  /** Async callback invoked when delegation transaction is submitted and validated. */
  onDelegate?: (amount: string, validator: string) => Promise<void>
  /** Callback fired upon successful delegation. */
  onSuccess?: () => void
  /** Callback fired upon failure or validation error. */
  onError?: (error: string) => void
  /** Additional CSS class names */
  className?: string
}

/**
 * Delegated staking form with balance validation (#941).
 * Validates that delegated amount does not exceed available balance.
 */
export default function DelegateStakeForm({
  availableBalance: propBalance,
  asset = 'XLM',
  unit = 'tokens',
  defaultValidator = '',
  onDelegate,
  onSuccess,
  onError,
  className = '',
}: DelegateStakeFormProps) {
  const { balance: hookBalance } = useStellarBalance({
    asset,
    initialBalance: propBalance,
  })

  const effectiveBalance = propBalance !== undefined ? String(propBalance) : hookBalance
  const [amount, setAmount] = useState<string>('')
  const [validator, setValidator] = useState<string>(defaultValidator)
  const [amountError, setAmountError] = useState<string | null>(null)
  const [validatorError, setValidatorError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)

  const handleMaxClick = () => {
    setAmount(effectiveBalance)
    setAmountError(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSuccess(false)

    let hasValidationError = false

    // 1. Validate validator address
    if (!validator.trim()) {
      setValidatorError('Validator address is required.')
      hasValidationError = true
    } else {
      setValidatorError(null)
    }

    // 2. Validate balance before transaction (#941)
    const validation = validateStakeBalance(amount, effectiveBalance, {
      action: 'stake',
      unit,
    })

    if (!validation.isValid) {
      const errorMsg = validation.error ?? 'Insufficient balance.'
      setAmountError(errorMsg)
      onError?.(errorMsg)
      hasValidationError = true
    } else {
      setAmountError(null)
    }

    if (hasValidationError) {
      return
    }

    // 3. Double check guard
    try {
      requireBalance(effectiveBalance, amount, { action: 'stake', unit })
    } catch (guardErr) {
      const guardMsg = guardErr instanceof Error ? guardErr.message : 'Insufficient balance'
      setAmountError(guardMsg)
      onError?.(guardMsg)
      return
    }

    setIsSubmitting(true)

    try {
      if (onDelegate) {
        await onDelegate(amount, validator.trim())
      }
      setIsSuccess(true)
      onSuccess?.()
    } catch (err) {
      const failureMsg = err instanceof Error ? err.message : 'Delegation failed'
      setAmountError(failureMsg)
      onError?.(failureMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={`flex flex-col gap-4 ${className}`}>
      <div className="flex items-center justify-between text-caption text-muted">
        <span>Available balance:</span>
        <div className="flex items-center gap-2">
          <strong className="font-mono text-foreground" data-testid="delegate-available-balance">
            {effectiveBalance} {unit}
          </strong>
          <button
            type="button"
            onClick={handleMaxClick}
            className="text-primary text-caption-sm font-semibold hover:underline"
            data-testid="delegate-max-btn"
          >
            Max
          </button>
        </div>
      </div>

      <Input
        label="Validator Address"
        name="validator"
        placeholder="G..."
        value={validator}
        error={validatorError}
        onChange={(e) => {
          setValidator(e.target.value)
          if (validatorError) setValidatorError(null)
        }}
        data-testid="delegate-validator-input"
      />

      <Input
        label="Delegate stake amount"
        name="amount"
        type="number"
        step="any"
        min="0"
        inputMode="decimal"
        autoComplete="off"
        placeholder="0.0"
        value={amount}
        error={amountError}
        hint={`Enter up to ${effectiveBalance} ${unit}`}
        onChange={(e) => {
          setAmount(e.target.value)
          if (amountError) setAmountError(null)
        }}
        data-testid="delegate-amount-input"
      />

      {isSuccess ? (
        <p role="status" className="text-caption text-success" data-testid="delegate-success-msg">
          Successfully delegated {amount} {unit} to {validator}!
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full justify-center"
        data-testid="delegate-submit-btn"
      >
        {isSubmitting ? 'Delegating...' : 'Delegate Stake'}
      </Button>
    </form>
  )
}
