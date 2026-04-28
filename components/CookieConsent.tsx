'use client';

import React, { useEffect, useState } from 'react';
import { setAnalyticsConsent, getAnalyticsConsent } from '@/utils/analytics';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getAnalyticsConsent() === null) setVisible(true);
  }, []);

  const accept = () => {
    setAnalyticsConsent(true);
    setVisible(false);
  };

  const decline = () => {
    setAnalyticsConsent(false);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 bg-card border border-border rounded-xl shadow-lg p-4">
      <p className="text-sm text-foreground font-medium mb-1">Cookie Preferences</p>
      <p className="text-xs text-muted-foreground mb-4">
        We use analytics cookies to improve your experience. You can opt out at any time.
      </p>
      <div className="flex gap-2">
        <button
          onClick={accept}
          className="flex-1 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
        >
          Accept
        </button>
        <button
          onClick={decline}
          className="flex-1 px-3 py-2 rounded-lg border border-border text-foreground text-xs font-semibold hover:bg-muted transition-colors"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
