'use client';

import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/app/store/hooks';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import {
  fetchActiveSessions,
  revokeUserSession,
  revokeAllUserSessions,
  fetchSessionSettings,
  updateUserSessionSettings,
  fetchSessionHistory,
} from '@/app/features/sessions/sessionsThunks';
import {
  selectActiveSessions,
  selectSessionSettings,
  selectSessionHistory,
  selectSessionsLoading,
  selectSessionsError,
  selectCurrentSession,
} from '@/app/features/sessions/sessionsSelectors';
import { Monitor, Smartphone, Globe, Trash2, RefreshCw, Clock, Shield, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SessionsPage() {
  const dispatch = useAppDispatch();
  const activeSessions = useAppSelector(selectActiveSessions);
  const sessionSettings = useAppSelector(selectSessionSettings);
  const sessionHistory = useAppSelector(selectSessionHistory);
  const loading = useAppSelector(selectSessionsLoading);
  const error = useAppSelector(selectSessionsError);
  const currentSession = useAppSelector(selectCurrentSession);

  const [showHistory, setShowHistory] = useState(false);
  const [timeoutMinutes, setTimeoutMinutes] = useState(sessionSettings.timeoutMinutes);
  const [warningMinutes, setWarningMinutes] = useState(sessionSettings.warningMinutes);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    dispatch(fetchActiveSessions());
    dispatch(fetchSessionSettings());
  }, [dispatch]);

  useEffect(() => {
    setTimeoutMinutes(sessionSettings.timeoutMinutes);
    setWarningMinutes(sessionSettings.warningMinutes);
  }, [sessionSettings]);

  const handleRevoke = async (sessionId: string) => {
    try {
      await dispatch(revokeUserSession(sessionId)).unwrap();
      toast.success('Session revoked successfully');
    } catch {
      // Error handled in thunk
    }
  };

  const handleRevokeAll = async () => {
    if (!confirm('Are you sure you want to revoke all other sessions? You will remain logged in on this device.')) {
      return;
    }
    try {
      await dispatch(revokeAllUserSessions()).unwrap();
      toast.success('All other sessions have been revoked');
    } catch {
      // Error handled in thunk
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await dispatch(updateUserSessionSettings({
        timeoutMinutes,
        warningMinutes,
      })).unwrap();
      toast.success('Session settings updated');
    } catch {
      // Error handled in thunk
    } finally {
      setSavingSettings(false);
    }
  };

  const getDeviceIcon = (device: string) => {
    const lower = device.toLowerCase();
    if (lower.includes('mobile') || lower.includes('phone') || lower.includes('iphone') || lower.includes('android')) {
      return <Smartphone className="w-5 h-5" />;
    }
    return <Monitor className="w-5 h-5" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Session Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Monitor your active sessions and manage timeout settings
        </p>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Session Timeout Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Session Timeout Settings
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Configure how long your session remains active without activity
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdateSettings} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  min={5}
                  max={480}
                  value={timeoutMinutes}
                  onChange={(e) => setTimeoutMinutes(Number(e.target.value))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Session expires after {timeoutMinutes} minutes of inactivity
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Warning Before Timeout (minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={warningMinutes}
                  onChange={(e) => setWarningMinutes(Number(e.target.value))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Warning appears {warningMinutes} minutes before timeout
                </p>
              </div>
            </div>
            <button
              type="submit"
              disabled={savingSettings}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {savingSettings ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>

        {/* Active Sessions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Active Sessions
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {activeSessions.length} active session{activeSessions.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => dispatch(fetchActiveSessions())}
                disabled={loading}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              {activeSessions.filter(s => !s.isCurrent).length > 0 && (
                <button
                  onClick={handleRevokeAll}
                  disabled={loading}
                  className="flex items-center gap-1 px-3 py-2 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Revoke All Others
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {activeSessions.map((session) => (
              <div
                key={session.id}
                className={`p-4 rounded-lg border ${
                  session.isCurrent
                    ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${
                      session.isCurrent ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      {getDeviceIcon(session.device)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {session.device}
                        </p>
                        {session.isCurrent && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                            <Check className="w-3 h-3" />
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {session.browser} {session.os && `on ${session.os}`}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {session.ipAddress}
                        </span>
                        {session.location && <span>{session.location}</span>}
                        <span>Last active: {getTimeAgo(session.lastActive)}</span>
                      </div>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <button
                      onClick={() => handleRevoke(session.id)}
                      disabled={loading}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                      title="Revoke session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Session History */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                <Clock className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Session History
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Past sessions and login activity
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowHistory(!showHistory);
                if (!showHistory) {
                  dispatch(fetchSessionHistory());
                }
              }}
              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              {showHistory ? 'Hide' : 'Show'} History
            </button>
          </div>

          {showHistory && (
            <div className="space-y-3">
              {sessionHistory.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No session history available
                </p>
              ) : (
                sessionHistory.map((session) => (
                  <div
                    key={session.id}
                    className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {getDeviceIcon(session.device)}
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {session.device}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {session.ipAddress} {session.location && `- ${session.location}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(session.createdAt)}
                      </p>
                      {session.isCurrent && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                          <Check className="w-3 h-3" />
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
