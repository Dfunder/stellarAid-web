'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { loginUser } from '@/app/features/auth/authThunks';
import { selectAuthLoading, selectAuthError } from '@/app/features/auth/authSelectors';
import { verifyLoginTwoFactor, selectTwoFactorTempToken, setTempToken } from '@/app/features/twoFactor/twoFactorSlice';
import { selectTwoFactorLoading, selectTwoFactorError } from '@/app/features/twoFactor/twoFactorSelectors';
import ButtonSpinner from '@/app/components/common/ButtonSpinner';
import { Shield } from 'lucide-react';

export default function TwoFactorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectAuthLoading) || useAppSelector(selectTwoFactorLoading);
  const error = useAppSelector(selectAuthError) || useAppSelector(selectTwoFactorError);
  const tempToken = useAppSelector(selectTwoFactorTempToken);

  const [code, setCode] = useState('');
  const [backupCode, setBackupCode] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    const token = searchParams.get('tempToken');
    if (token) {
      dispatch(setTempToken(token));
    }
  }, [searchParams, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!code.trim()) {
      setLocalError('Please enter your verification code');
      return;
    }

    const currentToken = tempToken || searchParams.get('tempToken');
    if (!currentToken) {
      setLocalError('Session expired. Please log in again.');
      router.push('/login');
      return;
    }

    try {
      await dispatch(verifyLoginTwoFactor({ code: code.trim(), tempToken: currentToken })).unwrap();
      router.push('/dashboard');
    } catch (err) {
      // Error handled by thunk
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Two-Factor Authentication
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {displayError && (
            <div
              className="p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800"
              role="alert"
            >
              <p className="text-sm font-medium text-red-800 dark:text-red-400">{displayError}</p>
            </div>
          )}

          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Verification Code
            </label>
            <input
              id="code"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white placeholder-gray-400 text-center text-2xl tracking-widest"
              placeholder="000000"
              maxLength={10}
              autoFocus
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
              {backupCode ? 'Enter one of your backup codes' : 'Enter the 6-digit code from your authenticator app'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setBackupCode(!backupCode)}
            className="w-full text-center text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {backupCode ? 'Use authenticator code instead' : 'Use a backup code instead'}
          </button>

          <ButtonSpinner
            type="submit"
            isLoading={loading}
            loadingText="Verifying..."
            className="w-full py-3 text-lg"
          >
            Verify
          </ButtonSpinner>
        </form>
      </div>
    </div>
  );
}
