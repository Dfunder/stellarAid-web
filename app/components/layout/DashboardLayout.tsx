'use client';

import React, { memo, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import WalletBalance from '@/components/wallet/WalletBalance';

const sidebarLinks = [
  { name: 'Overview', href: '/dashboard' },
  { name: 'My Campaigns', href: '/dashboard/campaigns' },
  { name: 'My Portfolios', href: '/dashboard/artist/portfolios' },
  { name: 'Payments', href: '/dashboard/payments' },
  { name: 'Messages', href: '/dashboard/messages/1' },
  { name: 'My Services', href: '/dashboard/artist/services' },
  { name: 'Donations', href: '/dashboard/donations' },
  { name: 'Wallet', href: '/dashboard/wallet' },
  { name: 'Settings', href: '/dashboard/settings' },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const SidebarNavItem = memo(function SidebarNavItem({
  name,
  href,
  isActive,
}: Readonly<{
  name: string;
  href: string;
  isActive: boolean;
}>) {
  return (
    <Link
      href={href}
      className={
        'block px-3 py-2 rounded-lg text-sm font-medium transition-colors ' +
        (isActive
          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800')
      }
    >
      {name}
    </Link>
  );
});

function DashboardLayout({ children }: Readonly<DashboardLayoutProps>) {
  const pathname = usePathname();

  const renderedLinks = useMemo(() => {
    return sidebarLinks.map((link) => (
      <SidebarNavItem
        key={link.href}
        name={link.name}
        href={link.href}
        isActive={pathname === link.href}
      />
    ));
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <aside className="w-64 shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Dashboard</h2>
          <nav className="space-y-1">{renderedLinks}</nav>

          <div className="mt-6">
            <WalletBalance />
          </div>
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}

export default memo(DashboardLayout);
