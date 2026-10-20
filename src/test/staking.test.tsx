import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'
import StakeForm from '@/components/StakeForm'
import UnstakeForm from '@/components/UnstakeForm'
import DelegateStakeForm from '@/components/DelegateStakeForm'
import CompoundStakeForm from '@/components/CompoundStakeForm'
import { requireBalance, useStellarBalance, validateStakeBalance } from '@/hooks/useStellarBalance'
import { renderHook } from '@testing-library/react'

describe('balance validation logic (#941)', () => {
  it('accepts stake amounts within available balance', () => {
    const result = validateStakeBalance('50', '100', { action: 'stake', unit: 'tokens' })
    expect(result.isValid).toBe(true)
    expect(result.error).toBeNull()

    // Boundary condition: exact balance
    const exact = validateStakeBalance('100', '100', { action: 'stake', unit: 'tokens' })
    expect(exact.isValid).toBe(true)
    expect(exact.error).toBeNull()
  })

  it('rejects stake amounts exceeding available balance with required error format', () => {
    const result = validateStakeBalance('150', '100', { action: 'stake', unit: 'tokens' })
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Insufficient balance. You have 100 tokens, trying to stake 150.')
  })

  it('rejects unstake amounts exceeding staked balance with required error format', () => {
    const result = validateStakeBalance('75', '50', { action: 'unstake', unit: 'tokens' })
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Insufficient balance. You have 50 tokens, trying to unstake 75.')
  })

  it('rejects zero, negative amounts, and invalid inputs', () => {
    expect(validateStakeBalance('0', '100').isValid).toBe(false)
    expect(validateStakeBalance('-10', '100').isValid).toBe(false)
    expect(validateStakeBalance('', '100').isValid).toBe(false)
    expect(validateStakeBalance('abc', '100').isValid).toBe(false)
  })

  it('requireBalance throws on insufficient balance and succeeds on valid balance', () => {
    expect(() => requireBalance('100', '50', { action: 'stake' })).not.toThrow()
    expect(() => requireBalance('100', '150', { action: 'stake' })).toThrow(
      'Insufficient balance. You have 100 tokens, trying to stake 150.',
    )
  })
})

describe('StakeForm component (#941)', () => {
  it('renders available balance and max button', () => {
    render(<StakeForm availableBalance="100" unit="tokens" />)
    expect(screen.getByTestId('available-balance')).toHaveTextContent('100 tokens')
    expect(screen.getByTestId('stake-max-btn')).toBeInTheDocument()
  })

  it('populates maximum available balance on clicking Max', async () => {
    const user = userEvent.setup()
    render(<StakeForm availableBalance="250" unit="tokens" />)

    const maxBtn = screen.getByTestId('stake-max-btn')
    const input = screen.getByTestId('stake-amount-input')

    await user.click(maxBtn)
    expect(input).toHaveValue(250)
  })

  it('validates user has sufficient balance before transaction and blocks submission with clear error', async () => {
    const user = userEvent.setup()
    const onStake = vi.fn().mockResolvedValue(undefined)
    const onError = vi.fn()

    render(<StakeForm availableBalance="100" unit="tokens" onStake={onStake} onError={onError} />)

    const input = screen.getByTestId('stake-amount-input')
    const submitBtn = screen.getByTestId('stake-submit-btn')

    // Attempt to stake 150 when available balance is 100
    await user.type(input, '150')
    await user.click(submitBtn)

    const expectedError = 'Insufficient balance. You have 100 tokens, trying to stake 150.'
    expect(await screen.findByRole('alert')).toHaveTextContent(expectedError)
    expect(onError).toHaveBeenCalledWith(expectedError)
    expect(onStake).not.toHaveBeenCalled()
  })

  it('allows stake transaction when amount is within balance', async () => {
    const user = userEvent.setup()
    const onStake = vi.fn().mockResolvedValue(undefined)
    const onSuccess = vi.fn()

    render(
      <StakeForm availableBalance="100" unit="tokens" onStake={onStake} onSuccess={onSuccess} />,
    )

    const input = screen.getByTestId('stake-amount-input')
    const submitBtn = screen.getByTestId('stake-submit-btn')

    await user.type(input, '40')
    await user.click(submitBtn)

    await waitFor(() => {
      expect(onStake).toHaveBeenCalledWith('40')
      expect(onSuccess).toHaveBeenCalled()
      expect(screen.getByTestId('stake-success-msg')).toHaveTextContent(
        'Successfully staked 40 tokens!',
      )
    })
  })
})

