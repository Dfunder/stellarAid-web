'use client';

/**
 * useKeyboardShortcuts — global keyboard shortcuts for power users (#144)
 *
 * Shortcuts:
 *   /          → focus the search bar (element with data-search-input)
 *   Escape     → close the topmost open modal/dialog
 *   ?          → toggle the shortcuts help overlay
 *   g p        → navigate to /explore (Projects)
 *   g d        → navigate to /dashboard
 */

import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

export interface ShortcutDefinition {
  keys: string;
  description: string;
  category: string;
}

export const SHORTCUT_DEFINITIONS: ShortcutDefinition[] = [
  { keys: '/', description: 'Focus search bar', category: 'Navigation' },
  { keys: 'Escape', description: 'Close modal / dialog', category: 'Navigation' },
  { keys: '?', description: 'Show keyboard shortcuts', category: 'Help' },
  { keys: 'g p', description: 'Go to Projects', category: 'Navigation' },
  { keys: 'g d', description: 'Go to Dashboard', category: 'Navigation' },
];

interface UseKeyboardShortcutsOptions {
  /** Called when the user presses "?" to toggle the help overlay */
  onToggleHelp?: () => void;
}

export function useKeyboardShortcuts({ onToggleHelp }: UseKeyboardShortcutsOptions = {}) {
  const router = useRouter();
  // Track the first key of a two-key sequence (e.g. "g")
  const pendingKeyRef = useRef<string | null>(null);
  const pendingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPending = useCallback(() => {
    pendingKeyRef.current = null;
    if (pendingTimerRef.current) {
      clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tag = target.tagName.toLowerCase();

      // Ignore shortcuts when typing in inputs/textareas/contenteditable
      const isTyping =
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select' ||
        target.isContentEditable;

      // "/" and "?" are allowed even in inputs only if we explicitly want them
      const isSlash = e.key === '/';
      const isQuestion = e.key === '?';
      const isEscape = e.key === 'Escape';

      if (isTyping && !isEscape) {
        clearPending();
        return;
      }

      // ── Escape: close topmost modal/dialog ──────────────────────────────────
      if (isEscape) {
        clearPending();
        // Let the browser/React handle Escape natively for dialogs first.
        // We only act if no modal is currently focused.
        const openDialog = document.querySelector<HTMLElement>(
          '[role="dialog"][aria-modal="true"]',
        );
        if (openDialog) {
          const closeBtn = openDialog.querySelector<HTMLElement>(
            '[aria-label="Close"], [data-close-modal], button[type="button"]:last-of-type',
          );
          closeBtn?.click();
        }
        return;
      }

      // ── "/" : focus search input ─────────────────────────────────────────────
      if (isSlash && !isTyping) {
        e.preventDefault();
        clearPending();
        const searchInput = document.querySelector<HTMLElement>(
          '[data-search-input], input[type="search"], input[placeholder*="earch"]',
        );
        searchInput?.focus();
        return;
      }

      // ── "?" : toggle help overlay ────────────────────────────────────────────
      if (isQuestion && !isTyping) {
        e.preventDefault();
        clearPending();
        onToggleHelp?.();
        return;
      }

      // ── Two-key sequences (g + …) ────────────────────────────────────────────
      if (pendingKeyRef.current === 'g') {
        clearPending();
        if (e.key === 'p') {
          e.preventDefault();
          router.push('/explore');
        } else if (e.key === 'd') {
          e.preventDefault();
          router.push('/dashboard');
        }
        return;
      }

      if (e.key === 'g' && !isTyping) {
        pendingKeyRef.current = 'g';
        // Reset after 1 s if no second key arrives
        pendingTimerRef.current = setTimeout(clearPending, 1000);
      }
    },
    [router, onToggleHelp, clearPending],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearPending();
    };
  }, [handleKeyDown, clearPending]);
}
