'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { verifyEmail, resendVerificationEmail } from '@/app/features/auth/authThunks';
import { selectAuthLoading, selectAuthError } from '@/app/features/auth/authSelectors';
import { useRouter } from 'next/navigation';
import FullPageLoader from '@/app/components/common/FullPageLoader';
import ButtonSpinner from '@/app/components/common/ButtonSpinner';
import { toastError, toastSuccess } from '@/utils/toast';

const RATE_LIMIT_SECONDS = 60;

export default function VerifyEmailPage({ params }: { params: { token: string } }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const [isVerified, setIsVerified] = useState(false);
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const token = params.token;
    if (token) {
      dispatch(verifyEmail(token))
        .unwrap()
        .then(() => {
          setIsVerified(true);
        })
        .catch(() => {
          setIsVerified(false);
        });
    }
  }, [params.token, dispatch]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResendEmail = useCallback(async () => {
    if (!email) {
      toastError('Please enter your email address');
      return;
    }

    if (cooldown > 0) {
      toastError(`Please wait ${cooldown} seconds before trying again`);
      return;
    }

    setIsResending(true);
    try {
      await dispatch(resendVerificationEmail(email)).unwrap();
      toastSuccess('Verification email sent successfully!');
      setCooldown(RATE_LIMIT_SECONDS);
    } catch (err) {
      // Error is already handled by the thunk
    } finally {
      setIsResending(false);
    }
  }, [email, cooldown, dispatch]);

  const handleLogin = () => {
    router.push('/login');
  };

  if (loading && !isVerified) {
    return <FullPageLoader message="Verifying your email..." />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        {isVerified ? (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 mb-6">
              <svg
                className="h-8 w-8 text-green-600 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Email Verified!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your email has been successfully verified. You can now log in to your account.
            </p>
            <ButtonSpinner isLoading={false} onClick={handleLogin} className="w-full">
              Go to Login
            </ButtonSpinner>
          </div>
        ) : (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900 mb-6">
              <svg
                className="h-8 w-8 text-red-600 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Verification Failed
            </h2>
            {error && <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>}
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The verification link is invalid or has expired. Please request a new verification
              email.
            </p>
            <div className="mb-4">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white mb-3"
              />
              <ButtonSpinner
                isLoading={isResending}
                loadingText="Sending..."
                onClick={handleResendEmail}
                disabled={cooldown > 0}
                className="w-full"
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Verification Email'}
              </ButtonSpinner>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
