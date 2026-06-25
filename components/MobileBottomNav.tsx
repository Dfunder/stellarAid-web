'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Home, Search, PlusCircle, LayoutDashboard, User } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/campaigns', icon: Search, label: 'Explore' },
  { href: '/campaigns/create', icon: PlusCircle, label: 'Create' },
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/profile', icon: User, label: 'Profile' },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const handler = () => setHidden(vv.height < window.innerHeight * 0.75);
    vv.addEventListener('resize', handler);
    return () => vv.removeEventListener('resize', handler);
  }, []);

  if (hidden) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
      role="navigation"
      aria-label="Mobile bottom navigation"
    >
      <div className="flex items-center justify-around h-16">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active =
            pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-col items-center gap-1 text-xs px-3 py-2 rounded-lg transition-colors ${
                active
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <Icon size={20} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
