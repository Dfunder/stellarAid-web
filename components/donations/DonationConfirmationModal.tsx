'use client';

import React from 'react';
import { Modal, ModalBody, ModalFooter, ModalHeader, Button } from '@/components/ui';
import { Shield, Info } from 'lucide-react';
import type { DonationAsset } from './AssetSelector';

export interface DonationConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  projectTitle: string;
  amount: number;
  asset: DonationAsset;
  estimatedFeeUsd: string;
  walletAddress: string | null;
  anonymous: boolean;
  message?: string;
  isProcessing?: boolean;
}

export function DonationConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  projectTitle,
  amount,
  asset,
  estimatedFeeUsd,
  walletAddress,
  anonymous,
  message,
  isProcessing = false,
}: DonationConfirmationModalProps) {
  const formattedAmount = `${amount.toLocaleString(undefined, {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 7,
  })} ${asset.code}`;

  const usdEquivalent = (amount * asset.usdRate).toFixed(2);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="centered"
      size="md"
      showCloseButton={false}
      aria-labelledby="donation-confirmation-title"
    >
      <ModalHeader onClose={onClose} showCloseButton>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-full">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 id="donation-confirmation-title" className="text-lg font-semibold text-gray-900">
              Confirm Donation
            </h2>
            <p className="text-sm text-gray-500">Review transaction details before signing</p>
          </div>
        </div>
      </ModalHeader>

      <ModalBody className="space-y-5">
        {/* Project */}
        <div>
          <dt className="text-xs font-medium uppercase text-gray-400">Campaign</dt>
          <dd className="mt-1 text-sm font-semibold text-gray-900">{projectTitle}</dd>
        </div>

        {/* Amount */}
        <div>
          <dt className="text-xs font-medium uppercase text-gray-400">Amount</dt>
          <dd className="mt-1 text-lg font-bold text-gray-900">{formattedAmount}</dd>
          <dd className="mt-1 text-xs text-gray-500">≈ ${usdEquivalent} USD</dd>
        </div>

        {/* Asset */}
        <div>
          <dt className="text-xs font-medium uppercase text-gray-400">Asset</dt>
          <dd className="mt-1 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
              {asset.icon}
            </span>
            <span className="text-sm font-medium text-gray-900">{asset.name}</span>
          </dd>
        </div>

        {/* Estimated Fee */}
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
          <Info className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Estimated network fee: ~${estimatedFeeUsd} USD</span>
        </div>

        {/* Wallet Address */}
        <div>
          <dt className="text-xs font-medium uppercase text-gray-400">Wallet Address</dt>
          <dd className="mt-1 font-mono text-xs text-gray-900 break-all">
            {walletAddress ? `${walletAddress.slice(0, 8)}...${walletAddress.slice(-8)}` : 'Not connected'}
          </dd>
        </div>

        {/* Anonymous Toggle Status */}
        <div>
          <dt className="text-xs font-medium uppercase text-gray-400">Anonymous</dt>
          <dd className="mt-1 text-sm font-medium text-gray-900">
            {anonymous ? 'Yes' : 'No'}
          </dd>
        </div>

        {/* Optional Message */}
        {message && (
          <div>
            <dt className="text-xs font-medium uppercase text-gray-400">Message</dt>
            <dd className="mt-1 text-sm text-gray-700 break-words">"{message}"</dd>
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        <Button variant="outline" onClick={onClose} disabled={isProcessing}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          isLoading={isProcessing}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          Confirm & Sign
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default DonationConfirmationModal;