'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

import { loginSchema, LoginFormValues } from './schemas';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { ApiError } from '@/types/api';

export default function LoginForm() {
  const router = useRouter();
  const { login, isAuthenticated, setLoading, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<LoginFormValues, any, LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      const response = await authApi.login({
        email: data.email,
        password: data.password,
      });

      login(response.data.user, response.data.token);

      // "Remember me" — flag session-only mode when unchecked
      if (!data.rememberMe) {
        sessionStorage.setItem('stellaraid-session-only', 'true');
      } else {
        sessionStorage.removeItem('stellaraid-session-only');
        const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
        localStorage.setItem('stellaraid-session-expiry', String(expiry));
      }

      router.replace('/dashboard');
    } catch (err) {
      const apiError = err as ApiError;
      const status = apiError.status;

      if (status === 401 || status === 400) {
        setError('password', {
          type: 'manual',
          message: apiError.message || 'Invalid email or password.',
        });
      } else if (status === 429) {
        setError('root', {
          type: 'manual',
          message: 'Too many login attempts. Please wait a few minutes and try again.',
        });
      } else {
        setError('root', {
          type: 'manual',
          message: apiError.message || 'Unable to connect. Please try again.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card variant="elevated" padding="lg" className="w-full max-w-sm">
      {/* Brand header — icon + name side by side */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className="w-9 h-9 rounded-lg bg-[#1a3a6b] flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-base leading-none">S</span>
        </div>
        <span className="text-lg font-semibold text-gray-900">StellarAid</span>
      </div>

      {/* Heading */}
      <div className="text-center mb-5">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back</h1>
        <p className="text-sm text-gray-500">Sign in to your account to continue</p>
      </div>

      {/* Root-level error (rate limiting) */}
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

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-900">Password</label>
            <Link
              href="/auth/forgot-password"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              className={[
                'w-full px-4 py-2 pr-10 border rounded-lg transition-all duration-200 text-sm',
                'focus:outline-none focus:ring-2 bg-white text-gray-900 placeholder-gray-400',
                errors.password
                  ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-100'
                  : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200',
              ].join(' ')}
              aria-invalid={!!errors.password}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p role="alert" className="mt-1 text-sm text-danger-500">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2">
          <input
            id="rememberMe"
            type="checkbox"
            className="w-4 h-4 rounded border-gray-300 accent-primary-700"
            {...register('rememberMe')}
          />
          <label htmlFor="rememberMe" className="text-sm text-gray-600 cursor-pointer select-none">
            Remember me for 30 days
          </label>
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
          Sign In
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-white text-sm text-gray-400">or</span>
        </div>
      </div>

      {/* Social login buttons — gray border, dark text, no blue outline */}
      <div className="space-y-3">
        <button
          type="button"
          disabled
          aria-label="Continue with Google (coming soon)"
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <svg
            className="w-4 h-4 shrink-0"
            viewBox="0 0 24 24"
            aria-hidden="true"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        <button
          type="button"
          disabled
          aria-label="Connect Stellar Wallet (coming soon)"
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Connect Stellar Wallet
        </button>
      </div>

      {/* Sign up link */}
      <p className="text-center text-sm text-gray-500 mt-5">
        Don&apos;t have an account?{' '}
        <Link
          href="/auth/register"
          className="text-primary-600 hover:text-primary-700 font-semibold"
        >
          Create one
        </Link>
      </p>
    </Card>
  );
}
