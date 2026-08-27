'use client';

import { useState } from 'react';
import Modal from '@/app/components/common/Modal';
import { Button } from '@/app/components/ui/Button';
import { 
  initiateEscrow, 
  confirmPayment, 
  initiateMilestoneEscrow,
  releaseMilestoneFunds
} from '@/lib/api/payments';

interface PaymentEscrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  commissionId: string;
  milestoneId?: string; // Optional - if provided, this is for a specific milestone
  amount: number;
  asset: string;
  destination: string;
  isReleasePayment?: boolean; // Whether this modal is for releasing funds (after milestone completion)
}

type PaymentStatus =
  'idle' | 'initiating' | 'signing' | 'confirming' | 'success' | 'error' | 'rolling_back';

export default function PaymentEscrowModal({ 
  isOpen, 
  onClose, 
  commissionId,
  milestoneId,
  amount,
  asset,
  destination,
  isReleasePayment = false
}: PaymentEscrowModalProps) {
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const resetState = () => {
    setStatus('idle');
    setErrorMessage(null);
    setPaymentId(null);
  };

  const rollbackPayment = async (id: string) => {
    try {
      setStatus('rolling_back');
      await fetch(`/api/payments/${id}/rollback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (rollbackError) {
      console.error('Rollback failed:', rollbackError);
    }
  };

  const handleFundEscrow = async () => {
    setStatus('initiating');
    setErrorMessage(null);

    try {
      let escrowData;
      
      // Use milestone-specific escrow if we have a milestoneId
      if (milestoneId) {
        escrowData = await initiateMilestoneEscrow({
          commissionId,
          milestoneId,
          amount,
          asset,
          destination,
        });
      } else {
        escrowData = await initiateEscrow({
          commissionId,
          amount,
          asset,
          destination,
        });
      }

      const id = escrowData?.id || escrowData?.paymentId;
      if (id) setPaymentId(id);

      if (!escrowData?.unsignedXdr) {
        throw new Error('Failed to initialize escrow payment');
      }

      setStatus('signing');
      const signResult = await window.freighter?.signTransaction?.(escrowData.unsignedXdr);
      const signedXdr =
        typeof signResult === 'string'
          ? signResult
          : signResult && typeof signResult === 'object'
            ? signResult.signedTxXdr
            : null;

      if (!signedXdr) {
        if (id) await rollbackPayment(id);
        throw new Error('Transaction signing was cancelled');
      }

      setStatus('confirming');
      const confirmData = await confirmPayment(id || '', signedXdr);

      if (!confirmData) {
        if (id) await rollbackPayment(id);
        throw new Error('Payment confirmation failed');
      }

      setStatus('success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error occurred';
      setErrorMessage(message);
      setStatus('error');
    }
  };

  const handleReleaseFunds = async () => {
    if (!milestoneId) {
      setErrorMessage('Milestone ID is required to release funds');
      setStatus('error');
      return;
    }

    setStatus('initiating');
    setErrorMessage(null);

    try {
      const releaseData = await releaseMilestoneFunds(milestoneId);
      
      if (!releaseData?.unsignedXdr) {
        throw new Error('Failed to initialize milestone payment release');
      }

      setStatus('signing');
      const signResult = await window.freighter?.signTransaction?.(releaseData.unsignedXdr);
      const signedXdr =
        typeof signResult === 'string'
          ? signResult
          : signResult && typeof signResult === 'object'
            ? signResult.signedTxXdr
            : null;

      if (!signedXdr) {
        throw new Error('Transaction signing was cancelled');
      }

      setStatus('confirming');
      // Here we would call confirmMilestoneRelease, but using confirmPayment for now
      const confirmData = await confirmPayment(releaseData.id || '', signedXdr);

      if (!confirmData) {
        throw new Error('Payment release confirmation failed');
      }

      setStatus('success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error occurred';
      setErrorMessage(message);
      setStatus('error');
    }
  };

  const handleAction = async () => {
    if (isReleasePayment) {
      await handleReleaseFunds();
    } else {
      await handleFundEscrow();
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Fund Escrow" size="md">
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

        {status === 'rolling_back' && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
            Rolling back incomplete transaction...
          </div>
        )}

        {status !== 'success' && status !== 'rolling_back' && (
          <Button
            onClick={handlePay}
            className="w-full"
            isLoading={status === 'initiating' || status === 'signing' || status === 'confirming'}
            disabled={status === 'initiating' || status === 'signing' || status === 'confirming'}
          >
            {status === 'initiating' && 'Initializing escrow...'}
            {status === 'signing' && 'Waiting for Freighter signature...'}
            {status === 'confirming' && 'Confirming payment...'}
            {status === 'idle' && 'Pay with Freighter'}
            {status === 'error' && 'Try Again'}
          </Button>
        )}

        {status === 'success' && (
          <div className="space-y-3">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
              Escrow funded successfully.
            </div>
            <Button onClick={handleClose} className="w-full" variant="secondary">
              Close
            </Button>
          </div>
        )}

        {status === 'error' && errorMessage && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
            {errorMessage}
          </div>
        )}
      </div>
    </Modal>
  );
}