'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import ProfileDropdown from './ProfileDropdown';
import WalletDropdown from './WalletDropdown';
import { WalletConnectModal } from './donations/WalletConnectModal';
import { ThemeToggle } from './ThemeToggle';
import NotificationsDropdown from './NotificationsDropdown';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { address: walletAddress, connect: connectWallet } = useWalletStore();

  // Periodically fetch balance when wallet is connected
  useEffect(() => {
    if (walletAddress) {
      const fetchBalance = async () => {
        try {
          const res = await fetch(`https://horizon-testnet.stellar.org/accounts/${walletAddress}`);
          if (res.ok) {
            const data = await res.json();
            const native = data.balances.find((b: any) => b.asset_type === 'native');
            useWalletStore.setState({ balance: native ? native.balance : '0.0000000' });
          }
        } catch (err) {
          console.error('Error fetching balance:', err);
        }
      };

      fetchBalance();
      const interval = setInterval(fetchBalance, 15000);
      return () => clearInterval(interval);
    }
  }, [walletAddress]);

  const handleWalletConnect = async (walletType: string) => {
    try {
      if (walletType === 'freighter' && typeof window !== 'undefined' && (window as any).stellar) {
        const stellar = (window as any).stellar;
        const { address } = await stellar.getCurrentAddress();
        if (address) {
          connectWallet(walletType, address);
          setIsWalletModalOpen(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Extension connection failed, falling back to mock key', e);
    }
    
    // Fallback to demo key
    const demoAddresses: Record<string, string> = {
      freighter: 'GC2BJMDO7XZ6ST5GD7X3GH25SZ2RR35CY6SZ6SZ6SZ6SZ6SZ6SZ6SZ6',
      albedo: 'GBLSTR7XZ6ST5GD7X3GH25SZ2RR35CY6SZ6SZ6SZ6SZ6SZ6SZ6SZ6SZ6',
      lobstr: 'GDLOBSTRXZ6ST5GD7X3GH25SZ2RR35CY6SZ6SZ6SZ6SZ6SZ6SZ6SZ6SZ',
    };
    const address = demoAddresses[walletType] || 'GDEMO7XZ6ST5GD7X3GH25SZ2RR35CY6SZ6SZ6SZ6SZ6SZ6SZ6SZ6SZ6';
    connectWallet(walletType, address);
    setIsWalletModalOpen(false);
  };

  return (
    <header className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-base leading-none">S</span>
            </div>
            <span className="text-lg font-semibold text-foreground">StellarAid</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/explore"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Browse Projects
            </Link>
            {isAuthenticated && (
              <Link
                href="/bookmarks"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                My Bookmarks
              </Link>
            )}
            
            {/* Wallet Integration */}
            {walletAddress ? (
              <WalletDropdown />
            ) : (
              <button
                type="button"
                onClick={() => setIsWalletModalOpen(true)}
                className="inline-flex items-center justify-center text-xs font-semibold text-foreground bg-muted hover:bg-muted/80 rounded-lg px-3 py-1.5 border border-border transition-colors cursor-pointer"
              >
                Connect Wallet
              </button>
            )}

            <ThemeToggle />

            {isAuthenticated && <NotificationsDropdown />}

            {isAuthenticated ? (
              <ProfileDropdown />
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center justify-center text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg px-5 py-2 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-4 space-y-3">
          <Link
            href="/explore"
            onClick={() => setMobileOpen(false)}
            className="block text-sm font-medium text-muted-foreground hover:text-foreground py-2 transition-colors"
          >
            Browse Projects
          </Link>
          {isAuthenticated && (
            <Link
              href="/bookmarks"
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-medium text-muted-foreground hover:text-foreground py-2 transition-colors"
            >
              My Bookmarks
            </Link>
          )}

          {/* Mobile Wallet Integration */}
          <div className="py-2 border-b border-border mb-2 flex justify-center">
            {walletAddress ? (
              <WalletDropdown />
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setIsWalletModalOpen(true);
                }}
                className="w-full inline-flex items-center justify-center text-sm font-semibold text-foreground bg-muted hover:bg-muted/80 rounded-lg px-4 py-2 border border-border transition-colors cursor-pointer"
              >
                Connect Wallet
              </button>
            )}
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>

          {isAuthenticated && (
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-muted-foreground">Notifications</span>
              <NotificationsDropdown />
            </div>
          )}

          {isAuthenticated ? (
            <div className="flex justify-center">
              <ProfileDropdown />
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-medium text-gray-700 hover:text-gray-900 py-2 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center text-sm font-semibold text-white bg-[#1a3a6b] hover:bg-[#15305a] rounded-lg px-5 py-2.5 transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      )}

      {/* Wallet Connection Modal */}
      <WalletConnectModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onWalletConnect={handleWalletConnect}
      />
    </header>
  );
}