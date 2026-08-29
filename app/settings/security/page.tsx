'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/app/store/hooks';
import { selectUser } from '@/app/features/auth/authSelectors';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import {
  setupTwoFactor,
  confirmTwoFactorSetup,
  cancelTwoFactorSetup,
  disableUserTwoFactor,
  handleTwoFactorRegenerateBackupCodes,
  fetchTwoFactorStatus,
} from '@/app/features/twoFactor/twoFactorThunks';
import {
  selectTwoFactorEnabled,
  selectTwoFactorPendingSetup,
  selectTwoFactorSecret,
  selectTwoFactorOtpAuthUrl,
  selectTwoFactorQrCodeUrl,
  selectTwoFactorBackupCodes,
  selectTwoFactorBackupCodesGenerated,
  selectTwoFactorLoading,
  selectTwoFactorError,
} from '@/app/features/twoFactor/twoFactorSelectors';
import { Shield, ShieldOff, Copy, Check, Download, KeyRound, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SecuritySettingsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  const enabled = useAppSelector(selectTwoFactorEnabled);
  const pendingSetup = useAppSelector(selectTwoFactorPendingSetup);
  const secret = useAppSelector(selectTwoFactorSecret);
  const otpauthUrl = useAppSelector(selectTwoFactorOtpAuthUrl);
  const qrCodeUrl = useAppSelector(selectTwoFactorQrCodeUrl);
  const backupCodes = useAppSelector(selectTwoFactorBackupCodes);
  const backupCodesGenerated = useAppSelector(selectTwoFactorBackupCodesGenerated);
  const loading = useAppSelector(selectTwoFactorLoading);
  const error = useAppSelector(selectTwoFactorError);

  const [setupCode, setSetupCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [showDisableForm, setShowDisableForm] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);

  useEffect(() => {
    dispatch(fetchTwoFactorStatus());
  }, [dispatch]);

  const handleEnable = async () => {
    try {
      await dispatch(setupTwoFactor()).unwrap();
      toast.success('2FA setup initiated. Scan the QR code or enter the secret.');
    } catch {
      // Error handled in thunk
    }
  };

  const handleConfirmSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(confirmTwoFactorSetup(setupCode)).unwrap();
      setSetupCode('');
      toast.success('Two-factor authentication enabled successfully!');
    } catch {
      // Error handled in thunk
    }
  };

  const handleCancelSetup = async () => {
    await dispatch(cancelTwoFactorSetup()).unwrap();
    setSetupCode('');
    toast('2FA setup cancelled', { icon: 'ℹ️' });
  };

  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(disableUserTwoFactor({ password: disablePassword, code: disableCode })).unwrap();
      setDisablePassword('');
      setDisableCode('');
      setShowDisableForm(false);
      toast.success('Two-factor authentication disabled.');
    } catch {
      // Error handled in thunk
    }
  };

  const handleRegenerateBackupCodes = async () => {
    try {
      await dispatch(handleTwoFactorRegenerateBackupCodes()).unwrap();
      setShowBackupCodes(true);
      toast.success('New backup codes generated. Save them now.');
    } catch {
      // Error handled in thunk
    }
  };

  const copyToClipboard = (text: string, type: 'secret' | 'backup') => {
    navigator.clipboard.writeText(text);
    if (type === 'secret') {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } else {
      setCopiedBackup(true);
      setTimeout(() => setCopiedBackup(false), 2000);
    }
  };

  const downloadBackupCodes = () => {
    const content = backupCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stellar-aid-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Security Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Manage two-factor authentication and account security
        </p>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* 2FA Status Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-full ${enabled ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
              {enabled ? (
                <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
              ) : (
                <ShieldOff className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Two-Factor Authentication
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {enabled
                  ? '2FA is enabled for your account'
                  : 'Add an extra layer of security to your account'}
              </p>
            </div>
          </div>

          {enabled && !pendingSetup && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <Check className="w-4 h-4" />
                <span>Two-factor authentication is active</span>
              </div>

              {backupCodesGenerated && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Backup codes have been generated
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowBackupCodes(!showBackupCodes)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <KeyRound className="w-4 h-4" />
                  {showBackupCodes ? 'Hide Backup Codes' : 'View Backup Codes'}
                </button>

                <button
                  onClick={handleRegenerateBackupCodes}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 border border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-400 rounded-lg text-sm font-medium hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors disabled:opacity-50"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Regenerate Backup Codes
                </button>

                <button
                  onClick={() => setShowDisableForm(!showDisableForm)}
                  className="flex items-center gap-2 px-4 py-2 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <ShieldOff className="w-4 h-4" />
                  Disable 2FA
                </button>
              </div>

              {/* Backup Codes Display */}
              {showBackupCodes && backupCodesGenerated && (
                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Backup Codes - Save these securely
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(backupCodes.join('\n'), 'backup')}
                        className="p-1.5 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-800 rounded"
                        title="Copy codes"
                      >
                        {copiedBackup ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={downloadBackupCodes}
                        className="p-1.5 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-800 rounded"
                        title="Download codes"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((code, index) => (
                      <code
                        key={index}
                        className="block p-2 bg-white dark:bg-gray-800 rounded text-sm font-mono text-center text-gray-900 dark:text-white"
                      >
                        {code}
                      </code>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-yellow-700 dark:text-yellow-300">
                    Each code can only be used once. Store them in a safe place.
                  </p>
                </div>
              )}

              {/* Disable 2FA Form */}
              {showDisableForm && (
                <form onSubmit={handleDisable} className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg space-y-4">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Disable Two-Factor Authentication
                  </h3>
                  <p className="text-xs text-red-700 dark:text-red-300">
                    This will reduce your account security. Enter your password to confirm.
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={disablePassword}
                      onChange={(e) => setDisablePassword(e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Current 2FA Code
                    </label>
                    <input
                      type="text"
                      value={disableCode}
                      onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Enter 2FA code or backup code"
                      required
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      Disable 2FA
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowDisableForm(false); setDisablePassword(''); setDisableCode(''); }}
                      className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Setup 2FA */}
          {!enabled && !pendingSetup && (
            <div className="pt-4">
              <button
                onClick={handleEnable}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Shield className="w-5 h-5" />
                Enable Two-Factor Authentication
              </button>
            </div>
          )}

          {/* Pending Setup - Show Secret */}
          {pendingSetup && secret && (
            <div className="mt-6 space-y-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Step 1: Scan QR Code or Enter Secret
                </h3>
                <p className="text-xs text-blue-700 dark:text-blue-300 mb-4">
                  Open Google Authenticator, Authy, or any TOTP app and scan the QR code below, or enter the secret key manually.
                </p>

                <div className="flex flex-col items-center gap-4">
                  {qrCodeUrl ? (
                    <img
                      src={qrCodeUrl}
                      alt="2FA QR Code"
                      className="w-48 h-48 bg-white p-2 rounded-lg"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center px-4">
                        QR code unavailable.<br />Use manual entry below.
                      </p>
                    </div>
                  )}

                  <div className="w-full">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Secret Key (Manual Entry)
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm font-mono text-center break-all">
                        {secret}
                      </code>
                      <button
                        onClick={() => copyToClipboard(secret, 'secret')}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                        title="Copy secret"
                      >
                        {copiedSecret ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  Step 2: Verify Setup
                </h3>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-3">
                  Enter the 6-digit code from your authenticator app to confirm setup.
                </p>
                <form onSubmit={handleConfirmSetup} className="space-y-3">
                  <input
                    type="text"
                    value={setupCode}
                    onChange={(e) => setSetupCode(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter 6-digit code"
                    required
                    autoFocus
                  />
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={loading || setupCode.length < 6}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      Verify & Enable
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelSetup}
                      className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>

              {backupCodesGenerated && backupCodes.length > 0 && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                    Step 3: Save Backup Codes
                  </h3>
                  <p className="text-xs text-green-700 dark:text-green-300 mb-3">
                    Save these codes in a secure location. You can use them to access your account if you lose your device.
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {backupCodes.map((code, index) => (
                      <code
                        key={index}
                        className="block p-2 bg-white dark:bg-gray-800 rounded text-sm font-mono text-center text-gray-900 dark:text-white"
                      >
                        {code}
                      </code>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(backupCodes.join('\n'), 'backup')}
                      className="flex items-center gap-1 text-xs text-green-700 dark:text-green-300 hover:underline"
                    >
                      <Copy className="w-3 h-3" />
                      Copy all codes
                    </button>
                    <button
                      onClick={downloadBackupCodes}
                      className="flex items-center gap-1 text-xs text-green-700 dark:text-green-300 hover:underline"
                    >
                      <Download className="w-3 h-3" />
                      Download codes
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
