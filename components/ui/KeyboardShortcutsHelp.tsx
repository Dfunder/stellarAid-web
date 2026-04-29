'use client';

/**
 * KeyboardShortcutsHelp — modal overlay listing all keyboard shortcuts (#144)
 */

import React from 'react';
import { Keyboard, X } from 'lucide-react';
import { SHORTCUT_DEFINITIONS } from '@/hooks/useKeyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center rounded border border-neutral-300 bg-neutral-100 px-1.5 py-0.5 font-mono text-xs text-neutral-700 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
      {children}
    </kbd>
  );
}

export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  if (!isOpen) return null;

  // Group shortcuts by category
  const grouped = SHORTCUT_DEFINITIONS.reduce<Record<string, typeof SHORTCUT_DEFINITIONS>>(
    (acc, s) => {
      (acc[s.category] ??= []).push(s);
      return acc;
    },
    {},
  );

  return (
    /* Backdrop */
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl dark:bg-neutral-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-700">
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-primary-500" />
            <h2 id="shortcuts-title" className="text-base font-semibold text-neutral-900 dark:text-white">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="divide-y divide-neutral-100 px-6 py-4 dark:divide-neutral-800">
          {Object.entries(grouped).map(([category, shortcuts]) => (
            <div key={category} className="py-3 first:pt-0 last:pb-0">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                {category}
              </p>
              <ul className="space-y-2">
                {shortcuts.map((s) => (
                  <li key={s.keys} className="flex items-center justify-between gap-4">
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">
                      {s.description}
                    </span>
                    <span className="flex shrink-0 items-center gap-1">
                      {s.keys.split(' ').map((k, i) => (
                        <React.Fragment key={k}>
                          {i > 0 && (
                            <span className="text-xs text-neutral-400">then</span>
                          )}
                          <Kbd>{k}</Kbd>
                        </React.Fragment>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <div className="border-t border-neutral-200 px-6 py-3 dark:border-neutral-700">
          <p className="text-center text-xs text-neutral-400">
            Press <Kbd>?</Kbd> to toggle this panel · <Kbd>Esc</Kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
}

export default KeyboardShortcutsHelp;
