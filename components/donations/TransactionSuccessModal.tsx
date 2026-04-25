'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FaFacebookF, FaLinkedinIn, FaWhatsapp, FaXTwitter } from 'react-icons/fa6';
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Heart,
  Mail,
  RotateCcw,
  Share2,
} from 'lucide-react';
import { Modal, ModalBody, ModalFooter, ModalHeader, Button } from '@/components/ui';
import { getStellarExplorerTxUrl } from '@/lib/stellar/explorer';

export interface DonationReceipt {
  donationId?: string;
  projectId: string;
  projectTitle: string;
  amount: number;
  assetCode: string;
  usdEquivalent: number;
  transactionHash: string;
  donatedAt: string;
  donorName?: string;
  anonymous?: boolean;
  message?: string;
  networkFee?: string;
}

interface TransactionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: DonationReceipt;
  onDonateAnother?: () => void;
  onSendConfirmationEmail?: (receipt: DonationReceipt) => Promise<void>;
}

const CONFETTI_COLORS = ['#3461f9', '#fbbb25', '#10b981', '#8b5cf6', '#f97316'];

function formatDonationAmount(amount: number, assetCode: string) {
  return `${amount.toLocaleString(undefined, {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 7,
  })} ${assetCode}`;
}

function formatUsd(amount: number) {
  return amount.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function shortHash(hash: string) {
  return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
}

function buildReceiptText(receipt: DonationReceipt) {
  return [
    'StellarAid Donation Receipt',
    '',
    `Donation ID: ${receipt.donationId || 'Pending confirmation'}`,
    `Project: ${receipt.projectTitle}`,
    `Project ID: ${receipt.projectId}`,
    `Amount: ${formatDonationAmount(receipt.amount, receipt.assetCode)}`,
    `USD Equivalent: ${formatUsd(receipt.usdEquivalent)}`,
    `Transaction Hash: ${receipt.transactionHash}`,
    `Explorer: ${getStellarExplorerTxUrl(receipt.transactionHash)}`,
    `Date: ${new Date(receipt.donatedAt).toLocaleString()}`,
    `Donor: ${receipt.anonymous ? 'Anonymous' : receipt.donorName || 'StellarAid donor'}`,
    receipt.networkFee ? `Network Fee: ${receipt.networkFee}` : null,
    receipt.message ? `Message: ${receipt.message}` : null,
  ]
    .filter(Boolean)
    .join('\n');
}

export function TransactionSuccessModal({
  isOpen,
  onClose,
  receipt,
  onDonateAnother,
  onSendConfirmationEmail,
}: TransactionSuccessModalProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const emailedHashRef = useRef<string | null>(null);

  const explorerUrl = getStellarExplorerTxUrl(receipt.transactionHash);
  const shareText = `I just donated ${formatDonationAmount(receipt.amount, receipt.assetCode)} to ${receipt.projectTitle} on StellarAid.`;

  const confetti = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => ({
        id: index,
        left: `${8 + ((index * 23) % 84)}%`,
        color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
        delay: `${(index % 6) * 0.11}s`,
        duration: `${1.7 + (index % 4) * 0.15}s`,
        rotate: `${(index % 2 === 0 ? 1 : -1) * (25 + index * 7)}deg`,
      })),
    []
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setShareUrl(`${window.location.origin}/projects/${receipt.projectId}`);
  }, [isOpen, receipt.projectId]);

  useEffect(() => {
    if (!isOpen || !onSendConfirmationEmail || emailedHashRef.current === receipt.transactionHash) {
      return;
    }

    emailedHashRef.current = receipt.transactionHash;
    setEmailStatus('sending');

    onSendConfirmationEmail(receipt)
      .then(() => setEmailStatus('sent'))
      .catch(() => setEmailStatus('failed'));
  }, [isOpen, onSendConfirmationEmail, receipt]);

  async function handleCopyHash() {
    try {
      await navigator.clipboard.writeText(receipt.transactionHash);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function handleDownloadReceipt() {
    const blob = new Blob([buildReceiptText(receipt)], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `stellaraid-receipt-${shortHash(receipt.transactionHash)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(shareUrl);
  const shareLinks = {
    x: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };

  const receiptRows = [
    ['Project', receipt.projectTitle],
    ['Amount', formatDonationAmount(receipt.amount, receipt.assetCode)],
    ['USD value', formatUsd(receipt.usdEquivalent)],
    ['Date', new Date(receipt.donatedAt).toLocaleString()],
    ['Donor', receipt.anonymous ? 'Anonymous' : receipt.donorName || 'StellarAid donor'],
    ['Network fee', receipt.networkFee || 'Estimated at submission'],
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="centered"
      size="lg"
      showCloseButton={false}
      aria-labelledby="transaction-success-title"
      className="max-h-[92vh] overflow-y-auto"
    >
      <style>{`
        @keyframes tx-confetti-fall {
          0% { opacity: 0; transform: translate3d(0, -36px, 0) rotate(0deg) scale(0.8); }
          15% { opacity: 1; }
          100% { opacity: 0; transform: translate3d(0, 92px, 0) rotate(var(--tx-rotate)) scale(1); }
        }

        @keyframes tx-success-pop {
          0% { transform: scale(0.72); opacity: 0; }
          65% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        .tx-confetti-piece {
          animation: tx-confetti-fall var(--tx-duration) cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
          animation-delay: var(--tx-delay);
        }

        .tx-success-mark {
          animation: tx-success-pop 520ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }
      `}</style>

      <ModalHeader onClose={onClose} showCloseButton>
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-11 shrink-0">
            {confetti.map((piece) => (
              <span
                key={piece.id}
                className="tx-confetti-piece absolute top-0 h-2.5 w-1.5 rounded-sm"
                style={
                  {
                    left: piece.left,
                    backgroundColor: piece.color,
                    '--tx-delay': piece.delay,
                    '--tx-duration': piece.duration,
                    '--tx-rotate': piece.rotate,
                  } as React.CSSProperties
                }
              />
            ))}
            <span className="tx-success-mark absolute inset-1 flex items-center justify-center rounded-full bg-success-500 text-white shadow-stellar">
              <Check className="h-6 w-6" />
            </span>
          </div>
          <div>
            <h2 id="transaction-success-title" className="text-lg font-semibold text-neutral-900">
              Donation confirmed
            </h2>
            <p className="text-sm text-neutral-500">Your Stellar transaction was successful.</p>
          </div>
        </div>
      </ModalHeader>

      <ModalBody className="space-y-6">
        <div className="rounded-xl border border-success-100 bg-success-50 p-4">
          <p className="text-sm font-semibold text-success-700">You donated</p>
          <p className="mt-1 text-3xl font-extrabold text-neutral-900">
            {formatDonationAmount(receipt.amount, receipt.assetCode)}
          </p>
          <p className="mt-1 text-sm text-neutral-600">
            to <span className="font-semibold text-neutral-900">{receipt.projectTitle}</span>
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-neutral-900">Transaction Hash</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopyHash}
              className="gap-2 text-sm"
            >
              <Copy className="h-4 w-4" />
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 font-mono text-xs text-neutral-700 break-all">
            {receipt.transactionHash}
          </div>
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700"
          >
            View on Stellar explorer
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-neutral-900">Receipt</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadReceipt}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
          <dl className="grid gap-3 sm:grid-cols-2">
            {receiptRows.map(([label, value]) => (
              <div key={label} className="rounded-lg bg-neutral-50 px-3 py-2">
                <dt className="text-xs font-medium uppercase text-neutral-400">{label}</dt>
                <dd className="mt-1 text-sm font-semibold text-neutral-900">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="flex items-start gap-2 rounded-xl border border-primary-100 bg-primary-50 px-3 py-2 text-sm text-primary-700">
            <Mail className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              {emailStatus === 'sending' && 'Sending your confirmation email...'}
              {emailStatus === 'sent' && 'Confirmation email sent.'}
              {emailStatus === 'failed' && 'Email delivery will be retried by support.'}
              {emailStatus === 'idle' && 'A confirmation email will be sent to your account.'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="sr-only">Share donation</span>
            <a
              href={shareLinks.x}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-600"
              aria-label="Share on X"
            >
              <FaXTwitter className="h-4 w-4" />
            </a>
            <a
              href={shareLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-600"
              aria-label="Share on Facebook"
            >
              <FaFacebookF className="h-4 w-4" />
            </a>
            <a
              href={shareLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-600"
              aria-label="Share on WhatsApp"
            >
              <FaWhatsapp className="h-4 w-4" />
            </a>
            <a
              href={shareLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-600"
              aria-label="Share on LinkedIn"
            >
              <FaLinkedinIn className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
          <Share2 className="h-4 w-4 shrink-0 text-neutral-400" />
          <span>Share your support to help this campaign reach more donors.</span>
        </div>
      </ModalBody>

      <ModalFooter className="flex-col items-stretch sm:flex-row sm:justify-between">
        <Button type="button" variant="outline" onClick={onDonateAnother} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Donate to Another Project
        </Button>
        <Button type="button" onClick={onClose} className="gap-2">
          <Heart className="h-4 w-4" />
          Done
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default TransactionSuccessModal;

