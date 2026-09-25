import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { analytics } from '@/lib'
import { getErrorMessage, isApiError } from '@/services'
import {
  registerSchema,
  ACCOUNT_TYPES,
  type RegisterFormInput,
  type RegisterFormValues,
} from '../schemas'
import { authService } from '../services/authService'
import { inputClass, linkClass, primaryButtonClass } from './formStyles'

const FIELDS = ['name', 'email', 'password', 'confirmPassword', 'accountType'] as const
type FieldName = (typeof FIELDS)[number]

const ACCOUNT_TYPE_LABELS = {
  artist: { title: 'Artist', hint: 'Sell artwork and take commissions' },
  client: { title: 'Client', hint: 'Buy artwork and request commissions' },
} as const

/** Maps server field names (e.g. `role`) onto form fields. */
function toFormField(field: string): FieldName | null {
  if (field === 'role') return 'accountType'
  return (FIELDS as readonly string[]).includes(field) ? (field as FieldName) : null
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="text-caption-sm font-normal text-danger">
      {message}
    </p>
  )
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormInput, unknown, RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
  })

  const onSubmit = async (values: RegisterFormValues) => {
    setFormError(null)
    try {
      await authService.register({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.accountType,
      })
      analytics.track('signup', { account_type: values.accountType })
      navigate('/verify-email', { replace: true, state: { email: values.email } })
    } catch (error) {
      if (isApiError(error) && error.status === 409) {
        setError(
          'email',
          { message: 'An account with this email already exists.' },
          { shouldFocus: true },
        )
        return
      }
      let mapped = false
      if (isApiError(error)) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          const name = toFormField(field)
          if (name) {
            setError(name, { message }, { shouldFocus: !mapped })
            mapped = true
          }
        }
      }
      if (!mapped) setFormError(getErrorMessage(error))
    }
  }

  const describedBy = (field: FieldName) => (errors[field] ? `register-${field}-error` : undefined)

  return (
    <div>
      <h1 className="text-h2">Create your account</h1>
      <p className="mt-2 text-body text-muted">Start funding and launching campaigns on Lumora.</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 flex flex-col gap-5">
        {formError && (
          <p
            role="alert"
            className="rounded-control border border-danger bg-danger/10 px-3 py-2 text-caption text-danger"
          >
            {formError}
          </p>
        )}

        <label className="flex flex-col gap-1.5 text-caption font-semibold">
          Name
          <input
            type="text"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describedBy('name')}
            className={inputClass}
            {...register('name')}
          />
          <FieldError id="register-name-error" message={errors.name?.message} />
        </label>

        <label className="flex flex-col gap-1.5 text-caption font-semibold">
          Email
          <input
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describedBy('email')}
            className={inputClass}
            {...register('email')}
          />
          <FieldError id="register-email-error" message={errors.email?.message} />
        </label>

        <label className="flex flex-col gap-1.5 text-caption font-semibold">
          Password
          <input
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={describedBy('password') ?? 'register-password-hint'}
            className={inputClass}
            {...register('password')}
          />
          {errors.password ? (
            <FieldError id="register-password-error" message={errors.password.message} />
          ) : (
            <p id="register-password-hint" className="text-caption-sm font-normal text-muted">
              At least 8 characters with upper- and lowercase letters and a number.
            </p>
          )}
        </label>

        <label className="flex flex-col gap-1.5 text-caption font-semibold">
          Confirm password
          <input
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={describedBy('confirmPassword')}
            className={inputClass}
            {...register('confirmPassword')}
          />
          <FieldError
            id="register-confirmPassword-error"
            message={errors.confirmPassword?.message}
          />
        </label>

        <fieldset
          aria-invalid={Boolean(errors.accountType)}
          aria-describedby={describedBy('accountType')}
          className="flex flex-col gap-1.5"
        >
          <legend className="mb-1.5 text-caption font-semibold">Account type</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {ACCOUNT_TYPES.map((type) => (
              <label
                key={type}
                className="flex cursor-pointer items-start gap-3 rounded-control border border-line bg-surface p-3 has-[:checked]:border-primary"
              >
                <input type="radio" value={type} className="mt-1" {...register('accountType')} />
                <span className="flex flex-col">
                  <span className="text-caption font-semibold">
                    {ACCOUNT_TYPE_LABELS[type].title}
                  </span>
                  <span className="text-caption-sm text-muted">
                    {ACCOUNT_TYPE_LABELS[type].hint}
                  </span>
                </span>
              </label>
            ))}
          </div>
          <FieldError id="register-accountType-error" message={errors.accountType?.message} />
        </fieldset>

        <button type="submit" disabled={isSubmitting} className={primaryButtonClass}>
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-caption text-muted">
        Already have an account?{' '}
        <Link to="/login" className={linkClass}>
          Sign in
        </Link>
      </p>
    </div>
  )
}
