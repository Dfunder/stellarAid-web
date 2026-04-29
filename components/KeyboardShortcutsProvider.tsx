'use client';

/**
 * KeyboardShortcutsProvider — mounts global keyboard shortcuts for power users (#144).
 * Wrap this around the app in the root layout.
 */

import React, { useState } from 'react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { KeyboardShortcutsHelp } from '@/components/ui/KeyboardShortcutsHelp';

export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  const [helpOpen, setHelpOpen] = useState(false);

  useKeyboardShortcuts({ onToggleHelp: () => setHelpOpen((v) => !v) });

  return (
    <>
      {children}
      <KeyboardShortcutsHelp isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}
