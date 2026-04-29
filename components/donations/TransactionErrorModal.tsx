'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { parseStellarError } from '@/lib/stellar/errorHandler';
import {
  AlertTriangle,
  Clock,
  HelpCircle,
  RefreshCw,
  ShieldAlert,
  WalletCards,
  WifiOff,
  XCircle,
} from 'lucide-react';
import { Modal, ModalBody, ModalFooter, ModalHeader, Button } from '@/components/ui';

export type TransactionFailureType =
  | 'insufficient_balance'
  | 'timeout'
  | 'rejected'
  | 'network'
  | 'wallet'
  | 'unknown';

export interface TransactionErrorDetails {
  type: TransactionFailureType;
  message: string;
  rawMessage?: string;
  projectId?: string;
  projectTitle?: string;
  amount?: number;
  assetCode?: string;
  supportCode?: string;
}

interface TransactionErrorModalProps {
  isOpen: boolean;
  error: TransactionErrorDetails;
  onRetry: () => void;
  onCancel: () => void;
}

const TYPE_COPY: Record<
  TransactionFailureType,
  {
    title: string;
    description: string;
    icon: React.ElementType;
    reasons: string[];
    tips: string[];
  }
> = {
  insufficient_balance: {
    title: 'Insufficient balance',
    description: 'Your wallet does not have enough available funds for this donation and network fee.',
    icon: WalletCards,
    reasons: [
      'The donation amount is higher than your spendable balance.',
      'A small XLM reserve is required for Stellar accounts.',
      'The selected asset may not be available in this wallet.',
    ],
    tips: [
      'Try a smaller amount.',
      'Switch to another supported asset.',
      'Add funds to your wallet, then retry the donation.',
    ],
  },
  timeout: {
    title: 'Transaction timed out',
    description: 'The Stellar network did not confirm the transaction before the request expired.',
    icon: Clock,
    reasons: [
      'The wallet approval took too long.',
      'Network confirmation was delayed.',
      'The browser tab lost connectivity during submission.',
    ],
    tips: [
      'Check whether your wallet shows a completed transaction.',
      'Refresh your wallet balance.',
      'Try again in a moment if no transaction was created.',
    ],
  },
  rejected: {
    title: 'Transaction cancelled',
    description: 'The transaction was rejected or cancelled before it reached the network.',
    icon: XCircle,
    reasons: [
      'The wallet approval prompt was declined.',
      'The wallet window was closed.',
      'The signing session expired.',
    ],
    tips: [
      'Open your wallet before retrying.',
      'Approve the donation when the wallet prompt appears.',
      'Confirm the destination and amount before signing.',
    ],
  },
  network: {
    title: 'Network connection issue',
    description: 'StellarAid could not reach the donation service or Stellar network.',
    icon: WifiOff,
    reasons: [
      'Your internet connection changed during submission.',
      'The donation API did not respond in time.',
      'The Stellar Horizon endpoint may be temporarily unavailable.',
    ],
    tips: [
      'Check your internet connection.',
      'Wait a few seconds, then retry.',
      'Avoid closing the wallet approval window while the transaction submits.',
    ],
  },
  wallet: {
    title: 'Wallet issue',
    description: 'Your wallet could not sign or submit this transaction.',
    icon: ShieldAlert,
    reasons: [
      'The wallet is disconnected or locked.',
      'The active wallet account changed.',
      'The selected asset may require a trustline.',
    ],
    tips: [
      'Reconnect or unlock your wallet.',
      'Confirm you are using the intended Stellar account.',
      'Choose XLM if the selected asset is not configured.',
    ],
  },
  unknown: {
    title: 'Donation failed',
    description: 'Something went wrong before the donation could be confirmed.',
    icon: AlertTriangle,
    reasons: [
      'The wallet, API, or network returned an unexpected error.',
      'The transaction may have been interrupted.',
      'The campaign details may have changed during submission.',
    ],
    tips: [
      'Retry the donation once.',
      'Check your wallet activity for a matching transaction.',
      'Contact support with the code below if the issue continues.',
    ],
  },
};

function extractMessage(error: unknown) {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message?: unknown }).message || '');
  }
  return '';
}

export function classifyTransactionError(error: unknown): TransactionFailureType {
  // Use the Stellar error handler for richer code-based classification (#143)
  const parsed = parseStellarError(error);
  if (parsed.code === 'USER_REJECTED') return 'rejected';
  if (parsed.code === 'INSUFFICIENT_FUNDS' || parsed.code === 'LOW_RESERVE') return 'insufficient_balance';
  if (parsed.code === 'NETWORK_ERROR') return 'network';

  const message = extractMessage(error).toLowerCase();

  if (message.includes('insufficient') || message.includes('balance') || message.includes('reserve')) {
    return 'insufficient_balance';
  }
  if (message.includes('timeout') || message.includes('timed out') || message.includes('expired')) {
    return 'timeout';
  }
  if (
    message.includes('reject') ||
    message.includes('denied') ||
    message.includes('declined') ||
    message.includes('cancel')
  ) {
    return 'rejected';
  }
  if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('econn') ||
    message.includes('enotfound') ||
    message.includes('horizon')
  ) {
    return 'network';
  }
  if (
    message.includes('wallet') ||
    message.includes('freighter') ||
    message.includes('albedo') ||
    message.includes('lobstr') ||
    message.includes('trustline') ||
    message.includes('sign')
  ) {
    return 'wallet';
  }

  return 'unknown';
}

