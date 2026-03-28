'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';

// Routes that render their own header inside a dashboard layout
const DASHBOARD_ROUTES = ['/dashboard'];

export function ConditionalHeader() {
  const pathname = usePathname();
  const isDashboard = DASHBOARD_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  if (isDashboard) return null;
  return <Header />;
}
