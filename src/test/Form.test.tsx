import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'
import AuthForm from '@/components/AuthForm'
import ContactForm from '@/components/ContactForm'
import NewsletterForm from '@/components/NewsletterForm'
import PaymentForm from '@/components/PaymentForm'
import QueryForm from '@/components/QueryForm'
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

describe('ContactForm sanitization and rate limiting (#933, #943)', () => {
  beforeEach(() => {
    resetRateLimits()
  })

  it('strips script tags and handles dangerous attributes, schemes, and wrappers', () => {
    expect(sanitizeMessage('<script>alert(1)</script>Hello')).toBe('Hello')
    expect(sanitizeMessage('<img src=x onerror=alert(1)>hi')).toBe('hi')
    expect(sanitizeMessage('<a href="javascript:alert(1)">Safe</a>')).toBe('Safe')
    expect(sanitizeMessage('<svg onload=alert(1)>world')).toBe('world')
    expect(sanitizeMessage('<div><script>alert(1)</script>Content</div>')).toBe('Content')
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

  it('sanitizes message and name payloads on submit', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<ContactForm onSubmit={onSubmit} rateLimitKey="test-contact-2" />)

    await user.type(screen.getByLabelText(/name/i), '<script>x</script>Alice')
    await user.type(screen.getByLabelText(/^email$/i), 'user@example.com')
    await user.type(screen.getByLabelText(/message/i), '<script>x</script>Safe text')
    await user.click(screen.getByRole('button', { name: /send message/i }))

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Alice',
        email: 'user@example.com',
        message: 'Safe text',
      }),
    )
  })

  it('omits name when it consists only of stripped markup', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<ContactForm onSubmit={onSubmit} rateLimitKey="test-contact-name-strip" />)

    await user.type(screen.getByLabelText(/name/i), '<script>alert(1)</script>')
    await user.type(screen.getByLabelText(/^email$/i), 'user@example.com')
    await user.type(screen.getByLabelText(/message/i), 'Legit message')
    await user.click(screen.getByRole('button', { name: /send message/i }))

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        name: undefined,
        email: 'user@example.com',
        message: 'Legit message',
      }),
    )
  })

  it('rejects a message that is empty after sanitization', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ContactForm onSubmit={onSubmit} rateLimitKey="test-contact-empty" />)

    await user.type(screen.getByLabelText(/^email$/i), 'user@example.com')
    await user.type(screen.getByLabelText(/message/i), '<script>alert(1)</script>')
    await user.click(screen.getByRole('button', { name: /send message/i }))

    expect(await screen.findByText(/message is required/i)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('drops bot submissions that fill the honeypot', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ContactForm onSubmit={onSubmit} rateLimitKey="test-contact-honeypot" />)

    await user.type(screen.getByLabelText(/^email$/i), 'bot@example.com')
    await user.type(screen.getByLabelText(/message/i), 'buy my product')
    await user.type(screen.getByLabelText(/company/i), 'Bot Inc')
    await user.click(screen.getByRole('button', { name: /send message/i }))

    expect(await screen.findByRole('status')).toHaveTextContent(/message has been sent/i)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows an error and blocks submit once the form rate limit is hit', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const key = 'test-contact-limit'
    // Exhaust the window before the user submits.
    for (let attempt = 0; attempt < 3; attempt += 1) {
      expect(checkRateLimit(key, { maxAttempts: 3, windowMs: 60_000 }).allowed).toBe(true)
    }

    render(<ContactForm onSubmit={onSubmit} rateLimitKey={key} />)
    await user.type(screen.getByLabelText(/^email$/i), 'user@example.com')
    await user.type(screen.getByLabelText(/message/i), 'Hello there')
    await user.click(screen.getByRole('button', { name: /send message/i }))

    expect(await screen.findByText(/please wait/i)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
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

describe('NewsletterForm sanitization, honeypot, and rate limiting (#943)', () => {
  beforeEach(() => {
    resetRateLimits()
  })

  it('validates email before subscription submit', async () => {
    const user = userEvent.setup()
    const onSubscribe = vi.fn()
    render(<NewsletterForm onSubscribe={onSubscribe} />)

    await user.type(screen.getByLabelText(/^email$/i), 'invalid-email')
    await user.click(screen.getByRole('button', { name: /subscribe/i }))

    expect(await screen.findByText(INVALID_EMAIL_MESSAGE)).toBeInTheDocument()
    expect(onSubscribe).not.toHaveBeenCalled()
  })

  it('submits valid and sanitized email', async () => {
    const user = userEvent.setup()
    const onSubscribe = vi.fn().mockResolvedValue(undefined)
    render(<NewsletterForm onSubscribe={onSubscribe} rateLimitKey="test-nl-valid" />)

    await user.type(screen.getByLabelText(/^email$/i), ' subscriber@example.com ')
    await user.click(screen.getByRole('button', { name: /subscribe/i }))

    await waitFor(() => expect(onSubscribe).toHaveBeenCalledWith('subscriber@example.com'))
    expect(await screen.findByRole('status')).toHaveTextContent(/you're subscribed/i)
  })

  it('drops bot submissions that fill the honeypot', async () => {
    const user = userEvent.setup()
    const onSubscribe = vi.fn()
    render(<NewsletterForm onSubscribe={onSubscribe} rateLimitKey="test-nl-bot" />)

    await user.type(screen.getByLabelText(/^email$/i), 'bot@example.com')
    await user.type(screen.getByLabelText(/company/i), 'SpamCorp')
    await user.click(screen.getByRole('button', { name: /subscribe/i }))

    expect(await screen.findByRole('status')).toHaveTextContent(/you're subscribed/i)
    expect(onSubscribe).not.toHaveBeenCalled()
  })

  it('shows an error and blocks submit once the rate limit is hit', async () => {
    const user = userEvent.setup()
    const onSubscribe = vi.fn()
    const key = 'test-nl-limit'
    for (let attempt = 0; attempt < 5; attempt += 1) {
      expect(checkRateLimit(key, { maxAttempts: 5, windowMs: 60_000 }).allowed).toBe(true)
    }

    render(<NewsletterForm onSubscribe={onSubscribe} rateLimitKey={key} />)
    await user.type(screen.getByLabelText(/^email$/i), 'user@example.com')
    await user.click(screen.getByRole('button', { name: /subscribe/i }))

    expect(await screen.findByText(/too many attempts/i)).toBeInTheDocument()
    expect(onSubscribe).not.toHaveBeenCalled()
  })
})

describe('QueryForm sanitization, honeypot, and rate limiting (#989, #991, #943)', () => {
  beforeEach(() => {
    resetRateLimits()
  })

  it('sanitizes the query before submitting', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<QueryForm onSubmit={onSubmit} rateLimitKey="test-q-1" />)

    await user.type(screen.getByLabelText(/^email$/i), 'user@example.com')
    await user.type(screen.getByLabelText(/query/i), '<script>x</script>Need help')
    await user.click(screen.getByRole('button', { name: /submit query/i }))

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ email: 'user@example.com', query: 'Need help' }),
    )
  })

  it('rejects a query that is empty after sanitization', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<QueryForm onSubmit={onSubmit} rateLimitKey="test-q-2" />)

    await user.type(screen.getByLabelText(/^email$/i), 'user@example.com')
    await user.type(screen.getByLabelText(/query/i), '<script>alert(1)</script>')
    await user.click(screen.getByRole('button', { name: /submit query/i }))

    expect(await screen.findByText(/query is required/i)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('validates email format before submitting', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<QueryForm onSubmit={onSubmit} rateLimitKey="test-q-3" />)

    await user.type(screen.getByLabelText(/^email$/i), 'not-valid')
    await user.type(screen.getByLabelText(/query/i), 'Valid query text')
    await user.click(screen.getByRole('button', { name: /submit query/i }))

    expect(await screen.findByText(INVALID_EMAIL_MESSAGE)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('drops bot submissions that fill the honeypot', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<QueryForm onSubmit={onSubmit} rateLimitKey="test-q-honeypot" />)

    await user.type(screen.getByLabelText(/^email$/i), 'bot@example.com')
    await user.type(screen.getByLabelText(/company/i), 'Bot LLC')
    await user.type(screen.getByLabelText(/query/i), 'Automated spam message')
    await user.click(screen.getByRole('button', { name: /submit query/i }))

    expect(await screen.findByRole('status')).toHaveTextContent(/query has been submitted/i)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('blocks submit and shows error once rate limit is reached', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const key = 'test-query-limit'
    for (let attempt = 0; attempt < 3; attempt += 1) {
      expect(checkRateLimit(key, { maxAttempts: 3, windowMs: 60_000 }).allowed).toBe(true)
    }

    render(<QueryForm onSubmit={onSubmit} rateLimitKey={key} />)
    await user.type(screen.getByLabelText(/^email$/i), 'user@example.com')
    await user.type(screen.getByLabelText(/query/i), 'Help question')
    await user.click(screen.getByRole('button', { name: /submit query/i }))

    expect(await screen.findByText(/please wait/i)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})

describe('payment amount validation (#995)', () => {
  it('shows the cart total next to the payment field', () => {
    render(<PaymentForm amountLabel="10 XLM" onPay={vi.fn()} />)

    expect(screen.getByTestId('cart-total')).toHaveTextContent(/cart total:\s*10 XLM/i)
    expect(screen.getByLabelText(/payment amount/i)).toHaveValue('10')
  })

  it('blocks payment when the entered amount does not match the cart total', async () => {
    const user = userEvent.setup()
    const onPay = vi.fn().mockResolvedValue(undefined)
    render(<PaymentForm amountLabel="10 XLM" onPay={onPay} />)

    const amount = screen.getByLabelText(/payment amount/i)
    await user.clear(amount)
    await user.type(amount, '8')
    await user.click(screen.getByRole('button', { name: /confirm payment/i }))

    expect(
      await screen.findByText(/amount mismatch: expected 10 XLM, got 8 XLM/i),
    ).toBeInTheDocument()
    expect(onPay).not.toHaveBeenCalled()
  })

  it('accepts equivalent decimal spellings of the cart total', async () => {
    const user = userEvent.setup()
    const onPay = vi.fn().mockResolvedValue(undefined)
    render(<PaymentForm amountLabel="10 XLM" cartTotal="10.00" onPay={onPay} />)

    const amount = screen.getByLabelText(/payment amount/i)
    await user.clear(amount)
    await user.type(amount, '10.0')
    await user.click(screen.getByRole('button', { name: /confirm payment/i }))

    await waitFor(() => expect(onPay).toHaveBeenCalledWith('10'))
  })

  it('revalidates the cart total with the server before paying', async () => {
    const user = userEvent.setup()
    const onPay = vi.fn().mockResolvedValue(undefined)
    const revalidateCartTotal = vi.fn().mockResolvedValue('12')
    render(
      <PaymentForm amountLabel="10 XLM" onPay={onPay} revalidateCartTotal={revalidateCartTotal} />,
    )

    await user.click(screen.getByRole('button', { name: /confirm payment/i }))

    await waitFor(() => expect(revalidateCartTotal).toHaveBeenCalledTimes(1))
    expect(
      await screen.findByText(/amount mismatch: expected 12 XLM, got 10 XLM/i),
    ).toBeInTheDocument()
    expect(onPay).not.toHaveBeenCalled()
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
