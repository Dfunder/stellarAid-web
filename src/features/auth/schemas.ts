import { z } from 'zod'

export const ACCOUNT_TYPES = ['artist', 'client'] as const

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters.')
      .max(80, 'Name must be at most 80 characters.'),
    email: z.string().trim().pipe(z.email('Enter a valid email address.')),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .max(128, 'Password must be at most 128 characters.')
      .regex(/[a-z]/, 'Password must contain a lowercase letter.')
      .regex(/[A-Z]/, 'Password must contain an uppercase letter.')
      .regex(/\d/, 'Password must contain a number.'),
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
    accountType: z.enum(ACCOUNT_TYPES, 'Choose an account type.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  })

export type RegisterFormInput = z.input<typeof registerSchema>
export type RegisterFormValues = z.output<typeof registerSchema>
