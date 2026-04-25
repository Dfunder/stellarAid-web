'use client';

import { Menu } from 'lucide-react';

interface AdminHeaderProps {
  onMobileOpen: () => void;
}

export function AdminHeader({ onMobileOpen }: AdminHeaderProps) {
  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center px-4">
      <button
        onClick={onMobileOpen}
        className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        aria-label="Open sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>
      <div className="ml-4 lg:ml-0 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-[#1a3a6b] flex items-center justify-center">
          <span className="text-white font-bold text-sm">S</span>
        </div>
        <span className="text-lg font-semibold text-gray-900">Admin Panel</span>
        <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Admin</span>
      </div>
    </header>
  );
}