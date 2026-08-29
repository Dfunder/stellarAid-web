'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface UseSessionTimeoutOptions {
  timeoutMinutes?: number;
  warningMinutes?: number;
  onTimeout?: () => void;
  onWarning?: (timeRemaining: number) => void;
  extendOnActivity?: boolean;
}

export function useSessionTimeout({
  timeoutMinutes = 30,
  warningMinutes = 5,
  onTimeout,
  onWarning,
  extendOnActivity = true,
}: UseSessionTimeoutOptions = {}) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const warningRef = useRef<ReturnType<typeof setTimeout>>();
  const lastActivityRef = useRef<number>(Date.now());
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  const resetTimer = useCallback(() => {
    if (!extendOnActivity) return;

    lastActivityRef.current = Date.now();
    setTimeRemaining(null);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    const warningTime = (timeoutMinutes - warningMinutes) * 60 * 1000;
    const timeoutTime = timeoutMinutes * 60 * 1000;

    warningRef.current = setTimeout(() => {
      const remaining = Math.round((timeoutTime - warningTime) / 1000);
      setTimeRemaining(remaining);
      onWarning?.(remaining);
    }, warningTime);

    timeoutRef.current = setTimeout(() => {
      setTimeRemaining(0);
      onTimeout?.();
    }, timeoutTime);
  }, [timeoutMinutes, warningMinutes, onTimeout, onWarning, extendOnActivity]);

  useEffect(() => {
    resetTimer();

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    const activityHandler = () => {
      const elapsed = Date.now() - lastActivityRef.current;
      const timeoutMs = timeoutMinutes * 60 * 1000;
      if (elapsed < timeoutMs) {
        resetTimer();
      }
    };

    events.forEach((event) => {
      window.addEventListener(event, activityHandler, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, activityHandler);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [resetTimer, timeoutMinutes]);

  return { timeRemaining, resetTimer };
}
