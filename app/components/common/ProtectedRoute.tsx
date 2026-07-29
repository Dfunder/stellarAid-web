'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/app/store/hooks';
import { selectIsAuthenticated } from '@/app/features/auth/authSelectors';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login?redirect=' + encodeURIComponent(pathname));
    }
  }, [isAuthenticated, router, pathname]);

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
