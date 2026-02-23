'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className="w-full border-b border-gray-200"
      style={{ backgroundColor: '#eef3fa' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-[#1a3a6b] flex items-center justify-center">
              <span className="text-white font-bold text-base leading-none">S</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">StellarAid</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center text-sm font-semibold text-white bg-[#1a3a6b] hover:bg-[#15305a] rounded-lg px-5 py-2 transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden border-t border-gray-200 px-4 py-4 space-y-3"
          style={{ backgroundColor: '#eef3fa' }}
        >
          <Link
            href="/auth/login"
            onClick={() => setMobileOpen(false)}
            className="block text-sm font-medium text-gray-700 hover:text-gray-900 py-2 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            onClick={() => setMobileOpen(false)}
            className="block w-full text-center text-sm font-semibold text-white bg-[#1a3a6b] hover:bg-[#15305a] rounded-lg px-5 py-2.5 transition-colors"
          >
            Get Started
          </Link>
        </div>
      )}
    </header>
  );
}
