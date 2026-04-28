'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderOpen,
  Users,
  CreditCard,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Campaigns', href: '/admin/campaigns', icon: FolderOpen, exact: false },
  { label: 'Users', href: '/admin/users', icon: Users, exact: false },
  { label: 'Withdrawals', href: '/admin/withdrawals', icon: CreditCard, exact: false },
  { label: 'Audit Logs', href: '/admin/logs', icon: FileText, exact: false },
  { label: 'Settings', href: '/admin/settings', icon: Settings, exact: false },
];

interface AdminSidebarProps {
  isMobileOpen: boolean;
  isCollapsed: boolean;
  onMobileClose: () => void;
  onToggleCollapse: () => void;
}

export function AdminSidebar({
  isMobileOpen,
  isCollapsed,
  onMobileClose,
  onToggleCollapse,
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full z-40 flex flex-col bg-[#1a3a6b] transition-all duration-300',
          // Mobile: slide in/out
          'lg:relative lg:translate-x-0 lg:z-auto',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          // Desktop: collapsed vs expanded
          isCollapsed ? 'lg:w-16' : 'w-64'
        )}
        aria-label="Admin sidebar navigation"
      >
        {/* Branding */}
        <div
          className={cn(
            'flex items-center h-16 px-4 border-b border-white/10 shrink-0',
            isCollapsed ? 'lg:justify-center' : 'gap-3'
          )}
        >
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm leading-none">S</span>
          </div>
          {!isCollapsed && (
            <span className="text-white font-semibold text-base truncate">Admin Panel</span>
          )}
          {/* Mobile close button */}
          <button
            type="button"
            onClick={onMobileClose}
            className="ml-auto lg:hidden p-1 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150',
                  isCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'text-white/65 hover:bg-white/10 hover:text-white'
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle — desktop only */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden lg:flex items-center justify-center h-10 border-t border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </aside>
    </>
  );
}