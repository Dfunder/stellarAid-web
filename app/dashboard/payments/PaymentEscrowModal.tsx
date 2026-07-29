'use client';

import { useState } from 'react';
import Modal from '@/app/components/common/Modal';
import { Button } from '@/app/components/ui/Button';


interface PaymentEscrowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PaymentEscrowModal({ isOpen, onClose }: PaymentEscrowModalProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handlePay = async () => {
    setStatus('loading');
    try {
      const response = await fetch('/api/payments/commissions/1/escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || 'Escrow setup failed');

      const signedXdr = await window.freighter?.signTransaction?.(data.unsignedXdr);
      if (!signedXdr) throw new Error('Freighter signing was cancelled');

      const confirmResponse = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signedXdr }),
      });
      const confirmData = await confirmResponse.json();
      if (!confirmResponse.ok) throw new Error(confirmData?.message || 'Payment confirmation failed');

      setStatus('success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error';
      setStatus('error');
      console.error(message);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Fund Escrow" size="md">
      <div className="space-y-4">
        <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
          <p className="text-sm text-gray-500">Amount breakdown</p>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span>Service fee</span>
            <span>120.00 XLM</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Platform fee</span>
            <span>20.00 XLM</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-gray-200 pt-2 font-semibold dark:border-gray-700">
            <span>Total</span>
            <span>140.00 XLM</span>
          </div>
        </div>

        <Button onClick={handlePay} className="w-full" isLoading={status === 'loading'}>
          Pay with Freighter
        </Button>

        {status === 'success' && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            Escrow funded successfully.
          </div>
        )}
        {status === 'error' && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            Payment failed. Please try again.
          </div>
        )}
      </div>
    </Modal>
  );
}
