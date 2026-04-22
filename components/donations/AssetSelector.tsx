'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, AlertTriangle } from 'lucide-react';
import { useWalletStore } from '@/store/walletStore';

export interface DonationAsset {
  code: string;
  name: string;
  icon: string;
  usdRate: number;
  issuer: string | null;
}

export const SUPPORTED_ASSETS: DonationAsset[] = [
  { code: 'XLM', name: 'Stellar Lumens', icon: '✦', usdRate: 0.11, issuer: null },
  { code: 'USDC', name: 'USD Coin', icon: '$', usdRate: 1.0, issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN' },
  { code: 'NGNT', name: 'Nigerian Naira Token', icon: '₦', usdRate: 0.00065, issuer: 'GAWODAROMJ33V5YDFY3MATHDPWJLVES74TRIM2JTTGZ73PH5YPGUASL' },
];

interface AssetSelectorProps {
  value: string;
  onChange: (asset: DonationAsset) => void;
  donationAmount?: number;
  disabled?: boolean;
}

export function AssetSelector({ value, onChange, donationAmount = 0, disabled = false }: AssetSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { address, balance } = useWalletStore();

  const selected = SUPPORTED_ASSETS.find((a) => a.code === value) ?? SUPPORTED_ASSETS[0];

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') setIsOpen(false);
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen((v) => !v);
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const idx = SUPPORTED_ASSETS.findIndex((a) => a.code === value);
      const next = SUPPORTED_ASSETS[(idx + 1) % SUPPORTED_ASSETS.length];
      onChange(next);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const idx = SUPPORTED_ASSETS.findIndex((a) => a.code === value);
      const prev = SUPPORTED_ASSETS[(idx - 1 + SUPPORTED_ASSETS.length) % SUPPORTED_ASSETS.length];
      onChange(prev);
    }
  }

  // For XLM, walletStore.balance is the native balance string; other assets would need trustline lookup.
  // We surface what we can: XLM balance if connected.
  function getDisplayBalance(asset: DonationAsset): string | null {
    if (!address) return null;
    if (asset.code === 'XLM' && balance) return parseFloat(balance).toFixed(2);
    return null;
  }

  function isInsufficient(asset: DonationAsset): boolean {
    const bal = getDisplayBalance(asset);
    if (!bal || donationAmount <= 0) return false;
    const balanceUsd = parseFloat(bal) * asset.usdRate;
    const donationUsd = donationAmount * asset.usdRate;
    return donationUsd > balanceUsd;
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((v) => !v)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Selected asset: ${selected.code}`}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 border border-gray-200 rounded-lg bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
            {selected.icon}
          </span>
          <span className="font-medium text-gray-900">{selected.code}</span>
          <span className="text-gray-400 text-sm hidden sm:inline">{selected.name}</span>
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <ul
          role="listbox"
          aria-label="Select donation asset"
          className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
        >
          {SUPPORTED_ASSETS.map((asset) => {
            const displayBalance = getDisplayBalance(asset);
            const insufficient = isInsufficient(asset);
            const isSelected = asset.code === value;

            return (
              <li
                key={asset.code}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(asset);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors
                  ${isSelected ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-900'}`}
              >
                <span className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
                    {asset.icon}
                  </span>
                  <span>
                    <p className="font-medium text-sm">{asset.code}</p>
                    <p className="text-xs text-gray-400">{asset.name}</p>
                  </span>
                </span>
                <span className="text-right">
                  {displayBalance !== null && (
                    <p className={`text-sm font-medium ${insufficient ? 'text-red-500' : 'text-gray-600'}`}>
                      {displayBalance} {asset.code}
                    </p>
                  )}
                  {displayBalance === null && address && (
                    <p className="text-xs text-gray-400">—</p>
                  )}
                  {insufficient && (
                    <span className="flex items-center gap-1 text-xs text-red-500 mt-0.5">
                      <AlertTriangle className="w-3 h-3" /> Insufficient
                    </span>
                  )}
                  {isSelected && !insufficient && (
                    <span className="text-xs text-blue-600 font-medium">Selected</span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {isInsufficient(selected) && (
        <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
          <AlertTriangle className="w-3 h-3" />
          Insufficient {selected.code} balance for this donation amount.
        </p>
      )}
    </div>
  );
}

export default AssetSelector;