export function createTransactionErrorDetails(
  error: unknown,
  context: Omit<TransactionErrorDetails, 'type' | 'message' | 'rawMessage' | 'supportCode'>
): TransactionErrorDetails {
  const type = classifyTransactionError(error);
  const supportCode = `SA-${Date.now().toString(36).toUpperCase()}`;
  const rawMessage = extractMessage(error);

  return {
    ...context,
    type,
    message: TYPE_COPY[type].description,
    rawMessage,
    supportCode,
  };
}

function logTransactionFailure(error: Error, context: Record<string, unknown>) {
  console.error('[Donation] Transaction failure', { error, ...context });

  if (typeof window === 'undefined') {
    return;
  }

  const sentry = (
    window as Window & {
      Sentry?: {
        captureException?: (capturedError: Error, options?: { extra?: Record<string, unknown> }) => void;
      };
    }
  ).Sentry;

  sentry?.captureException?.(error, { extra: context });
}

export function TransactionErrorModal({
  isOpen,
  error,
  onRetry,
  onCancel,
}: TransactionErrorModalProps) {
  const loggedCodeRef = useRef<string | null>(null);
  const copy = TYPE_COPY[error.type] || TYPE_COPY.unknown;
  const Icon = copy.icon;

  const supportHref = useMemo(() => {
    const subject = encodeURIComponent(`Donation failed: ${error.supportCode || 'no support code'}`);
    const body = encodeURIComponent(
      [
        'Hi StellarAid support,',
        '',
        'I need help with a failed donation transaction.',
        '',
        `Support code: ${error.supportCode || 'Unavailable'}`,
        `Project: ${error.projectTitle || error.projectId || 'Unavailable'}`,
        error.amount && error.assetCode ? `Amount: ${error.amount} ${error.assetCode}` : null,
        error.rawMessage ? `Error: ${error.rawMessage}` : null,
      ]
        .filter(Boolean)
        .join('\n')
    );

    return `mailto:support@stellaraid.org?subject=${subject}&body=${body}`;
  }, [error]);

  useEffect(() => {
    if (!isOpen || loggedCodeRef.current === error.supportCode) {
      return;
    }

    loggedCodeRef.current = error.supportCode || null;
    logTransactionFailure(new Error(error.rawMessage || error.message), {
      type: 'donation-transaction-failure',
      failureType: error.type,
      supportCode: error.supportCode,
      projectId: error.projectId,
      projectTitle: error.projectTitle,
      amount: error.amount,
      assetCode: error.assetCode,
    });
  }, [error, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      variant="centered"
      size="lg"
      showCloseButton={false}
      aria-labelledby="transaction-error-title"
      className="max-h-[92vh] overflow-y-auto"
    >
      <ModalHeader onClose={onCancel} showCloseButton>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-danger-50 text-danger-500">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h2 id="transaction-error-title" className="text-lg font-semibold text-neutral-900">
              {copy.title}
            </h2>
            <p className="text-sm text-neutral-500">Your donation was not completed.</p>
          </div>
        </div>
      </ModalHeader>

      <ModalBody className="space-y-6">
        <div className="rounded-xl border border-danger-100 bg-danger-50 p-4 text-sm text-danger-700">
          {error.rawMessage || error.message}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-xl border border-neutral-200 bg-white p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
              <HelpCircle className="h-4 w-4 text-neutral-400" />
              Common reasons
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-neutral-600">
              {copy.reasons.map((reason) => (
                <li key={reason} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-300" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-neutral-200 bg-white p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
              <RefreshCw className="h-4 w-4 text-neutral-400" />
              Troubleshooting
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-neutral-600">
              {copy.tips.map((tip) => (
                <li key={tip} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-400" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="rounded-xl bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
          <span className="font-semibold text-neutral-900">Support code:</span>{' '}
          <span className="font-mono">{error.supportCode || 'Unavailable'}</span>
        </div>
      </ModalBody>

      <ModalFooter className="flex-col items-stretch sm:flex-row sm:justify-between">
        <a
          href={supportHref}
          className="inline-flex items-center justify-center rounded-lg border-2 border-blue-600 px-4 py-2 text-base font-medium text-blue-600 transition hover:bg-blue-50"
        >
          Contact Support
        </a>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Return to Project
          </Button>
          <Button type="button" onClick={onRetry} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
}

export default TransactionErrorModal;
