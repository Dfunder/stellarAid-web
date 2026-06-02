'use client';

import React, { useMemo, useState } from 'react';
import { Switch } from '@/components/ui';
import WalletConnectModal from './WalletConnectModal';
import { useWalletStore } from '@/store/walletStore';
import { getBaseFee, formatFee } from '@/lib/stellar/formatting';
import { toastSuccess, toastError, toastInfo } from '@/utils/toast';

const ASSETS = ['XLM', 'USDC', 'AQUA'];
const PRESETS = [10, 25, 50];

export default function DonationWidget() {
  const { address, connectedWallet } = useWalletStore();
  const [asset, setAsset] = useState<string>('XLM');
  const [preset, setPreset] = useState<number | null>(PRESETS[0]);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [anonymous, setAnonymous] = useState<boolean>(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const amount = useMemo(() => {
    if (preset !== null) return preset;
    const parsed = parseFloat(customAmount || '0');
    return isNaN(parsed) ? 0 : parsed;
  }, [preset, customAmount]);

  const feeEstimate = useMemo(() => {
    try {
      const base = getBaseFee();
      return formatFee(base);
    } catch (err) {
      return '—';
    }
  }, []);

  function openWalletModal() {
    setIsWalletModalOpen(true);
  }

  async function handleDonate() {
    if (!address) {
      openWalletModal();
      return;
    }

    if (amount <= 0) {
      toastError('Enter a valid donation amount');
      return;
    }

    setIsProcessing(true);
    try {
      const payload = {
        to: 'GDONATIONDESTINATIONEXAMPLE',
        asset,
        amount: amount.toString(),
        anonymous,
      };

      if (connectedWallet && typeof (connectedWallet as any).sign === 'function') {
        await (connectedWallet as any).sign(payload);
        toastSuccess('Donation signed — submitting to network');
      } else {
        toastInfo('Opening wallet to complete donation');
      }
    } catch (err: any) {
      console.error('Donation error:', err);
      toastError(err?.message || 'Donation failed');
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-card border border-border rounded-xl p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-foreground mb-3">Quick Donate</h3>

      <label className="block text-sm text-muted-foreground mb-1">Asset</label>
      <div className="mb-3">
        <select
          value={asset}
          onChange={(e) => setAsset(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2 bg-background text-foreground"
        >
          {ASSETS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      <label className="block text-sm text-muted-foreground mb-1">Amount</label>
      <div className="flex gap-2 mb-3">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => {
              setPreset(p);
              setCustomAmount('');
            }}
            className={`px-3 py-2 rounded-lg border text-sm font-semibold ${
              preset === p ? 'bg-primary text-white border-primary' : 'bg-background'
            }`}
          >
            ${p}
          </button>
        ))}
      </div>

      <input
        type="number"
        placeholder="Custom amount (USD)"
        value={customAmount}
        onChange={(e) => {
          setCustomAmount(e.target.value);
          setPreset(null);
        }}
        className="w-full mb-3 px-3 py-2 border border-border rounded-lg bg-background text-foreground"
      />

      <div className="flex items-center justify-between mb-3">
        <div>
          <label className="text-sm text-muted-foreground">Donate anonymously</label>
        </div>
        <Switch checked={anonymous} onCheckedChange={setAnonymous} />
      </div>

      <div className="text-sm text-muted-foreground mb-4">Estimated network fee: <span className="font-medium text-foreground">{feeEstimate}</span></div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleDonate}
          disabled={isProcessing}
          className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-60"
        >
          {address ? (isProcessing ? 'Processing…' : 'Donate') : 'Connect Wallet to Donate'}
        </button>
        <button
          type="button"
          onClick={() => setPreset(null) || setCustomAmount('')}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium bg-background"
        >
          Reset
        </button>
      </div>

      <WalletConnectModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onWalletConnect={(wallet) => {
          useWalletStore.getState().connect(wallet, 'GEXAMPLEADDRESS');
          setIsWalletModalOpen(false);
          toastSuccess('Wallet connected');
        }}
      />
    </div>
  );
}
