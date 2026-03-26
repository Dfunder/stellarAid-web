'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { z } from 'zod';

import { authApi } from '@/lib/api/auth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { ApiError } from '@/types/api';

// Validation schema
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    setIsLoading(true);
    try {
      await authApi.forgotPassword({
        email: data.email,
      });
      
      // Show success message regardless of whether email exists
      setIsSubmitted(true);
    } catch (err) {
      const apiError = err as ApiError;
      
      // Still show success message for security (don't reveal if email exists)
      if (apiError.status === 404) {
        setIsSubmitted(true);
      } else {
        // For other errors, show the error message
        setError('root', {
          type: 'manual',
          message: apiError.message || 'Unable to process request. Please try again.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card variant="elevated" padding="lg" className="w-full max-w-sm">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        {/* Success Message */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Check Your Email
          </h1>
          <p className="text-gray-600">
            We&apos;ve sent password reset instructions to your email address.
            Please check your inbox and follow the link to reset your password.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-900 mb-2">Next Steps:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Check your email inbox</li>
            <li>• Look for an email from StellarAid</li>
            <li>• Click the reset link in the email</li>
            <li>• Create a new password</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link href="/auth/login" className="block">
            <Button variant="primary" fullWidth>
              Return to Sign In
            </Button>
          </Link>
          
          <p className="text-center text-sm text-gray-500">
            Didn&apos;t receive the email? Check your spam folder or{' '}
            <button
              type="button"
              onClick={() => setIsSubmitted(false)}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              try again
            </button>
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="elevated" padding="lg" className="w-full max-w-sm">
      {/* Brand header */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className="w-9 h-9 rounded-lg bg-[#1a3a6b] flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-base leading-none">S</span>
        </div>
        <span className="text-lg font-semibold text-gray-900">StellarAid</span>
      </div>

      {/* Heading */}
      <div className="text-center mb-5">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Forgot Password?</h1>
        <p className="text-sm text-gray-500">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      {/* Root-level error */}
      {errors.root && (
        <div
          role="alert"
          className="mb-4 p-3 rounded-lg bg-danger-50 border border-danger-300 text-danger-700 text-sm"
        >
          {errors.root.message}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Email Address
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            className={[
              'w-full px-4 py-2 border rounded-lg transition-all duration-200 text-sm',
              'focus:outline-none focus:ring-2 bg-white text-gray-900 placeholder-gray-400',
              errors.email
                ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-100'
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200',
            ].join(' ')}
            aria-invalid={!!errors.email}
            {...register('email')}
          />
          {errors.email && (
            <p role="alert" className="mt-1 text-sm text-danger-500">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isSubmitting || isLoading}
          disabled={isSubmitting || isLoading}
          className="bg-[#1a3a6b] hover:bg-[#15305a] focus:ring-[#1a3a6b] mt-2 text-base font-semibold"
        >
          Send Reset Link
        </Button>
      </form>

      {/* Back to login */}
      <p className="text-center text-sm text-gray-500 mt-5">
        Remember your password?{' '}
        <Link
          href="/auth/login"
          className="text-primary-600 hover:text-primary-700 font-semibold"
        >
          Sign In
        </Link>
      </p>
    </Card>
  );
}
