'use client';

import React, { useState } from 'react';
import { useAppDispatch } from '../store/hooks';
import { forgotPassword } from '../features/auth/authThunks';
import { ButtonSpinner } from '../components/common';

export default function ForgotPasswordPage() {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || isSubmitted) return;

    setIsLoading(true);
    try {
      await dispatch(forgotPassword(email)).unwrap();
      setIsSubmitted(true);
    } catch (error) {
      // Still show success message to prevent email enumeration
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Forgot Password
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {isSubmitted ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-green-800 dark:text-green-200 text-sm">
                If this email is registered, a reset link has been sent.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="you@example.com"
                />
              </div>

              <ButtonSpinner
                isLoading={isLoading}
                type="submit"
                disabled={!email || isLoading}
                className="w-full"
                loadingText="Sending..."
              >
                Send Reset Link
              </ButtonSpinner>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
