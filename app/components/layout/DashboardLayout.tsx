'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sidebarLinks = [
  { name: 'Overview', href: '/dashboard' },
  { name: 'My Campaigns', href: '/dashboard/campaigns' },
  { name: 'Donations', href: '/dashboard/donations' },
  { name: 'Wallet', href: '/dashboard/wallet' },
  { name: 'Settings', href: '/dashboard/settings' },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <aside className="w-64 shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Dashboard</h2>
          <nav className="space-y-1">
            {sidebarLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={"block px-3 py-2 rounded-lg text-sm font-medium transition-colors " +
                    (active
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800')}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
