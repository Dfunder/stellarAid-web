import { ReactNode } from 'react';
import Header from '@/components/Header';
import { SessionManager } from '@/components/SessionManager';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <SessionManager>
      <Header />
      {children}
    </SessionManager>
  );
}
