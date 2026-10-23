import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'
import ResendVerificationButton from '@/features/auth/components/ResendVerificationButton'
import {
  RESEND_MAX_ATTEMPTS,
  RESEND_WINDOW_MS,
  recordResendAttempt,
} from '@/features/auth/verificationResend'
import { resetRateLimits } from '@/utils/rate-limit'

const { resendVerification } = vi.hoisted(() => ({ resendVerification: vi.fn() }))

vi.mock('@/features/auth/services/authService', () => ({
  authService: { resendVerification },
}))

const EMAIL = 'artist@example.com'

beforeEach(() => {
  resetRateLimits()
  resendVerification.mockReset()
  resendVerification.mockResolvedValue(undefined)
})

const button = () => screen.getByRole('button')

/** Simulates three emails already sent from this browser, as the component records them. */
function spendAllowance(email = EMAIL) {
  for (let attempt = 0; attempt < RESEND_MAX_ATTEMPTS; attempt += 1) {
    recordResendAttempt(email)
  }
}

describe('ResendVerificationButton rate limiting (#1000)', () => {
  it('sends one email, confirms it, then counts the per-click cooldown down', async () => {
    const user = userEvent.setup()
    render(<ResendVerificationButton email={EMAIL} />)

    await user.click(button())

    expect(await screen.findByRole('status')).toHaveTextContent(/a new link is on its way/i)
    expect(resendVerification).toHaveBeenCalledWith(EMAIL)
    expect(button()).toBeDisabled()
    expect(button()).toHaveTextContent(/^Resend verification email \(\d+s\)$/)
  })

  it('disables the button with the remaining wait once the allowance is spent', () => {
    spendAllowance()
    render(<ResendVerificationButton email={EMAIL} />)

    expect(button()).toBeDisabled()
    expect(button()).toHaveTextContent(/^Resend in \d+ minutes$/)
  })

  it('shows the wait in whole minutes, never zero', () => {
    spendAllowance()
    render(<ResendVerificationButton email={EMAIL} />)

    const minutes = Number(button().textContent?.match(/(\d+) minute/)?.[1])
    expect(minutes).toBeGreaterThan(0)
    expect(minutes).toBeLessThanOrEqual(RESEND_WINDOW_MS / 60_000)
  })

  it('restores the wait after a remount instead of resetting the allowance', () => {
    spendAllowance()

    const first = render(<ResendVerificationButton email={EMAIL} />)
    expect(button()).toBeDisabled()
    first.unmount()

    render(<ResendVerificationButton email={EMAIL} />)
    expect(button()).toBeDisabled()
    expect(button()).toHaveTextContent(/Resend in \d+ minutes/)
    expect(resendVerification).not.toHaveBeenCalled()
  })

  it('does not let a blocked user send by clicking again', async () => {
    const user = userEvent.setup()
    spendAllowance()
    render(<ResendVerificationButton email={EMAIL} />)

    await user.click(button())

    expect(resendVerification).not.toHaveBeenCalled()
  })

  it('does not spend the allowance when sending fails', async () => {
    const user = userEvent.setup()
    resendVerification.mockRejectedValue(new Error('network down'))
    render(<ResendVerificationButton email={EMAIL} />)

    await user.click(button())
    expect(await screen.findByRole('alert')).toHaveTextContent(/unexpected error/i)

    // Failures are not counted and the cooldown only starts on success.
    expect(button()).toBeEnabled()
    await user.click(button())
    await waitFor(() => expect(resendVerification).toHaveBeenCalledTimes(2))
  })

  it('keeps separate allowances per address', async () => {
    const user = userEvent.setup()
    spendAllowance()

    render(
      <>
        <ResendVerificationButton email={EMAIL} />
        <ResendVerificationButton email="collector@example.com" />
      </>,
    )

    const [blocked, fresh] = screen.getAllByRole('button')
    expect(blocked).toBeDisabled()
    expect(fresh).toBeEnabled()

    await user.click(fresh!)
    expect(resendVerification).toHaveBeenCalledTimes(1)
    expect(fresh).toBeDisabled()
  })

  it('re-enables the button when the hour is over', () => {
    vi.useFakeTimers()
    try {
      vi.setSystemTime(new Date('2026-10-21T10:00:00Z'))
      spendAllowance()

      render(<ResendVerificationButton email={EMAIL} />)
      expect(button()).toBeDisabled()

      vi.setSystemTime(new Date(Date.now() + RESEND_WINDOW_MS + 1000))
      // The countdown interval notices the window closed on its next tick.
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(button()).toBeEnabled()
      expect(button()).toHaveTextContent('Resend verification email')
    } finally {
      vi.useRealTimers()
    }
  })

  it('stays disabled without an email address', () => {
    render(<ResendVerificationButton email="" />)
    expect(button()).toBeDisabled()
  })
})
