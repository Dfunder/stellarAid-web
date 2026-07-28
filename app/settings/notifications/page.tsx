'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

type PrefKey = 'commission' | 'payment' | 'review' | 'message';

interface Pref {
  key: PrefKey;
  label: string;
  description: string;
}

const PREFERENCES: Pref[] = [
  {
    key: 'commission',
    label: 'Commission requests',
    description: 'Email me when an artist receives a new commission request.',
  },
  {
    key: 'payment',
    label: 'Payments received',
    description: 'Notify me whenever a payment reaches my wallet.',
  },
  {
    key: 'review',
    label: 'Reviews posted',
    description: 'Tell me when a client leaves a review on my profile.',
  },
  {
    key: 'message',
    label: 'Messages received',
    description: 'Alert me when I receive a new direct message.',
  },
];

const DEFAULT_PREFS: Record<PrefKey, boolean> = {
  commission: true,
  payment: true,
  review: false,
  message: true,
};

export default function NotificationSettingsPage() {
  const [prefs, setPrefs] = useState<Record<PrefKey, boolean>>(DEFAULT_PREFS);
  const [saving, setSaving] = useState(false);

  const toggle = (key: PrefKey) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    // Backend API not yet available — mock the save action.
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSaving(false);
    toast.success('Notification preferences saved.');
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Notification preferences
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Choose which events should send an email to your inbox.
        </p>
      </header>

      <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {PREFERENCES.map((pref) => {
          const enabled = prefs[pref.key];
          return (
            <div
              key={pref.key}
              className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950"
            >
              <div className="flex-1">
                <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                  {pref.label}
                </span>
                <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                  {pref.description}
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                aria-label={`Toggle ${pref.label} notifications`}
                onClick={() => toggle(pref.key)}
                className={
                  'relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ' +
                  (enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700')
                }
              >
                <span
                  aria-hidden="true"
                  className={
                    'absolute top-0.5 inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ' +
                    (enabled ? 'translate-x-5' : 'translate-x-0.5')
                  }
                />
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save preferences'}
        </button>
      </div>
    </div>
  );
}