describe('UnstakeForm component (#941)', () => {
  it('renders staked balance and validates unstake amounts', async () => {
    const user = userEvent.setup()
    const onUnstake = vi.fn().mockResolvedValue(undefined)
    const onError = vi.fn()

    render(<UnstakeForm stakedBalance="50" unit="tokens" onUnstake={onUnstake} onError={onError} />)

    expect(screen.getByTestId('staked-balance')).toHaveTextContent('50 tokens')

    const input = screen.getByTestId('unstake-amount-input')
    const submitBtn = screen.getByTestId('unstake-submit-btn')

    // Attempt to unstake 80 with only 50 staked
    await user.type(input, '80')
    await user.click(submitBtn)

    const expectedError = 'Insufficient balance. You have 50 tokens, trying to unstake 80.'
    expect(await screen.findByRole('alert')).toHaveTextContent(expectedError)
    expect(onError).toHaveBeenCalledWith(expectedError)
    expect(onUnstake).not.toHaveBeenCalled()
  })

  it('allows unstake transaction when amount is within staked balance', async () => {
    const user = userEvent.setup()
    const onUnstake = vi.fn().mockResolvedValue(undefined)
    const onSuccess = vi.fn()

    render(
      <UnstakeForm stakedBalance="50" unit="tokens" onUnstake={onUnstake} onSuccess={onSuccess} />,
    )

    const input = screen.getByTestId('unstake-amount-input')
    const submitBtn = screen.getByTestId('unstake-submit-btn')

    await user.type(input, '25')
    await user.click(submitBtn)

    await waitFor(() => {
      expect(onUnstake).toHaveBeenCalledWith('25')
      expect(onSuccess).toHaveBeenCalled()
      expect(screen.getByTestId('unstake-success-msg')).toHaveTextContent(
        'Successfully unstaked 25 tokens!',
      )
    })
  })
})

describe('DelegateStakeForm component (#941)', () => {
  it('validates balance and validator address before delegation transaction', async () => {
    const user = userEvent.setup()
    const onDelegate = vi.fn().mockResolvedValue(undefined)
    const onError = vi.fn()

    render(
      <DelegateStakeForm
        availableBalance="100"
        unit="tokens"
        defaultValidator="GABC123"
        onDelegate={onDelegate}
        onError={onError}
      />,
    )

    const amountInput = screen.getByTestId('delegate-amount-input')
    const submitBtn = screen.getByTestId('delegate-submit-btn')

    // Attempt to delegate 200 with 100 available
    await user.type(amountInput, '200')
    await user.click(submitBtn)

    const expectedError = 'Insufficient balance. You have 100 tokens, trying to stake 200.'
    expect(await screen.findByRole('alert')).toHaveTextContent(expectedError)
    expect(onDelegate).not.toHaveBeenCalled()

    // Valid delegation
    await user.clear(amountInput)
    await user.type(amountInput, '60')
    await user.click(submitBtn)

    await waitFor(() => {
      expect(onDelegate).toHaveBeenCalledWith('60', 'GABC123')
      expect(screen.getByTestId('delegate-success-msg')).toBeInTheDocument()
    })
  })
})

describe('CompoundStakeForm component (#941)', () => {
  it('validates claimable rewards balance before compounding', async () => {
    const user = userEvent.setup()
    const onCompound = vi.fn().mockResolvedValue(undefined)
    const onError = vi.fn()

    render(
      <CompoundStakeForm
        claimableRewards="20"
        unit="tokens"
        onCompound={onCompound}
        onError={onError}
      />,
    )

    const amountInput = screen.getByTestId('compound-amount-input')
    const submitBtn = screen.getByTestId('compound-submit-btn')

    // Attempt to compound 50 with 20 rewards
    await user.type(amountInput, '50')
    await user.click(submitBtn)

    const expectedError = 'Insufficient balance. You have 20 tokens, trying to compound 50.'
    expect(await screen.findByRole('alert')).toHaveTextContent(expectedError)
    expect(onCompound).not.toHaveBeenCalled()

    // Valid compounding
    await user.clear(amountInput)
    await user.type(amountInput, '15')
    await user.click(submitBtn)

    await waitFor(() => {
      expect(onCompound).toHaveBeenCalledWith('15')
      expect(screen.getByTestId('compound-success-msg')).toBeInTheDocument()
    })
  })
})

describe('useStellarBalance hook (#941)', () => {
  it('returns initialized balances and getBalance helper', async () => {
    const { result } = renderHook(() =>
      useStellarBalance({
        asset: 'XLM',
        initialBalance: '300',
        initialStakedBalance: '150',
        initialRewardsBalance: '25',
      }),
    )

    expect(result.current.balance).toBe('300')
    expect(result.current.stakedBalance).toBe('150')
    expect(result.current.rewardsBalance).toBe('25')

    const fetched = await result.current.getBalance('XLM')
    expect(fetched).toBe('300')
  })
})
