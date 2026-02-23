import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ background: 'linear-gradient(135deg, #dce8f8 0%, #edf2f9 50%, #d6e4f5 100%)' }}
    >
      {children}
    </div>
  );
}
