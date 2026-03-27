import { ReactNode } from 'react';
import { ConditionalHeader } from '@/components/ConditionalHeader';
import { SessionManager } from '@/components/SessionManager';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <SessionManager>
      <ConditionalHeader />
      {children}
    </SessionManager>
  );
}
