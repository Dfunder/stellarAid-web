import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'
import AuthForm from '@/components/AuthForm'
import ContactForm from '@/components/ContactForm'
import PaymentForm from '@/components/PaymentForm'
import { isValidEmail, validateEmail, INVALID_EMAIL_MESSAGE } from '@/lib/email'
import { sanitizeMessage } from '@/lib/sanitize'
import { checkRateLimit, resetRateLimits } from '@/utils/rate-limit'

describe('email validation (#932)', () => {
  it('rejects invalid formats', () => {
    expect(isValidEmail('not-an-email')).toBe(false)
    expect(validateEmail('bad@')).toBe(INVALID_EMAIL_MESSAGE)
    expect(validateEmail('user@example.com')).toBeNull()
  })

  it('blocks AuthForm submit for invalid email and shows a message', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<AuthForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText(/email/i), 'not-valid')
    await user.type(screen.getByLabelText(/password/i), 'secret')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText(INVALID_EMAIL_MESSAGE)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits AuthForm when the email is valid', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<AuthForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText(/email/i), 'user@example.com')
    await user.type(screen.getByLabelText(/password/i), 'secret')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
  })
})

describe('ContactForm sanitization and rate limiting (#933)', () => {
  beforeEach(() => {
    resetRateLimits()
  })

  it('strips script tags from messages', () => {
    expect(sanitizeMessage('<script>alert(1)</script>Hello')).toBe('Hello')
    expect(sanitizeMessage('<img src=x onerror=alert(1)>hi')).toBe('hi')
  })

  it('validates email before submit', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ContactForm onSubmit={onSubmit} rateLimitKey="test-contact" />)

    await user.type(screen.getByLabelText(/^email$/i), 'nope')
    await user.type(screen.getByLabelText(/message/i), 'Hello there')
    await user.click(screen.getByRole('button', { name: /send message/i }))

    expect(await screen.findByText(INVALID_EMAIL_MESSAGE)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('sanitizes message payload on submit', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<ContactForm onSubmit={onSubmit} rateLimitKey="test-contact-2" />)

    await user.type(screen.getByLabelText(/^email$/i), 'user@example.com')
    await user.type(
      screen.getByLabelText(/message/i),
      '<script>x</script>Safe text',
    )
    await user.click(screen.getByRole('button', { name: /send message/i }))

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Safe text' }),
      ),
    )
  })

  it('enforces client rate limiting', () => {
    const key = 'rl-unit'
    expect(checkRateLimit(key, { maxAttempts: 2, windowMs: 60_000, persist: false }).allowed).toBe(
      true,
    )
    expect(checkRateLimit(key, { maxAttempts: 2, windowMs: 60_000, persist: false }).allowed).toBe(
      true,
    )
    expect(checkRateLimit(key, { maxAttempts: 2, windowMs: 60_000, persist: false }).allowed).toBe(
      false,
    )
  })
})

describe('double-submit prevention (#937)', () => {
  it('disables the payment button while submitting', async () => {
    const user = userEvent.setup()
    let resolvePay!: () => void
    const onPay = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolvePay = resolve
        }),
    )
    render(<PaymentForm amountLabel="10 XLM" onPay={onPay} />)

    const button = screen.getByRole('button', { name: /confirm payment/i })
    await user.click(button)

    expect(button).toBeDisabled()
    expect(button).toHaveTextContent(/submitting/i)
    expect(onPay).toHaveBeenCalledTimes(1)

    // Second click while in-flight must not start another payment.
    await user.click(button)
    expect(onPay).toHaveBeenCalledTimes(1)

    resolvePay()
    await waitFor(() => expect(onPay).toHaveBeenCalledTimes(1))
  })
})
