'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';

import { authApi } from '@/lib/api/auth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { ApiError } from '@/types/api';

// Password requirements
const passwordRequirements = {
  minLength: 8,
  hasUpperCase: true,
  hasLowerCase: true,
  hasNumber: true,
  hasSpecialChar: true,
};

// Validation schema
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(passwordRequirements.minLength, `Password must be at least ${passwordRequirements.minLength} characters`)
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  // Check password requirements
  const passwordChecks = {
    length: password.length >= passwordRequirements.minLength,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setTokenError('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  const onSubmit = async (data: ResetPasswordValues) => {
    if (!token) {
      setError('root', {
        type: 'manual',
        message: 'Invalid reset link. Please request a new password reset.',
      });
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword({
        token,
        password: data.password,
      });
      
      setIsSuccess(true);
    } catch (err) {
      const apiError = err as ApiError;
      
      if (apiError.status === 400 && apiError.message?.includes('expired')) {
        setTokenError('This reset link has expired. Please request a new password reset.');
      } else if (apiError.status === 400 && apiError.message?.includes('invalid')) {
        setTokenError('This reset link is invalid. Please request a new password reset.');
      } else {
        setError('root', {
          type: 'manual',
          message: apiError.message || 'Unable to reset password. Please try again.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (isSuccess) {
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
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Success Message */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Password Reset Successful
          </h1>
          <p className="text-gray-600">
            Your password has been successfully reset. You can now sign in with your new password.
          </p>
        </div>

        {/* Action Button */}
        <Link href="/auth/login" className="block">
          <Button variant="primary" fullWidth>
            Sign In with New Password
          </Button>
        </Link>
      </Card>
    );
  }

  // Token error state
  if (tokenError) {
    return (
      <Card variant="elevated" padding="lg" className="w-full max-w-sm">
        {/* Error Icon */}
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Error Message */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Reset Link Invalid
          </h1>
          <p className="text-gray-600">
            {tokenError}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link href="/auth/forgot-password" className="block">
            <Button variant="primary" fullWidth>
              Request New Reset Link
            </Button>
          </Link>
          
          <Link href="/auth/login" className="block">
            <Button variant="secondary" fullWidth>
              Return to Sign In
            </Button>
          </Link>
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
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Reset Password</h1>
        <p className="text-sm text-gray-500">
          Create a new password for your StellarAid account.
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
        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            New Password
          </label>
          <input
            type="password"
            placeholder="Enter new password"
            autoComplete="new-password"
            className={[
              'w-full px-4 py-2 border rounded-lg transition-all duration-200 text-sm',
              'focus:outline-none focus:ring-2 bg-white text-gray-900 placeholder-gray-400',
              errors.password
                ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-100'
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200',
            ].join(' ')}
            aria-invalid={!!errors.password}
            {...register('password')}
          />
          {errors.password && (
            <p role="alert" className="mt-1 text-sm text-danger-500">
              {errors.password.message}
            </p>
          )}

          {/* Password Requirements */}
          {password && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs font-medium text-gray-700 mb-2">
                Password must contain:
              </p>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      passwordChecks.length
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {passwordChecks.length ? (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span className={passwordChecks.length ? 'text-green-600' : 'text-gray-500'}>
                    At least {passwordRequirements.minLength} characters
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      passwordChecks.uppercase
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {passwordChecks.uppercase ? (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span className={passwordChecks.uppercase ? 'text-green-600' : 'text-gray-500'}>
                    One uppercase letter
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      passwordChecks.lowercase
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {passwordChecks.lowercase ? (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span className={passwordChecks.lowercase ? 'text-green-600' : 'text-gray-500'}>
                    One lowercase letter
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      passwordChecks.number
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {passwordChecks.number ? (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span className={passwordChecks.number ? 'text-green-600' : 'text-gray-500'}>
                    One number
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      passwordChecks.special
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {passwordChecks.special ? (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span className={passwordChecks.special ? 'text-green-600' : 'text-gray-500'}>
                    One special character
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Confirm New Password
          </label>
          <input
            type="password"
            placeholder="Confirm new password"
            autoComplete="new-password"
            className={[
              'w-full px-4 py-2 border rounded-lg transition-all duration-200 text-sm',
              'focus:outline-none focus:ring-2 bg-white text-gray-900 placeholder-gray-400',
              errors.confirmPassword
                ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-100'
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200',
            ].join(' ')}
            aria-invalid={!!errors.confirmPassword}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p role="alert" className="mt-1 text-sm text-danger-500">
              {errors.confirmPassword.message}
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
          Reset Password
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
